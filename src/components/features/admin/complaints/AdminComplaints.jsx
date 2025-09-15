import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import useWebSocket from '../../../../hooks/useWebSocket';

function Settings({ onSaved }) {
  const [assignedSupportStaffId, setStaffId] = useState('');
  const [autoDecisionEnabled, setAuto] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [editing, setEditing] = useState(false);
  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/admin/complaints/settings', { headers: { Authorization: `Bearer ${token}` }});
        setStaffId(res.data.assignedSupportStaffId || '');
        setAuto(!!res.data.autoDecisionEnabled);
      } catch {}

      // Load staff list for selection
      try {
        // Try generic users endpoint then filter by role client-side
        let resp = await axios.get('http://localhost:8080/api/auth/users', { headers: { Authorization: `Bearer ${token}` }});
        const arr = Array.isArray(resp.data) ? resp.data : [];
        setStaffs(arr.filter(u => (u.role || '').toUpperCase() === 'STAFF'));
      } catch {
        setStaffs([]);
      }
    };
    load();
  }, [token]);

  const save = async () => {
    try {
      const payload = {
        assignedSupportStaffId: assignedSupportStaffId ? Number(assignedSupportStaffId) : null,
        autoDecisionEnabled: !!autoDecisionEnabled,
      };
      await axios.put(
        'http://localhost:8080/api/admin/complaints/settings',
        payload,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setEditing(false);
      alert('Đã lưu cài đặt CSKH.');
      if (onSaved) onSaved();
    } catch (e) {
      const msg = e?.response?.data || 'Lưu thất bại';
      alert(typeof msg === 'string' ? msg : 'Lưu thất bại');
    }
  };

  const currentStaff = staffs.find(s => String(s.id) === String(assignedSupportStaffId));

  return (
    <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
      {!editing ? (
        <>
          <div style={{fontSize:14}}>
            <b>Staff mặc định:</b> {currentStaff ? `${currentStaff.name || currentStaff.fullName || currentStaff.username} ${currentStaff.email ? `(${currentStaff.email})` : ''}` : 'Chưa chỉ định'}
          </div>
          <label style={{display:'flex', gap:6, alignItems:'center'}}>
            <input type="checkbox" checked={autoDecisionEnabled} onChange={(e)=>setAuto(e.target.checked)} /> Auto decision ON
          </label>
          <button onClick={()=>setEditing(true)}>Edit</button>
        </>
      ) : (
        <>
          <select
            value={assignedSupportStaffId || ''}
            onChange={(e)=>setStaffId(e.target.value)}
            style={{minWidth:260, padding:8, border:'1px solid #e5e7eb', borderRadius:6}}
          >
            <option value="">Staff ID mặc định</option>
            {staffs.map(s => (
              <option key={s.id} value={s.id}>
                {s.name || s.fullName || s.username} {s.email ? `• ${s.email}` : ''}
              </option>
            ))}
          </select>
          <label style={{display:'flex', gap:6, alignItems:'center'}}>
            <input type="checkbox" checked={autoDecisionEnabled} onChange={(e)=>setAuto(e.target.checked)} /> Auto decision ON
          </label>
          <button onClick={save}>Lưu</button>
          <button onClick={()=>setEditing(false)}>Hủy</button>
        </>
      )}
    </div>
  );
}

