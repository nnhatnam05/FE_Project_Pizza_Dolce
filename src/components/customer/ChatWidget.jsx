import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axiosConfig';
import useWebSocket from '../../hooks/useWebSocket';
import './ChatWidget.css';

const ChatWidget = ({ inline = false, title = 'Assistant', onQuickQuestionClick }) => {
	const browserLang = (navigator.language || 'en').toLowerCase().startsWith('vi') ? 'vi' : 'en';
	const [open, setOpen] = useState(true);
	const [sessionId, setSessionId] = useState('');
	const [language, setLanguage] = useState(localStorage.getItem('chatLang') || browserLang);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const { connected, subscribe, unsubscribe, checkConnection, forceReconnect } = useWebSocket();
	const subscriptionRef = useRef(null);
	const bottomRef = useRef(null);
	const bodyRef = useRef(null);
	const streamingRef = useRef({ active: false, buffer: '' });
	const [typing, setTyping] = useState(false);
	const [showQuick, setShowQuick] = useState(true);
	const greetedRef = useRef(false);
	const portalRef = useRef(null);
	const messageBufferRef = useRef(''); // Thêm buffer riêng cho message
	const connectionRetryRef = useRef(0); // Thêm counter cho retry
	const inputRef = useRef(null); // Ref cho ô nhập liệu
	const userTypingRef = useRef(false); // Đánh dấu đang gõ để giữ focus
	const [showRating, setShowRating] = useState(false);
	const [rating, setRating] = useState(0);
	const [ratingNote, setRatingNote] = useState('');
	const ratingPresets = {
		1: ['Thái độ chưa tốt','Trả lời chậm','Không hữu ích'],
		2: ['Chưa hài lòng','Chưa giải quyết vấn đề','Cần cải thiện'],
		3: ['Bình thường','Tạm ổn','Có thể tốt hơn'],
		4: ['Khá tốt','Hữu ích','Phản hồi nhanh'],
		5: ['Rất tuyệt vời','Rất hài lòng','Hỗ trợ xuất sắc']
	};
	const closedSessionIdRef = useRef('');
	const [isStarted, setIsStarted] = useState(false);

	useEffect(() => {
		if (inline) return; // chỉ tạo portal khi không ở inline mode
		const el = document.createElement('div');
		portalRef.current = el;
		document.body.appendChild(el);
		return () => { try { document.body.removeChild(el); } catch {} };
	}, [inline]);

	const quickEn = [
		"What are your delivery hours?",
		"What pizzas do you recommend?",
		"How much is the delivery fee?",
		"Do you have vegetarian options?"
	];
	const quickVi = [
		"Giờ giao hàng?",
		"Gợi ý pizza ngon?",
		"Phí giao hàng bao nhiêu?",
		"Có lựa chọn chay không?"
	];

	// Luôn giữ focus vào input khi người dùng đang gõ (khắc phục mất focus sau 1 ký tự)
	useEffect(() => {
		if (!userTypingRef.current) return;
		const el = inputRef.current;
		if (!el) return;
		if (document.activeElement !== el) {
			el.focus();
			try { el.setSelectionRange(input.length, input.length); } catch {}
		}
	}, [input]);

	const autoScrollIfNearBottom = useCallback(() => {
		const el = bodyRef.current;
		if (!el) return;
		const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
		if (distanceToBottom < 60) {
			bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	}, []);

	// Trước khi tạo/greet session, lấy tên từ /api/customer/me/detail và lưu localStorage
	useEffect(() => {
		(async () => {
			try {
				const res = await api.get('/customer/me/detail');
				const name = res?.data?.name || res?.data?.fullName || res?.data?.username;
				if (name) localStorage.setItem('customerName', name);
			} catch {}
		})();
	}, []);

	const greetIfNeeded = useCallback(async (sid) => {
		try {
			await api.post('/chat/greet', { sessionId: sid });
			console.log('Greeting sent for new session');
		} catch (e) {
			console.warn('Greeting error', e);
		}
	}, []);

	const loadHistory = useCallback(async (sid) => {
		try {
			console.log('Loading chat history for session:', sid);
			const res = await api.get('/chat/history', { params: { sessionId: sid } });
			if (Array.isArray(res.data)) {
				console.log('Chat history loaded:', res.data);
				const formattedMessages = res.data.map(m => ({ 
					sender: m.sender, 
					content: m.contentMasked,
					id: m.id || Date.now(),
					timestamp: m.createdAt || new Date().toISOString(),
					senderName: m.senderName || null
				}));
				setMessages(formattedMessages);
				console.log('Formatted messages set:', formattedMessages);
			}
		} catch (error) {
			console.error('Error loading chat history:', error);
		}
	}, []);

	// Tách riêng useEffect cho language
	useEffect(() => {
		if (!localStorage.getItem('chatLang')) {
			localStorage.setItem('chatLang', language);
		}
	}, [language]);

	// Tách riêng useEffect cho WebSocket subscription
	useEffect(() => {
		if (!isStarted || !sessionId) return;
		
		// Nếu không connected, thử check connection
		if (!connected) {
			console.log('WebSocket not connected, checking connection...');
			checkConnection();
			return;
		}
		
		
		if (!window.__chatSubscribedSessionId) {
			window.__chatSubscribedSessionId = null;
		}
		if (window.__chatSubscribedSessionId === sessionId && subscriptionRef.current) {
			console.log('Already subscribed to this session, skip re-subscribe');
			return;
		}
		
		// Cleanup subscription cũ nếu có
		if (subscriptionRef.current) {
			unsubscribe(subscriptionRef.current);
			subscriptionRef.current = null;
		}

		// Tạo subscription mới
		const sub = subscribe(`/topic/chat/${sessionId}`, (payload) => {
			try {
				// Chỉ parse khi trông giống JSON
				let data = null;
				if (typeof payload === 'object') {
					data = payload;
				} else if (typeof payload === 'string' && (payload.startsWith('{') || payload.startsWith('['))) {
					try { data = JSON.parse(payload); } catch { data = null; }
				}
				// Debug nhẹ
				// console.log('WebSocket payload:', payload);
				// console.log('Parsed data:', data);
				
				if (data && data.type === 'start') {
					// Chống double start do trùng subscription/echo
					if (streamingRef.current.active) {
						console.log('Start received while streaming active, skip');
						return;
					}
					console.log('Streaming started');
					streamingRef.current = { active: true, buffer: '' };
					messageBufferRef.current = '';
					setTyping(true);
					
					// Tạo bot message rỗng nếu cuối danh sách chưa có bot rỗng
					setMessages(prev => {
						const lastMessage = prev[prev.length - 1];
						if (lastMessage && lastMessage.sender === 'bot' && (lastMessage.content ?? '') === '') {
							return prev; // đã có bot rỗng, không tạo thêm
						}
						const newMessage = { sender: 'bot', content: '', id: Date.now(), timestamp: new Date().toISOString() };
						console.log('Created new bot message:', newMessage);
						return [...prev, newMessage];
					});
					return;
				}
				
				if (data && data.type === 'delta') {
					// Bỏ qua delta đến sau khi đã end (tránh ghi đè nội dung)
					if (!streamingRef.current.active) {
						console.log('Delta received after end, ignore');
						return;
					}
					console.log('Delta received:', data.delta);
					const delta = data.delta || '';
					streamingRef.current.buffer += delta;
					messageBufferRef.current += delta;
					console.log('Current message buffer:', messageBufferRef.current);
					setMessages(prev => {
						const newMessages = [...prev];
						const lastMessage = newMessages[newMessages.length - 1];
						if (lastMessage && lastMessage.sender === 'bot') {
							newMessages[newMessages.length - 1] = { ...lastMessage, content: messageBufferRef.current };
						} else {
							newMessages.push({ sender: 'bot', content: messageBufferRef.current, id: Date.now(), timestamp: new Date().toISOString() });
						}
						return [...newMessages];
					});
					autoScrollIfNearBottom();
					return;
				}
				
				if (data && data.type === 'end') {
					console.log('Streaming ended, final content:', messageBufferRef.current);
					console.log('Final message length:', messageBufferRef.current.length);
					const finalContent = messageBufferRef.current;
					streamingRef.current = { active: false, buffer: '' };
					setTyping(false);
					setMessages(prev => {
						const newMessages = [...prev];
						const lastMessage = newMessages[newMessages.length - 1];
						if (lastMessage && lastMessage.sender === 'bot') {
							return newMessages.map((msg, idx) => idx === newMessages.length - 1 ? { ...msg, content: finalContent } : msg);
						}
						return newMessages;
					});
					messageBufferRef.current = '';
					return;
				}
				// Agent or user message (non-stream) after handover
				if (data && (data.type === 'agent' || data.type === 'user')) {
					if (data.type === 'user') {
						// echo từ chính khách – bỏ qua
						return;
					}
					const text = data.content || '';
					if (text) {
						setMessages(prev => {
							const last = prev[prev.length - 1];
							if ((data.messageId && last && last.messageId === data.messageId) || (last && last.sender==='bot' && last.content===text)) return prev;
							return [...prev, { sender: 'agent', content: text, id: Date.now(), timestamp: new Date().toISOString(), messageId: data.messageId, senderName: data.senderName || 'Agent' }];
						});
						autoScrollIfNearBottom();
					}
					return;
				}
				// Session closed by staff
				if (data && data.type === 'closed') {
					setShowRating(true);
					// Unsubscribe khỏi phiên cũ
					try {
						if (subscriptionRef.current) {
							unsubscribe(subscriptionRef.current);
							subscriptionRef.current = null;
							window.__chatSubscribedSessionId = null;
						}
					} catch {}
					// Ghi nhớ session vừa đóng để chấm điểm
					closedSessionIdRef.current = sessionId;
					// Reset local session (chưa tạo session mới vội)
					localStorage.removeItem('chatSessionId');
					setSessionId('');
					setMessages([]);
					messageBufferRef.current = '';
					streamingRef.current = { active:false, buffer:'' };
					setIsStarted(false);
					return;
				}
				// Fallback text nếu không phải JSON streaming
				const content = typeof payload === 'string' ? payload : '';
				if (content) {
					setMessages(prev => [...prev, { sender: 'bot', content }]);
					autoScrollIfNearBottom();
				}
			} catch (error) {
				// Không log lỗi ồn ào khi payload là text thuần
				console.warn('WebSocket non-JSON payload handled as text');
			}
		});
		
		if (sub) {
			subscriptionRef.current = sub;
			window.__chatSubscribedSessionId = sessionId;
			
			// Chỉ load history nếu chưa có messages
			if (messages.length === 0) {
				console.log('No messages in state, loading chat history...');
				loadHistory(sessionId);
			} else {
				console.log('Messages already in state, skipping history load');
			}
			
			greetIfNeeded(sessionId);
			connectionRetryRef.current = 0; // Reset retry counter
		} else {
			// Nếu subscribe thất bại, thử reconnect
			console.warn('Failed to subscribe, attempting reconnect...');
			if (connectionRetryRef.current < 3) {
				connectionRetryRef.current++;
				setTimeout(() => {
					forceReconnect();
				}, 2000 * connectionRetryRef.current); // Exponential backoff
			}
		}
		
	}, [isStarted, sessionId, connected, subscribe, unsubscribe, loadHistory, greetIfNeeded, autoScrollIfNearBottom, checkConnection, forceReconnect]);

	// Cleanup khi component unmount
	useEffect(() => {
		return () => {
			if (subscriptionRef.current) {
				unsubscribe(subscriptionRef.current);
				subscriptionRef.current = null;
			}
		};
	}, []);

	const ensureSession = useCallback(async () => {
		if (sessionId) {
			// Kiểm tra xem session có còn tồn tại không
			try {
				await api.get('/chat/history', { params: { sessionId } });
				return sessionId;
			} catch (error) {
				// Session không tồn tại, tạo mới
				console.log('Session không tồn tại, tạo mới...');
				
				// Giữ lại user messages khi tạo session mới
				const userMessages = messages.filter(m => m.sender === 'user');
				console.log('Preserving user messages:', userMessages);
				
				localStorage.removeItem('chatSessionId');
				setSessionId('');
				
				// Giữ lại user messages trong state
				if (userMessages.length > 0) {
					setMessages(userMessages);
				}
			}
		}
		
		// Tạo session mới
		const res = await api.post('/chat/session', { language });
		const newSessionId = res.data.sessionId;
		setSessionId(newSessionId);
		localStorage.setItem('chatSessionId', newSessionId);
		return newSessionId;
	}, [sessionId, language, messages]);

	const sendText = useCallback(async (text) => {
		const t = text.trim();
		if (!t) return;
		
		console.log('Sending user message:', t);
		
		// Thêm user message vào state TRƯỚC KHI gửi API
		const userMessage = { 
			sender: 'user', 
			content: t,
			id: Date.now(),
			timestamp: new Date().toISOString(),
			senderName: (localStorage.getItem('customerName') || 'Khách vãng lai')
		};
		
		setMessages(prev => {
			console.log('Adding user message to state:', userMessage);
			console.log('Current messages before adding:', prev);
			const newMessages = [...prev, userMessage];
			console.log('Messages after adding user message:', newMessages);
			return newMessages;
		});
		
		try {
			const sid = await ensureSession();
			console.log('Sending message to API with sessionId:', sid);
			const displayName = localStorage.getItem('customerName') || '';
			await api.post('/chat/message', { sessionId: sid, message: t, displayName });
		} catch (error) {
			console.error('Lỗi khi gửi tin nhắn:', error);
			// Nếu có lỗi, thử tạo session mới
			try {
				localStorage.removeItem('chatSessionId');
				setSessionId('');
				const newSid = await ensureSession();
				await api.post('/chat/message', { sessionId: newSid, message: t, displayName: (localStorage.getItem('customerName')||'') });
			} catch (retryError) {
				console.error('Lỗi khi retry:', retryError);
				setMessages(prev => [...prev, { 
					sender: 'bot', 
					content: language === 'vi' ? 
						'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' : 
						'Sorry, an error occurred. Please try again.',
					id: Date.now(),
					timestamp: new Date().toISOString()
				}]);
			}
		}
	}, [ensureSession, language]);

	const sendMessage = useCallback(async () => {
		await sendText(input);
		setInput('');
	}, [sendText, input]);

	const handleQuickQuestion = useCallback(async (question) => {
		await sendText(question);
		// Gọi callback nếu có để thông báo cho parent component
		if (onQuickQuestionClick) {
			onQuickQuestionClick(question);
		}
	}, [sendText, onQuickQuestionClick]);

	const canHandover = useCallback(() => {
		return true;
	}, []);

	const handover = useCallback(async () => {
		if (!sessionId) return;
		await ensureSession();
		await api.post(`/chat/handover`, { sessionId });
		setMessages(prev => [...prev, { sender: 'bot', content: language === 'vi' ? 'Đã chuyển cuộc trò chuyện cho nhân viên hỗ trợ.' : 'Conversation handed over to a human agent.' }]);
	}, [sessionId, ensureSession, language]);

	const resetChat = useCallback(async () => {
		// Xóa session cũ
		if (sessionId) {
			try {
				await api.delete(`/admin/chat/sessions/${sessionId}`);
			} catch (error) {
				// Ignore error if not admin
				console.log('Không thể xóa session (có thể không phải admin)');
			}
		}
		
		// Clear localStorage và state
		localStorage.removeItem('chatSessionId');
		setSessionId('');
		setMessages([]);
		greetedRef.current = false;
		messageBufferRef.current = ''; // Reset message buffer
		
		// Tạo session mới
		const newSessionId = await ensureSession();
		console.log('Đã tạo session mới:', newSessionId);
	}, [sessionId, ensureSession]);

	// Function để test streaming (debug)
	const testStreaming = useCallback(() => {
		console.log('=== STREAMING DEBUG INFO ===');
		console.log('Current sessionId:', sessionId);
		console.log('WebSocket connected:', connected);
		console.log('Streaming active:', streamingRef.current.active);
		console.log('Streaming buffer:', streamingRef.current.buffer);
		console.log('Message buffer:', messageBufferRef.current);
		console.log('Current messages:', messages);
		console.log('Typing state:', typing);
		console.log('===========================');
	}, [sessionId, connected, messages, typing]);

	const createNewSessionAndGreet = useCallback(async ()=>{
		try {
			// Đồng bộ tên theo trạng thái hiện tại
			try {
				const resMe = await api.get('/customer/me/detail');
				const nameNow = resMe?.data?.name || resMe?.data?.fullName || resMe?.data?.username;
				if (nameNow) localStorage.setItem('customerName', nameNow); else localStorage.removeItem('customerName');
			} catch (e) {
				// chưa đăng nhập
				localStorage.removeItem('customerName');
			}
			const res = await api.post('/chat/session', { language });
			const newSid = res.data.sessionId;
			setSessionId(newSid);
			localStorage.setItem('chatSessionId', newSid);
			await api.post('/chat/greet', { sessionId: newSid });
			setMessages([]);
			setIsStarted(true);
		} catch (e) { console.warn('Error creating new session:', e);} 
	}, [language]);

	const submitRating = useCallback(async () => {
		const sidToRate = closedSessionIdRef.current || sessionId;
		if (!sidToRate || rating <= 0) { setShowRating(false); return; }
		try {
			await api.post('/chat/rate', { sessionId: sidToRate, rating });
		} catch (e) { console.warn('rate error', e); }
		setShowRating(false);
		// Sau khi đánh giá xong, hiển thị nút bắt đầu trò chuyện
		setIsStarted(false);
	}, [sessionId, rating]);

	const quick = language === 'vi' ? quickVi : quickEn;

	const Container = ({ children }) => {
		if (inline) return <div className="chat-inline">{children}</div>;
		return <div className={`chat-widget ${open ? 'open' : ''}`} style={{zIndex: 999999999}} onMouseDown={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()}>{children}</div>;
	};

	const widget = (
		<Container>
			{open && (
				<div className="chat-window" style={inline ? { width:'100%', maxWidth:'100%', height:'100%', borderRadius:16 } : undefined}>
					<div className="chat-header" style={inline ? { borderTopLeftRadius:16, borderTopRightRadius:16 } : undefined}>
						<div className="chat-header-left">
							<div className="chat-avatar">🤖</div>
							<div className="chat-title">
								<div className="chat-name">{title}</div>
								<div className="chat-status">
									<span className="status-dot"></span>
									{language === 'vi' ? 'Trực tuyến' : 'Online'}
								</div>
							</div>
						</div>
						<div className="actions" style={{display:'flex',gap:8}}>
							<select 
								value={language} 
								onChange={(e) => { 
									setLanguage(e.target.value); 
									localStorage.setItem('chatLang', e.target.value); 
								}}
								className="language-select"
							>
								<option value="en">🇺🇸 EN</option>
								<option value="vi">🇻🇳 VI</option>
							</select>
							<button 
								onClick={()=>setShowQuick(s=>!s)} 
								type="button"
								className="action-btn"
								title={showQuick ? (language==='vi'?'Ẩn gợi ý':'Hide tips') : (language==='vi'?'Hiện gợi ý':'Show tips')}
							>
								💡
							</button>
							{canHandover() && (
								<button 
									onClick={handover} 
									type="button"
									className="action-btn handover-btn"
									title={language === 'vi' ? 'Chuyển người thật' : 'Handover'}
								>
									👤
								</button>
							)}
							<button 
								onClick={()=>setShowRating(true)} 
								type="button"
								className="action-btn reset-btn"
								title={language === 'vi' ? 'Đóng phiên' : 'Close session'}
							>
								✖
							</button>
							{!inline && (
								<button 
									onClick={() => setOpen(false)} 
									type="button"
									className="action-btn close-btn"
								>
									×
								</button>
							)}
						</div>
					</div>
					<div className="chat-body" ref={bodyRef}>
						{messages.length === 0 && (
							<div className="welcome-message">
								<div className="welcome-icon">👋</div>
								<div className="welcome-text">
									{language === 'vi' 
										? 'Xin chào! Tôi là trợ lý AI của Dolce Restaurant. Tôi có thể giúp bạn với các câu hỏi về thực đơn, giao hàng và dịch vụ của chúng tôi.'
										: 'Hello! I\'m the AI assistant for Dolce Restaurant. I can help you with questions about our menu, delivery, and services.'
									}
								</div>
							</div>
						)}
						{messages.map((m, i) => (
							<div key={i} className={`msg ${m.sender}`}>
								<div style={{display:'flex', alignItems:'center', gap:8}}>
									<div style={{width:24,height:24,borderRadius:'50%',background:'#eee',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>
										{m.sender==='bot'?'🤖':(m.sender==='agent'?'👤':'🧑')}
									</div>
									<div style={{fontSize:12,color:'#666'}}>
										{m.sender==='bot' ? 'BOT' : (m.sender==='agent' ? (m.senderName||'Agent') : (m.senderName||'Khách vãng lai'))}
									</div>
								</div>
								<div className="msg-content" style={{marginTop:6}}>{m.content}</div>
								<div className="msg-time">
									{new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</div>
							</div>
						))}
						{typing && (
							<div className="msg bot typing">
								<div className="typing-indicator">
									<span></span>
									<span></span>
									<span></span>
								</div>
								<div className="msg-time">
									{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</div>
							</div>
						)}
						<div ref={bottomRef} />
					</div>
					{isStarted && showQuick && (
						<div className="quick-questions-container">
							<div className="quick-questions">
								{quick.map((q,idx)=> (
									<button 
										key={idx} 
										onClick={()=>handleQuickQuestion(q)}
										className="quick-question-btn"
									>
										{q}
									</button>
								))}
							</div>
						</div>
					)}
					<div className="chat-input">
						<input 
							ref={inputRef}
							value={input} 
							onChange={(e) => { userTypingRef.current = true; setInput(e.target.value); }} 
							placeholder={language === 'vi' ? 'Nhập tin nhắn...' : 'Type your message...'} 
							onKeyDown={(e) => e.key==='Enter' && isStarted && sendMessage()}
							onBlur={() => { userTypingRef.current = false; }}
							autoFocus
							className="chat-input-field"
							disabled={!isStarted}
						/>
						<button 
							onClick={sendMessage} 
							type="button"
							className="send-btn"
							disabled={!input.trim() || !isStarted}
						>
							📤
						</button>
					</div>
					{showRating && (
						<div className="rating-modal" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000000000}}>
							<div style={{background:'#fff',padding:16,borderRadius:12,width:420,maxWidth:'90%'}}>
								<h4 style={{marginTop:0}}>{language==='vi'?'Đánh giá phiên hỗ trợ':'Rate this session'}</h4>
								<div style={{display:'flex',gap:8,margin:'8px 0'}}>
									{[1,2,3,4,5].map(star=> (
										<span key={star} onClick={()=>setRating(star)} style={{cursor:'pointer',fontSize:22,color: star<=rating? '#f59e0b':'#cbd5e1'}}>★</span>
									))}
								</div>
								{rating>0 && (
									<div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
										{(ratingPresets[rating]||[]).map((t,i)=> (
											<button key={i} className="quick-question-btn" onClick={()=>setRatingNote(t)}>{t}</button>
										))}
									</div>
								)}
								<textarea value={ratingNote} onChange={e=>setRatingNote(e.target.value)} placeholder={language==='vi'?'Ghi chú (tuỳ chọn)':'Note (optional)'} style={{width:'100%',minHeight:90,border:'1px solid #e5e7eb',borderRadius:8,padding:10}} />
								<div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:10}}>
									<button className="action-btn" onClick={()=>{setShowRating(false); setRating(0); setRatingNote('');}}>{language==='vi'?'Hủy':'Cancel'}</button>
									<button className="action-btn" onClick={async ()=>{
										try {
											const sidToClose = sessionId;
											if (rating>0) await api.post('/chat/rate', { sessionId: sidToClose, rating, note: ratingNote });
											// đóng phiên phía server
											try { await api.post('/chat/close', { sessionId: sidToClose }); } catch {}
											setShowRating(false); setRating(0); setRatingNote('');
											// reset local
											localStorage.removeItem('chatSessionId');
											setSessionId('');
											setMessages([]);
											setIsStarted(false);
										} catch(e) { console.warn('rating/close error', e);} 
									}}>{language==='vi'?'Gửi & Đóng':'Submit & Close'}</button>
								</div>
							</div>
						</div>
					)}
					{!isStarted && (
						<div className="chat-start-overlay">
							<div className="start-card">
								<div className="start-icon">💬</div>
								<div className="start-text">{language==='vi' ? 'Nhấn "Bắt đầu trò chuyện" để mở phiên chat mới.' : 'Press "Start chat" to open a new session.'}</div>
								<button className="start-btn" type="button" onClick={createNewSessionAndGreet}>{language==='vi'?'Bắt đầu trò chuyện':'Start chat'}</button>
							</div>
						</div>
					)}
				</div>
			)}
			{!inline && !open && (
				<button className="chat-toggle" onClick={() => setOpen(true)} type="button">
					<div className="toggle-icon">💬</div>
					<div className="toggle-text">Chat</div>
				</button>
			)}
		</Container>
	);

	if (inline) return widget;
	return portalRef.current ? createPortal(widget, portalRef.current) : null;
};

export default ChatWidget; 