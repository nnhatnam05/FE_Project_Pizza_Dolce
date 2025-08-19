import React, { useEffect, useState } from 'react';
import api from '../../../../api/axiosConfig';
import './ChatbotAdmin.css';

const badge = (text, color) => (
	<span className="badge" style={{background:color.bg,color:color.fg}}>{text}</span>
);

const Sessions = () => {
	const [sessions, setSessions] = useState([]);
	const [selected, setSelected] = useState(null);
	const [history, setHistory] = useState([]);
	const [agentMsg, setAgentMsg] = useState('');
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [analytics, setAnalytics] = useState({ totalSessions: 0, totalMessages: 0 });

	const loadSessions = async () => {
		setLoading(true);
		try {
			const res = await api.get('/admin/chat/sessions');
			setSessions(res.data);
		} finally { setLoading(false); }
	};

	const loadAnalytics = async () => {
		try { const res = await api.get('/admin/chat/analytics/basic'); setAnalytics(res.data || { totalSessions:0,totalMessages:0}); } catch {}
	};
	useEffect(() => { loadSessions(); loadAnalytics(); }, []);

	const openSession = async (s) => {
		setSelected(s);
		const res = await api.get(`/admin/chat/sessions/${s.sessionId}`);
		setHistory(res.data.history || []);
		setSelected(res.data.session || s);
	};

	const doHandover = async (s) => {
		await api.post(`/admin/chat/sessions/${s.sessionId}/handover`);
		loadSessions();
		if (selected && selected.sessionId === s.sessionId) {
			openSession(s);
		}
	};

	const deleteSession = async (s) => {
		if (!window.confirm(`Bạn có chắc muốn xóa session ${s.sessionId}?`)) return;
		setDeleting(true);
		try {
			await api.delete(`/admin/chat/sessions/${s.sessionId}`);
			if (selected && selected.sessionId === s.sessionId) {
				setSelected(null);
				setHistory([]);
			}
			loadSessions();
		} catch (error) {
			alert('Lỗi khi xóa session: ' + error.message);
		} finally {
			setDeleting(false);
		}
	};

	const clearAllSessions = async () => {
		if (!window.confirm('Bạn có chắc muốn xóa TẤT CẢ sessions? Hành động này không thể hoàn tác!')) return;
		setDeleting(true);
		try {
			await api.delete('/admin/chat/sessions/clear-all');
			setSelected(null);
			setHistory([]);
			loadSessions();
			alert('Đã xóa tất cả sessions thành công!');
		} catch (error) {
			alert('Lỗi khi xóa tất cả sessions: ' + error.message);
		} finally {
			setDeleting(false);
		}
	};

	const sendAgent = async () => {
		if (!selected || !agentMsg.trim()) return;
		await api.post(`/admin/chat/sessions/${selected.sessionId}/agent-message`, { message: agentMsg.trim() });
		setAgentMsg('');
		openSession(selected);
	};

	const statusColor = (st) => st==='ended' ? {bg:'#fee2e2', fg:'#b91c1c'} : (st==='handed_over' ? {bg:'#dbeafe', fg:'#1d4ed8'} : {bg:'#dcfce7', fg:'#166534'});

	return (
		<div className="cb-admin">
			<div className="cb-header">
				<h2 style={{margin:0}}>Chat Sessions</h2>
				<button onClick={clearAllSessions} disabled={deleting || sessions.length === 0} className="cb-danger-btn">
					{deleting ? 'Đang xóa...' : 'Xóa tất cả'}
				</button>
			</div>

			<div className="cb-grid">
				<div className="card">
					<div className="card-body">
						<div className="card-title">Danh sách phiên</div>
						<div className="cb-table">
							<div className="cb-thead"><div>Session</div><div>Status</div><div>Lang</div><div>Rating</div><div>Actions</div></div>
							{loading ? <div className="cb-loading">Loading...</div> : sessions.map(s => (
								<div className="cb-row" key={s.id}>
									<div className="mono ellipsis" title={s.sessionId}>{s.sessionId}</div>
									<div>{badge(s.status, statusColor(s.status))}</div>
									<div>{s.language}</div>
									<div>{s.rating ? `${s.rating}★` : '-'}</div>
									<div className="cb-actions">
										<button className="btn btn-outline" onClick={()=>openSession(s)}>Open</button>
										<button className="btn btn-primary" onClick={()=>doHandover(s)} disabled={s.status==='handed_over' || s.status==='ended'}>Handover</button>
										<button className="btn cb-delete-btn" onClick={()=>deleteSession(s)} disabled={deleting}>Xóa</button>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="card">
					<div className="card-body">
						<div className="card-title">Conversation</div>
						<div style={{border:'1px solid #e5e7eb', borderRadius:12, height:420, overflow:'auto', padding:8, background:'#fff'}}>
							{selected ? history.map((m,i)=>(
								<div key={i} style={{marginBottom:10}}>
									<div style={{display:'flex',alignItems:'center',gap:8, fontSize:12, color:'#64748b'}}>
										<span style={{width:20,height:20,display:'inline-flex',alignItems:'center',justifyContent:'center',background:'#e2e8f0',borderRadius:'50%'}}>{m.sender==='bot'?'🤖':(m.sender==='agent'?'👤':'🧑')}</span>
										<span>{m.sender==='bot'?'BOT':(m.sender==='agent'?(m.senderName||'Agent'):(m.senderName||'Khách vãng lai'))}</span>
									</div>
									<div style={{background:'#f8fafc',border:'1px solid #e5e7eb',borderRadius:8,padding:'8px 12px',marginTop:6}}>{m.contentMasked}</div>
								</div>
							)) : <div className="cb-loading">Select a session</div>}
						</div>
						{selected && (
							<div style={{marginTop:12}}>
								<div>Rating: {selected.rating ? `${selected.rating}★` : 'N/A'}</div>
								{selected.ratingNote && (
									<div style={{marginTop:6, fontSize:13, color:'#475569'}}>Note: {selected.ratingNote}</div>
								)}
							</div>
						)}
						<div className="row" style={{marginTop:12, display:'flex', gap:8}}>
							<input placeholder="Agent message" value={agentMsg} onChange={e=>setAgentMsg(e.target.value)} style={{flex:1, border:'1px solid #cbd5e1', borderRadius:8, padding:'8px 10px'}} />
							<button className="btn btn-primary" onClick={sendAgent}>Send</button>
						</div>
					</div>
				</div>
			</div>

			{/* Analytics merged section */}
			<div className="card" style={{marginTop:16}}>
				<div className="card-body">
					<div className="card-title">Analytics</div>
					<div className="cb-table">
						<div className="cb-thead"><div>Metric</div><div>Value</div><div></div><div></div><div></div></div>
						<div className="cb-row"><div>Total Active/Handover Sessions</div><div>{analytics.totalSessions}</div><div></div><div></div><div></div></div>
						<div className="cb-row"><div>Total Messages</div><div>{analytics.totalMessages}</div><div></div><div></div><div></div></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sessions; 