export default function AdminComplaints() {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [q, setQ] = useState('');
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveForm, setApproveForm] = useState({ refundAmount: '', refundQrUrl: '', adminSignature: '' });
  const [rejectForm, setRejectForm] = useState({ reason: '' });
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const token = useMemo(() => localStorage.getItem('token'), []);
  const { connected, subscribe } = useWebSocket();
  const [allStaff, setAllStaff] = useState([]);
  const [editAssign, setEditAssign] = useState(false);
  const [assignStaffId, setAssignStaffId] = useState('');

  const load = async () => {
    const url = status ? `http://localhost:8080/api/admin/complaints?status=${status}` : 'http://localhost:8080/api/admin/complaints';
    const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }});
    setList(res.data || []);
  };

  useEffect(() => { load(); }, [status]);

  useEffect(() => {
    if (!selected || !connected) return;
    const sub = subscribe(`/topic/complaints/${selected.id}`, (data) => setMessages((prev)=>[...prev, data]));
    return () => { if (sub && sub.unsubscribe) sub.unsubscribe(); };
  }, [connected, selected, subscribe]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await axios.get('http://localhost:8080/api/auth/users', { headers: { Authorization: `Bearer ${token}` }});
        const arr = Array.isArray(resp.data) ? resp.data : [];
        setAllStaff(arr.filter(u => (u.role || '').toUpperCase() === 'STAFF'));
      } catch {}
    })();
  }, [token]);

  const openCase = async (c) => {
    setSelected(c);
    setEditAssign(false);
    setAssignStaffId(c?.assignedStaff?.id || '');
    try {
      const res = await axios.get(`http://localhost:8080/api/staff/complaints/${c.id}/messages`, { headers: { Authorization: `Bearer ${token}` }});
      setMessages(res.data || []);
    } catch {}
  };

  // Signature pad handlers
  const startDraw = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.moveTo(x, y);
  };
  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const endDraw = () => setIsDrawing(false);
  const clearSign = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setApproveForm(f => ({ ...f, adminSignature: '' }));
  };
  const saveSign = () => {
    const dataURL = canvasRef.current.toDataURL('image/png');
    setApproveForm(f => ({ ...f, adminSignature: dataURL }));
  };

  const approve = async () => {
    if (!selected) return;
    setApproveForm({ refundAmount: selected.refundAmount || selected.order?.totalPrice || '', refundQrUrl: selected.refundQrUrl || '', adminSignature: '' });
    setApproveOpen(true);
  };

  const reject = async () => {
    if (!selected) return;
    setRejectForm({ reason: '' });
    setRejectOpen(true);
  };

  const counts = React.useMemo(() => {
    const c = { ALL: list.length, OPEN: 0, NEED_ADMIN_APPROVAL: 0, APPROVED: 0, REJECTED: 0, RESOLVED: 0 };
    list.forEach(it => { const s = (it.status||'').toUpperCase(); if (c[s] != null) c[s]++; });
    return c;
  }, [list]);

  const StatusChip = ({ label, value }) => (
    <button onClick={()=>setStatus(value)} style={{
      padding:'6px 10px', borderRadius:9999, border:'1px solid #e5e7eb', background: (status===value?'#111827':'#fff'), color:(status===value?'#fff':'#111827'), fontSize:12
    }}>{label}{' '}({value?counts[(value||'').toUpperCase()]:counts.ALL})</button>
  );

  return (
    <div style={{padding:16}}>
      <div style={{position:'sticky', top:0, background:'#f9fafb', zIndex:1, borderBottom:'1px solid #e5e7eb', margin:'-16px -16px 12px -16px', padding:'12px 16px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:12}}>
          <h2 style={{margin:0}}>Quản lý khiếu nại</h2>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Tìm theo Case/Order/Khách" style={{gridColumn:'1 / -1', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:10}}/>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <StatusChip label="Tất cả" value="" />
            <StatusChip label="Open" value="OPEN" />
            <StatusChip label="Chờ duyệt" value="NEED_ADMIN_APPROVAL" />
            <StatusChip label="Approved" value="APPROVED" />
            <StatusChip label="Rejected" value="REJECTED" />
            <StatusChip label="Resolved" value="RESOLVED" />
          </div>
        </div>
      </div>
      <div style={{border:'1px solid #e5e7eb', borderRadius:10, padding:12, background:'#fff', marginBottom:12, boxShadow:'0 10px 25px rgba(0,0,0,0.04)'}}>
        <Settings onSaved={load} />
      </div>
      <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:16}}>
        <div style={{border:'1px solid #e5e7eb', borderRadius:10, background:'#fff', overflow:'hidden'}}>
          <div style={{padding:10, borderBottom:'1px solid #e5e7eb', fontWeight:700}}>Danh sách</div>
          <div style={{maxHeight:640, overflowY:'auto'}}>
            {list
              .filter(c => !['RESOLVED','REJECTED','APPROVED'].includes((c.status||'').toUpperCase()))
              .filter(c => {
                if (!q.trim()) return true;
                const s = q.toLowerCase();
                return String(c.id).includes(s) || String(c.order?.id||'').includes(s) || (c.customer?.fullName||'').toLowerCase().includes(s) || (c.customer?.email||'').toLowerCase().includes(s);
              })
              .map(c => (
              <div key={`case-${c.id}`} onClick={()=>openCase(c)} style={{padding:12, borderBottom:'1px solid #f3f4f6', cursor:'pointer', background:selected?.id===c.id?'#f9fafb':'#fff'}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{fontWeight:700}}>#{c.id}</div>
                  <span style={{padding:'2px 8px', background:'#eef2ff', borderRadius:12, fontSize:12}}>{c.status}</span>
                  <div style={{marginLeft:'auto', fontSize:12, color:'#6b7280'}}>Order #{c.order?.id || c.orderId}</div>
                </div>
                <div style={{fontSize:12, color:'#6b7280', marginTop:4}}>Khách: {c.customer?.fullName || c.customer?.email || '—'}</div>
              </div>
            ))}
            {list.filter(c => !['RESOLVED','REJECTED','APPROVED'].includes((c.status||'').toUpperCase())).length === 0 && (
              <div style={{padding:16, color:'#6b7280'}}>Không có khiếu nại nào cần xử lý.</div>
            )}
          </div>
        </div>
        <div style={{border:'1px solid #e5e7eb', borderRadius:12, padding:12, background:'#fff', boxShadow:'0 10px 25px rgba(0,0,0,0.04)'}}>
          {!selected ? (
            <div style={{color:'#6b7280'}}>Chọn một khiếu nại</div>
          ) : (
            <div>
              <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
                <div style={{fontWeight:700}}>Case #{selected.id}</div>
                <span style={{padding:'4px 10px', background:'#eef2ff', borderRadius:16}}>{selected.status}</span>
                <div style={{marginLeft:'auto', display:'flex', gap:8, alignItems:'center'}}>
                  <span style={{fontSize:12, color:'#6b7280'}}>
                    Staff: {selected.assignedStaff?.name || 'Chưa gán'} {selected.assignedStaff?.email ? `(${selected.assignedStaff.email})` : ''}
                  </span>
                  <button onClick={approve} style={{padding:'8px 12px'}}>Approve</button>
                  <button onClick={reject} style={{padding:'8px 12px'}}>Reject</button>
                </div>
              </div>
              {/* Order & Customer & Reason summary */}
              <div style={{
                display:'grid',
                gridTemplateColumns:'1fr 1fr 1fr',
                gap:12,
                marginBottom:12
              }}>
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
              {selected.refundQrUrl && (
                <div style={{border:'1px solid #e5e7eb', borderRadius:8, padding:10, marginBottom:12, background:'#fff'}}>
                  <div style={{fontWeight:600, marginBottom:6}}>QR chuyển khoản của khách</div>
                  <div>
                    <img
                      alt="refund-qr"
                      src={(String(selected.refundQrUrl).startsWith('data:image') || String(selected.refundQrUrl).startsWith('http')) ? selected.refundQrUrl : `http://localhost:8080${selected.refundQrUrl}`}
                      style={{maxHeight:220, border:'1px solid #e5e7eb', borderRadius:8}}
                    />
                  </div>
                </div>
              )}
              {['RESOLVED','REJECTED','APPROVED'].includes((selected.status||'').toUpperCase()) && (
                <div style={{padding:8, border:'1px solid #e5e7eb', background:'#f0fdf4', borderRadius:8, color:'#166534', marginBottom:8}}>
                  Đơn khiếu nại đã được giải quyết. Chat đã đóng.
                </div>
              )}
              <div style={{border:'1px solid #f3f4f6', borderRadius:8, padding:8, height:480, overflowY:'auto'}}>
                {messages.map((m,i)=> (
                  <div key={`${m.id || i}-${m.url ? 'att' : 'msg'}`} style={{marginBottom:8}}>
                    {m.url ? (
                      m.mimeType?.startsWith('image/') ? (
                        <a href={(m.url && !m.url.startsWith('http') ? `http://localhost:8080${m.url}` : m.url)} target="_blank" rel="noreferrer">
                          <img src={(m.url && !m.url.startsWith('http') ? `http://localhost:8080${m.url}` : m.url)} alt='att' style={{maxWidth:'60%', maxHeight:400, height:'auto', width:'auto', borderRadius:6, objectFit:'contain'}}/>
                        </a>
                      ) : (
                        <video controls src={(m.url && !m.url.startsWith('http') ? `http://localhost:8080${m.url}` : m.url)} style={{maxWidth:'60%', maxHeight:400}}/>
                      )
                    ) : (
                      <div><strong>{m.senderType}</strong>: {m.message}</div>
                    )}
                  </div>
                ))}
              </div>
              {approveOpen && (
                <div style={{marginTop:12, border:'1px solid #e5e7eb', borderRadius:8, padding:12}}>
                  <div style={{fontWeight:700, marginBottom:8}}>Phê duyệt & ký tên</div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                    <input placeholder="Số tiền refund" value={approveForm.refundAmount} onChange={(e)=>setApproveForm(f=>({...f, refundAmount:e.target.value}))} />
                    <input placeholder="Link QR chuyển khoản" value={approveForm.refundQrUrl} onChange={(e)=>setApproveForm(f=>({...f, refundQrUrl:e.target.value}))} />
                  </div>
                  <div style={{marginTop:8}}>
                    <div style={{marginBottom:6, fontWeight:600}}>Chữ ký Admin</div>
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={180}
                      style={{border:'1px solid #e5e7eb', borderRadius:6, touchAction:'none'}}
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={endDraw}
                    />
                    <div style={{display:'flex', gap:8, marginTop:6}}>
                      <button onClick={saveSign}>Lưu chữ ký</button>
                      <button onClick={clearSign}>Xóa</button>
                    </div>
                    {approveForm.adminSignature && (
                      <div style={{marginTop:6, fontSize:12, color:'#6b7280'}}>Đã lưu chữ ký</div>
                    )}
                  </div>
                  <div style={{display:'flex', gap:8, marginTop:8}}>
                    <button onClick={async ()=>{ try { await axios.post(`http://localhost:8080/api/admin/complaints/${selected.id}/approve`, { refundAmount: approveForm.refundAmount?Number(approveForm.refundAmount):undefined, refundQrUrl: approveForm.refundQrUrl, adminSignature: approveForm.adminSignature }, { headers: { Authorization: `Bearer ${token}` }}); setApproveOpen(false); load(); } catch (e) { alert(e?.response?.data || 'Approve failed'); } }}>Xác nhận</button>
                    <button onClick={()=>setApproveOpen(false)}>Hủy</button>
                  </div>
                </div>
              )}
              {rejectOpen && (
                <div style={{marginTop:12, border:'1px solid #fee2e2', background:'#fff1f2', borderRadius:8, padding:12}}>
                  <div style={{fontWeight:700, marginBottom:8}}>Từ chối & gửi email khách hàng</div>
                  <textarea placeholder="Lý do từ chối (sẽ gửi email cho khách)" value={rejectForm.reason} onChange={(e)=>setRejectForm(r=>({...r, reason:e.target.value}))} style={{width:'100%', minHeight:100}}/>
                  <div style={{display:'flex', gap:8, marginTop:8}}>
                    <button onClick={async ()=>{ try { await axios.post(`http://localhost:8080/api/admin/complaints/${selected.id}/reject`, { reason: rejectForm.reason }, { headers: { Authorization: `Bearer ${token}` }}); setRejectOpen(false); load(); } catch (e) { alert(e?.response?.data || 'Reject failed'); } }}>Gửi từ chối</button>
                    <button onClick={()=>setRejectOpen(false)}>Hủy</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


