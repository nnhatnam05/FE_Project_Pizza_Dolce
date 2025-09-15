import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useWebSocket from '../../../../hooks/useWebSocket';

export default function ComplaintsDashboard() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState({ action: 'REFUND', refundAmount: '', refundQrUrl: '', redeliveryTotal: '0', reason: '' });
  const { connected, subscribe } = useWebSocket();
  const token = useMemo(() => localStorage.getItem('token'), []);
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/staff/complaints', { headers: { Authorization: `Bearer ${token}` }});
      const data = res.data || [];
      // Ẩn các case đã đóng khỏi danh sách chat nhân viên
      const active = data.filter(c => !['RESOLVED','REJECTED','APPROVED'].includes((c.status||'').toUpperCase()));
      setList(active);
    } catch {}
  };

  const fetchMessages = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/staff/complaints/${id}/messages`, { headers: { Authorization: `Bearer ${token}` }});
      setMessages(res.data || []);
    } catch {}
  };

  useEffect(() => { fetchList(); }, []);

  useEffect(() => {
    if (!selected || !connected) return;
    const sub = subscribe(`/topic/complaints/${selected.id}`, (data) => setMessages((prev) => [...prev, data]));
    return () => { if (sub && sub.unsubscribe) sub.unsubscribe(); };
  }, [connected, selected, subscribe]);

  const openCase = async (c) => {
    setSelected(c);
    await fetchMessages(c.id);
  };

  const send = async () => {
    if (!selected || !text.trim()) return;
    try {
      await axios.post(`http://localhost:8080/api/staff/complaints/${selected.id}/messages`, { message: text.trim() }, { headers: { Authorization: `Bearer ${token}` }});
    } catch (e) {
      alert(e?.response?.data || 'Gửi tin nhắn thất bại');
      return;
    }
    setText('');
  };

  const decideRefund = async () => {
    if (!selected) return;
    setReportData(d => ({
      ...d,
      action: 'REFUND',
      refundAmount: (selected.order?.totalPrice != null ? String(selected.order.totalPrice) : (d.refundAmount || '')),
      redeliveryTotal: '0'
    }));
    setReportOpen(true);
  };

  const decideRedeliver = async () => {
    if (!selected) return;
    setReportData(d => ({ ...d, action: 'REDELIVER', redeliveryTotal: '0' }));
    setReportOpen(true);
  };

  const completeRefund = async () => {
    if (!selected) return;
    const ref = prompt('Nhập mã giao dịch/ghi chú hoàn tiền:');
    await axios.post(`http://localhost:8080/api/staff/complaints/${selected.id}/refund/complete`, { refundReference: ref }, { headers: { Authorization: `Bearer ${token}` }});
    fetchList();
  };

  const submitReport = async () => {
    if (!selected) return;
    const body = reportData.action === 'REFUND'
      ? { action: 'REFUND', refundAmount: reportData.refundAmount ? Number(reportData.refundAmount) : undefined, refundQrUrl: reportData.refundQrUrl }
      : { action: 'REDELIVER', redeliveryTotal: reportData.redeliveryTotal ? Number(reportData.redeliveryTotal) : 0 };
    await axios.post(`http://localhost:8080/api/staff/complaints/${selected.id}/decide`, body, { headers: { Authorization: `Bearer ${token}` }});
    setReportOpen(false);
    fetchList();
  };

  const createRedelivery = async () => {
    if (!selected) return;
    const total = prompt('Tổng tiền giao lại (để trống = 0):', '0');
    const res = await axios.post(`http://localhost:8080/api/staff/complaints/${selected.id}/redeliver`, total ? { redeliveryTotal: Number(total) } : {}, { headers: { Authorization: `Bearer ${token}` }});
    alert('Đã tạo đơn giao lại #' + res.data);
    navigate(`/detail-delivery/${res.data}`);
  };

  return (
    <div style={{display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, padding: 16}}>
      <div style={{border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background:'#fff', boxShadow:'0 10px 25px rgba(0,0,0,0.05)'}}>
        <div style={{position:'sticky', top:0, background:'#fff', zIndex:1, padding: 12, borderBottom: '1px solid #e5e7eb', display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:8}}>
          <div style={{fontWeight: 800}}>Khiếu nại đang xử lý</div>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Tìm theo khách/đơn/case" style={{gridColumn:'1 / -1', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:10}}/>
        </div>
        <div style={{maxHeight: 640, overflowY: 'auto'}}>
          {list
            .filter(c => {
              if (!q.trim()) return true;
              const s = q.toLowerCase();
              return String(c.id).includes(s) || String(c.order?.id||'').includes(s) || (c.customer?.fullName||'').toLowerCase().includes(s) || (c.customer?.email||'').toLowerCase().includes(s);
            })
            .map(c => (
            <div key={c.id} onClick={() => openCase(c)} style={{padding: 12, cursor: 'pointer', borderBottom: '1px solid #f3f4f6', background: selected?.id===c.id?'#eef2ff':'#fff', transition:'background .15s ease'}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{fontWeight: 800}}>#{c.id}</div>
                <span style={{padding:'2px 10px', background:'#eef2ff', borderRadius: 9999, fontSize:12}}>{c.status}</span>
                <div style={{marginLeft:'auto', fontSize: 12, color: '#6b7280'}}>Order #{c.order?.id || c.orderId}</div>
              </div>
              <div style={{fontSize: 12, color: '#6b7280', marginTop:4}}>Khách: {c.customer?.fullName || c.customer?.email || '—'}</div>
            </div>
          ))}
          {list.length === 0 && (
            <div style={{padding:16, color:'#6b7280'}}>Không có khiếu nại nào cần xử lý.</div>
          )}
        </div>
      </div>
      <div style={{border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background:'#fff', boxShadow:'0 10px 25px rgba(0,0,0,0.05)'}}>
        {!selected ? (
          <div style={{color:'#6b7280', padding:24, textAlign:'center'}}>Chọn một khiếu nại để xem chi tiết</div>
        ) : (
          <div style={{display:'grid', gridTemplateRows: 'auto auto 1fr auto', height: 740}}>
            <div style={{position:'sticky', top:0, background:'#fff', zIndex:1, marginBottom: 8, display:'flex', gap:8, alignItems:'center', paddingBottom:8, borderBottom:'1px solid #f3f4f6'}}>
              <div style={{fontWeight: 900, fontSize:18}}>Case #{selected.id}</div>
              <span style={{padding:'4px 12px', background:'#eef2ff', borderRadius: 9999, fontWeight:600}}>{selected.status}</span>
              <div style={{marginLeft: 'auto', display:'flex', gap:8}}>
                <button onClick={()=>{ setReportData(d=>({...d, action:'REFUND'})); setReportOpen(true); }} style={{padding:'10px 14px', borderRadius:10, background:'#0ea5e9', color:'#fff', border:'none'}}>Tạo đơn</button>
              </div>
            </div>
            {/* Customer/Order/Reason summary */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:8}}>
              <div style={{border:'1px solid #f3f4f6', borderRadius:8, padding:10}}>
                <div style={{fontWeight:600, marginBottom:6}}>Khách hàng</div>
                <div><b>Tên:</b> {selected.customer?.fullName || selected.order?.recipientName || '—'}</div>
                <div><b>Email:</b> {selected.customer?.email || '—'}</div>
                <div><b>Điện thoại:</b> {selected.customer?.customerDetails?.phoneNumber || selected.customer?.phoneNumber || selected.order?.recipientPhone || '—'}</div>
              </div>
              <div style={{border:'1px solid #f3f4f6', borderRadius:8, padding:10}}>
                <div style={{fontWeight:600, marginBottom:6}}>Đơn hàng</div>
                <div><b>Order ID:</b> #{selected.order?.id || selected.orderId}</div>
                <div><b>Tổng tiền:</b> {selected.order?.totalPrice != null ? `$${Number(selected.order.totalPrice).toLocaleString()}` : '—'}</div>
                <div><b>Phương thức:</b> {selected.order?.paymentMethod || '—'}</div>
                <div style={{marginTop:8}}>
                  <div style={{fontWeight:600, marginBottom:4}}>Chi tiết món</div>
                  <ul style={{margin:0, paddingLeft:16}}>
                    {((selected.order?.orderFoods) || (selected.order?.foodList) || []).map((it, idx) => (
                      <li key={it.id || idx}>
                        {(it.food?.name || it.name || 'Món')} x {it.quantity}
                      </li>
                    ))}
                    {(((selected.order?.orderFoods)|| (selected.order?.foodList)||[]).length === 0) && (
                      <li>—</li>
                    )}
                  </ul>
                </div>
              </div>
              <div style={{border:'1px solid #f3f4f6', borderRadius:8, padding:10}}>
                <div style={{fontWeight:600, marginBottom:6}}>Lý do khiếu nại</div>
                <div style={{whiteSpace:'pre-wrap'}}>{selected.reason || '—'}</div>
              </div>
            </div>
            {/* Banner đóng chat nếu case đã xử lý */}
            {['RESOLVED','REJECTED','APPROVED'].includes((selected.status||'').toUpperCase()) && (
              <div style={{padding:8, border:'1px solid #e5e7eb', background:'#f0fdf4', borderRadius:8, color:'#166534', marginBottom:8}}>
                Đơn khiếu nại đã được giải quyết. Chat đã đóng.
              </div>
            )}
            <div style={{border:'1px solid #f3f4f6', borderRadius:10, padding:10, overflowY:'auto', boxShadow:'inset 0 1px 0 rgba(0,0,0,0.02)'}}>
              {messages.map((m, i) => {
                const mine = String(m.senderType).toUpperCase() === 'STAFF';
                const align = mine ? 'flex-end' : 'flex-start';
                const bg = mine ? '#dcfce7' : '#f3f4f6';
                const color = mine ? '#064e3b' : '#111827';
                const abs = (u)=> (u && !u.startsWith('http') ? `http://localhost:8080${u}` : u);
                return (
                  <div key={`${m.id || i}-${m.url ? 'att' : 'msg'}`} style={{marginBottom:10, display:'flex', justifyContent:align}}>
                    <div style={{maxWidth:'76%'}}>
                      {!m.url ? (
                        <div style={{background:bg, color, padding:'8px 12px', borderRadius:12}}>
                          <div style={{fontSize:12, opacity:0.7, marginBottom:2}}>{mine ? 'Bạn' : (m.senderType || 'Khách')}</div>
                          <div style={{whiteSpace:'pre-wrap'}}>{m.message}</div>
                        </div>
                      ) : (
                        <div style={{background:bg, padding:8, borderRadius:12}}>
                          {m.mimeType?.startsWith('image/') ? (
                            <a href={abs(m.url)} target="_blank" rel="noreferrer">
                              <img src={abs(m.url)} alt="att" style={{display:'block', maxWidth:'100%', maxHeight:360, height:'auto', width:'auto', borderRadius:8, objectFit:'contain'}}/>
                            </a>
                          ) : (
                            <video controls src={abs(m.url)} style={{display:'block', maxWidth:'100%', maxHeight:360, borderRadius:8}}/>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {!['RESOLVED','REJECTED','APPROVED'].includes((selected.status||'').toUpperCase()) && (
              <div style={{display:'flex', gap:8, marginTop:10}}>
                <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Nhập tin nhắn..." style={{flex:1, padding:12, borderRadius:9999, border:'1px solid #e5e7eb', outline:'none'}}/>
                <button onClick={send} style={{padding:'10px 18px', borderRadius:9999, background:'#3b82f6', color:'#fff', border:'none', boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}}>Gửi</button>
              </div>
            )}
            {reportOpen && (
              <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50}}>
                <div style={{width:600, maxWidth:'94%', background:'#fff', borderRadius:12, boxShadow:'0 10px 30px rgba(0,0,0,0.15)'}}>
                  <div style={{padding:'14px 16px', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center'}}>
                    <div style={{fontWeight:800}}>Báo cáo/Đề xuất quyết định</div>
                    <button onClick={()=>setReportOpen(false)} style={{marginLeft:'auto'}}>✕</button>
                  </div>
                  <div style={{padding:16}}>
                    <div style={{display:'flex', gap:12, marginBottom:12}}>
                      <label style={{display:'flex', alignItems:'center', gap:6}}>
                        <input type="radio" checked={reportData.action==='REFUND'} onChange={()=>setReportData(d=>({
                          ...d,
                          action:'REFUND',
                          refundAmount: (selected?.order?.totalPrice != null ? String(selected.order.totalPrice) : (d.refundAmount || ''))
                        }))}/> Refund
                      </label>
                      <label style={{display:'flex', alignItems:'center', gap:6}}>
                        <input type="radio" checked={reportData.action==='REDELIVER'} onChange={()=>setReportData(d=>({
                          ...d,
                          action:'REDELIVER',
                          redeliveryTotal: '0'
                        }))}/> Giao lại
                      </label>
                    </div>
                    {reportData.action==='REFUND' ? (
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                        <div>
                          <div style={{fontSize:12, color:'#6b7280', marginBottom:4}}>Số tiền hoàn</div>
                          <input placeholder="VD: 150000"
                            value={reportData.refundAmount}
                            onChange={(e)=>setReportData(d=>({...d, refundAmount:e.target.value}))}
                            style={{width:'100%', padding:10, border:'1px solid #e5e7eb', borderRadius:8}}/>
                        </div>
                        <div>
                          <div style={{fontSize:12, color:'#6b7280', marginBottom:4}}>Ảnh QR chuyển khoản của khách</div>
                          <input type="file" accept="image/*" onChange={async (e)=>{
                            const file = e.target.files?.[0];
                            if (!file || !selected) return;
                            try {
                              const form = new FormData();
                              form.append('file', file);
                              const resp = await axios.post(`http://localhost:8080/api/staff/complaints/${selected.id}/qr`, form, { headers: { Authorization: `Bearer ${token}` }});
                              const url = resp.data?.url || '';
                              setReportData(d=>({...d, refundQrUrl: url }));
                            } catch (err) {
                              alert('Tải QR thất bại');
                            }
                          }} style={{width:'100%'}}/>
                          {reportData.refundQrUrl && (
                            <div style={{marginTop:8}}>
                              <img alt="qr-preview" src={(reportData.refundQrUrl.startsWith('http')||reportData.refundQrUrl.startsWith('data:image'))?reportData.refundQrUrl:`http://localhost:8080${reportData.refundQrUrl}`} style={{maxHeight:120, border:'1px solid #e5e7eb', borderRadius:8}}/>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{fontSize:12, color:'#6b7280', marginBottom:4}}>Tổng tiền đơn giao lại</div>
                        <input placeholder="0" value={reportData.redeliveryTotal} onChange={(e)=>setReportData(d=>({...d, redeliveryTotal:e.target.value}))} style={{width:'100%', padding:10, border:'1px solid #e5e7eb', borderRadius:8}}/>
                      </div>
                    )}
                    <div style={{marginTop:12}}>
                      <div style={{fontSize:12, color:'#6b7280', marginBottom:4}}>Lý do/Ghi chú</div>
                      <textarea placeholder="Mô tả chi tiết tình huống, bằng chứng..." value={reportData.reason} onChange={(e)=>setReportData(d=>({...d, reason:e.target.value}))} style={{width:'100%', minHeight:100, padding:10, border:'1px solid #e5e7eb', borderRadius:8}}/>
                    </div>
                  </div>
                  <div style={{padding:12, display:'flex', justifyContent:'flex-end', gap:8, borderTop:'1px solid #e5e7eb'}}>
                    <button onClick={()=>setReportOpen(false)} style={{padding:'10px 14px'}}>Hủy</button>
                    <button onClick={submitReport} style={{padding:'10px 16px', background:'#16a34a', color:'#fff', border:'none', borderRadius:8}}>Nộp cho Admin / Xác nhận</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


