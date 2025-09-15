import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useWebSocket from '../../../../hooks/useWebSocket';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED = ['image/jpeg','image/png','image/webp','video/mp4','video/quicktime'];

export default function ComplaintChat() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [header, setHeader] = useState(null); // complaint details for banner
  const endRef = useRef(null);
  const { connected, subscribe } = useWebSocket();

  const token = useMemo(() => localStorage.getItem('token'), []);
  const resolveUrl = (u) => (u && !u.startsWith('http') ? `http://localhost:8080${u}` : u);

  useEffect(() => {
    const fetchMsgs = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/complaints/${id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data || []);
      } catch (e) {}
    };
    const fetchHeader = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHeader(res.data);
      } catch (e) {}
    };
    fetchMsgs();
    fetchHeader();
  }, [id, token]);

  useEffect(() => {
    if (!connected) return;
    const sub = subscribe(`/topic/complaints/${id}`, (data) => {
      setMessages((prev) => [...prev, data]);
      endRef.current && endRef.current.scrollIntoView({ behavior: 'smooth' });
    });
    return () => {
      if (sub && sub.unsubscribe) sub.unsubscribe();
    };
  }, [connected, id, subscribe]);

  const send = async () => {
    if (!text.trim()) return;
    try {
      await axios.post(`http://localhost:8080/api/complaints/${id}/messages`, { message: text.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setText('');
    } catch (e) {}
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE) { alert('File quá lớn (tối đa 10MB)'); return; }
    if (!ALLOWED.includes(file.type)) { alert('Định dạng không hỗ trợ'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      await axios.post(`http://localhost:8080/api/complaints/${id}/attachments`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      alert('Upload thất bại');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="complaint-chat-container" style={{maxWidth: 960, margin: '0 auto', padding: 16}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <h2 style={{margin:0, fontSize:20}}>Hỗ trợ khiếu nại</h2>
        <div style={{fontSize:12, color:'#6b7280'}}>Mã case #{id}</div>
      </div>
      {header && (
        <div style={{border:'1px solid #e5e7eb', borderRadius:10, padding:12, background:'#fff', marginBottom:12, display:'grid', gridTemplateColumns:'1fr auto', gap:8}}>
          <div>
            <div style={{fontWeight:600, marginBottom:4}}>Lý do</div>
            <div style={{color:'#111827'}}>{header.reason || '—'}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontWeight:600, marginBottom:4}}>Trạng thái</div>
            <span style={{padding:'4px 10px', borderRadius:16, background:'#eef2ff', color:'#3730a3'}}>{header.status}</span>
            {['RESOLVED','REJECTED','APPROVED'].includes((header.status||'').toUpperCase()) && (
              <div style={{marginTop:6, color:'#166534', fontSize:12}}>Đã giải quyết • Chat đã đóng</div>
            )}
          </div>
        </div>
      )}
      <div className="chat-box" style={{border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, height: 520, overflowY: 'auto', background: '#fff'}}>
        {messages.map((m, idx) => {
          const mine = String(m.senderType).toUpperCase() === 'CUSTOMER';
          const align = mine ? 'flex-end' : 'flex-start';
          const bg = mine ? '#dcfce7' : '#f3f4f6';
          const color = mine ? '#064e3b' : '#111827';
          return (
            <div key={idx} style={{marginBottom:12, display:'flex', justifyContent:align}}>
              <div style={{maxWidth:'76%'}}>
                {!m.url ? (
                  <div style={{background:bg, color, padding:'8px 12px', borderRadius:12}}>
                    <div style={{fontSize:12, opacity:0.7, marginBottom:2}}>{mine ? 'Bạn' : (m.senderType || 'CSKH')}</div>
                    <div style={{whiteSpace:'pre-wrap'}}>{m.message}</div>
                  </div>
                ) : (
                  <div style={{background:bg, padding:8, borderRadius:12}}>
                    {m.mimeType?.startsWith('image/') ? (
                      <a href={resolveUrl(m.url)} target="_blank" rel="noreferrer">
                        <img src={resolveUrl(m.url)} alt="attachment" style={{display:'block', maxWidth: '100%', maxHeight: 360, height: 'auto', width: 'auto', borderRadius: 8, objectFit: 'contain'}} />
                      </a>
                    ) : (
                      <video src={resolveUrl(m.url)} controls style={{display:'block', maxWidth: '100%', maxHeight: 360, borderRadius: 8}} />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div style={{display: 'flex', gap: 8, marginTop: 10}}>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{flex: 1, padding: 12, borderRadius: 9999, border: '1px solid #e5e7eb', outline:'none'}}
        />
        <label style={{padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 9999, cursor: 'pointer', background:'#fff'}}>
          {uploading ? 'Đang tải...' : 'Ảnh/Video'}
          <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" onChange={onFile} style={{display:'none'}} />
        </label>
        <button onClick={send} style={{padding: '10px 18px', borderRadius:9999, background:'#3b82f6', color:'#fff', border:'none'}}>Gửi</button>
      </div>
    </div>
  );
}


