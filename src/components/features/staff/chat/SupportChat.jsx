import React, { useEffect, useRef, useState, useCallback } from 'react';
import api from '../../../../api/axiosConfig';
import useWebSocket from '../../../../hooks/useWebSocket';

export default function SupportChat() {
	const [sessions, setSessions] = useState([]);
	const [activeSessionId, setActiveSessionId] = useState('');
	const [history, setHistory] = useState([]);
	const [input, setInput] = useState('');
	const [reloadKey, setReloadKey] = useState(0);
	const { connected, subscribe, unsubscribe } = useWebSocket();
	const subRef = useRef(null);
	const bottomRef = useRef(null);
	const sendingRef = useRef(false);
	const seenIdsRef = useRef(new Set());

	const loadSessions = useCallback(async () => {
		const res = await api.get('/staff/chat/sessions');
		setSessions(res.data || []);
		if (!activeSessionId && res.data && res.data.length > 0) {
			setActiveSessionId(res.data[0].sessionId);
		}
	}, [activeSessionId]);

	const loadHistory = useCallback(async (sid) => {
		const res = await api.get('/staff/chat/history', { params: { sessionId: sid } });
		setHistory(Array.isArray(res.data) ? res.data : []);
	}, []);

	const reloadAll = useCallback(async () => {
		seenIdsRef.current = new Set();
		sendingRef.current = false;
		if (subRef.current) { try { unsubscribe(subRef.current); } catch {} subRef.current = null; }
		window.__staffSubscribedId = null;
		await loadSessions();
		if (activeSessionId) {
			await loadHistory(activeSessionId);
		}
		setReloadKey(Date.now());
	}, [activeSessionId, loadSessions, loadHistory, unsubscribe]);

	useEffect(() => { loadSessions(); }, []);

	useEffect(() => {
		if (!activeSessionId || !connected) return;
		loadHistory(activeSessionId);
		if (subRef.current) { unsubscribe(subRef.current); subRef.current = null; }
		if (!window.__staffSubscribedId) window.__staffSubscribedId = null;
		if (window.__staffSubscribedId === activeSessionId && subRef.current) return;
		const sub = subscribe(`/topic/chat/${activeSessionId}`, (payload) => {
			try {
				let data = null;
				if (payload && typeof payload === 'object' && payload.type) {
					data = payload;
				} else if (typeof payload === 'string' && payload.startsWith('{')) {
					try { data = JSON.parse(payload); } catch { data = null; }
				}
				if (data && data.type) {
					if (data.type === 'start') {
						setHistory(prev => [...prev, { sender: 'bot', contentMasked: '', id: Date.now(), senderName: 'BOT' }]);
						return;
					}
					if (data.type === 'delta') {
						setHistory(prev => {
							const arr = [...prev];
							arr[arr.length - 1] = { ...arr[arr.length - 1], contentMasked: (arr[arr.length - 1]?.contentMasked || '') + (data.delta || ''), senderName: 'BOT' };
							return arr;
						});
						return;
					}
					if (data.type === 'end') {
						bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
						return;
					}
					if (data.type === 'user' || data.type === 'agent') {
						const text = data.content || '';
						if (!text) return;
						const msgId = data.messageId;
						setHistory(prev => {
							const arr = [...prev];
							if (msgId && arr.some(m => m.messageId === msgId)) return prev;
							if (data.type === 'agent') {
								for (let i = arr.length - 1; i >= 0; i--) {
									const m = arr[i];
									if (m.sender === 'agent' && !m.messageId && m.contentMasked === text) {
										arr[i] = { ...m, messageId: msgId, senderName: data.senderName };
										return [...arr];
									}
								}
							}
							arr.push({ sender: data.type === 'agent' ? 'agent' : (data.type==='user'?'user':'bot'), contentMasked: text, id: Date.now(), messageId: msgId, senderName: data.senderName });
							return arr;
						});
						bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
						return;
					}
				}
				const text = typeof payload === 'string' ? payload : '';
				if (text) {
					setHistory(prev => {
						const last = prev[prev.length - 1];
						if (last && last.contentMasked === text) return prev;
						return [...prev, { sender: 'bot', senderName:'BOT', contentMasked: text, id: Date.now() }];
					});
				}
			} catch (e) {}
			bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
		});
		if (sub) { subRef.current = sub; window.__staffSubscribedId = activeSessionId; }
		return () => { if (subRef.current) { unsubscribe(subRef.current); subRef.current = null; } };
	}, [activeSessionId, connected, subscribe, unsubscribe, loadHistory, reloadKey]);

	const send = async () => {
		const t = input.trim();
		if (!t || !activeSessionId) return;
		setInput('');
		sendingRef.current = true;
		await api.post(`/staff/chat/sessions/${activeSessionId}/reply`, { message: t });
		setHistory(prev => [...prev, { sender: 'agent', senderName: 'Me', contentMasked: t, id: Date.now() }]);
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	const badge = (text) => (
		<span style={{padding:'2px 8px',borderRadius:999,background:'#e3f2fd',color:'#1565c0',fontSize:12}}>{text}</span>
	);

	return (
		<div style={{ display: 'grid', gridTemplateColumns:'320px 1fr', gap: 16 }}>
			{/* Sidebar sessions */}
			<div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, height: 'calc(100vh - 160px)', overflowY: 'auto' }}>
				<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
					<h3 style={{ margin: 0, fontSize:16 }}>Phiên đã bàn giao</h3>
					{/* <div style={{ display:'flex', gap:8 }}>
						<button onClick={reloadAll} className="btn btn-outline" style={{padding:'6px 10px'}}>Reload</button>
						{activeSessionId && (
							<button onClick={async ()=>{ await api.post(`/staff/chat/sessions/${activeSessionId}/close`); setActiveSessionId(''); setHistory([]); await loadSessions(); }} className="btn btn-danger" style={{padding:'6px 10px'}}>Đóng phiên</button>
						)}
					</div> */}
				</div>
				{sessions.map(s => (
					<div key={s.sessionId} onClick={() => setActiveSessionId(s.sessionId)} style={{ padding: 10, borderRadius: 10, marginBottom: 8, cursor: 'pointer', background: activeSessionId === s.sessionId ? '#eff6ff' : '#f8fafc', border: '1px solid #e5e7eb' }}>
						<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
							<div style={{ fontWeight: 600 }}><span className="mono">#{s.sessionId.slice(0, 8)}</span></div>
							<div>{badge(s.status)}</div>
						</div>
						<div style={{ fontSize: 12, color: '#64748b', marginTop:4 }}>Lang: {s.language}</div>
					</div>
				))}
			</div>
			{/* Conversation */}
			<div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, display: 'flex', flexDirection: 'column' }}>
				<div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
					<div>
						<div style={{fontWeight:600}}>Hỗ trợ khách hàng</div>
						<div style={{fontSize:12, color:'#64748b'}}>Phiên: <span style={{fontFamily:'monospace'}}>{activeSessionId?.slice(0,8) || '-'}</span> • Kênh: Web • Trạng thái: handed_over</div>
					</div>
					<div style={{display:'flex', gap:8}}>
						<button onClick={reloadAll} className="btn btn-outline">Làm mới</button>
						{activeSessionId && <button onClick={async ()=>{ await api.post(`/staff/chat/sessions/${activeSessionId}/close`); setActiveSessionId(''); setHistory([]); await loadSessions(); }} className="btn btn-danger">Đóng phiên</button>}
					</div>
				</div>
				<div style={{ flex: 1, padding: 16, overflowY: 'auto', background:'#f8fafc' }}>
					{history.map((m, idx) => {
						const isAgent = m.sender === 'agent';
						const isUser = m.sender === 'user';
						const isBot = m.sender === 'bot';
						const alignRight = isAgent;
						const bubbleBg = isAgent ? '#22c55e' : (isBot ? '#fff' : '#f1f5f9');
						const color = isAgent ? '#fff' : '#0f172a';
						return (
							<div key={m.id || idx} style={{ display: 'flex', justifyContent: alignRight ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
								<div style={{ maxWidth: '70%' }}>
									<div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
										<div style={{width:24,height:24,borderRadius:'50%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>
											{isAgent?'👤':(isBot?'🤖':'🧑')}
										</div>
										<div style={{fontSize:12,color:'#64748b'}}>{isBot ? 'BOT' : (m.senderName || (isUser?'Khách vãng lai':'Agent'))} • {new Date(m.createdAt||Date.now()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
									</div>
									<div style={{ padding: '10px 14px', borderRadius: 14, background: bubbleBg, color, border: '1px solid #e2e8f0' }}>{m.contentMasked}</div>
								</div>
							</div>
						);
					})}
					<div ref={bottomRef} />
				</div>
				<div style={{ display: 'flex', gap: 10, padding: 12, borderTop: '1px solid #e5e7eb', background:'#fff' }}>
					<input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Nhập tin nhắn..." style={{ flex: 1, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }} />
					<button onClick={send} disabled={!input.trim() || !activeSessionId} className="btn btn-primary">Gửi</button>
				</div>
			</div>
		</div>
	);
} 