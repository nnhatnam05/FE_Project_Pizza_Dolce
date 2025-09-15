import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function AdminResolvedComplaints() {
  const token = useMemo(() => localStorage.getItem('token'), []);
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    try {
      // Load all cases first to see what we have
      const allRes = await axios.get('http://localhost:8080/api/admin/complaints', { headers: { Authorization: `Bearer ${token}` }});
      console.log('All cases:', allRes.data);
      
      // Treat APPROVED and REJECTED as resolved as well
      const resolvedCases = (allRes.data || []).filter(c => {
        const s = (c.status || '').toUpperCase();
        return s === 'RESOLVED' || s === 'APPROVED' || s === 'REJECTED';
      });
      console.log('RESOLVED cases:', resolvedCases);
      setList(resolvedCases);
    } catch (e) {
      console.error('Error loading resolved complaints:', e);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = list.filter(c => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      String(c.id).includes(q) ||
      String(c.order?.id || '').includes(q) ||
      (c.customer?.fullName || '').toLowerCase().includes(q) ||
      (c.customer?.email || '').toLowerCase().includes(q)
    );
  });

  const createTestCase = async () => {
    try {
      // Create a test complaint case with RESOLVED status
      const testCase = {
        orderId: 1, // Assuming order 1 exists
        reason: 'Test complaint case',
        type: 'QUALITY_ISSUE'
      };
      
      const res = await axios.post('http://localhost:8080/api/complaints', testCase, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the case to RESOLVED status
      await axios.put(`http://localhost:8080/api/admin/complaints/${res.data.id}/status`, {
        status: 'RESOLVED',
        decisionType: 'REFUND',
        refundAmount: 100
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Test case created and marked as RESOLVED');
      load();
    } catch (e) {
      console.error('Error creating test case:', e);
      alert('Error: ' + (e.response?.data?.message || e.message));
    }
  };

  return (
    <div style={{padding:16}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <h2 style={{margin:0}}>Đơn đã giải quyết khiếu nại</h2>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:16}}>
        <div style={{border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden', background:'#fff'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, padding:8, borderBottom:'1px solid #e5e7eb'}}>
            <input
              placeholder="Tìm theo Case/Order/Khách hàng"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              style={{flex:1, padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:6}}
            />
            <button onClick={load}>Làm mới</button>
          </div>
          <div style={{maxHeight:640, overflowY:'auto'}}>
            {filtered.map(c => (
              <div key={`case-${c.id}`} onClick={()=>setSelected(c)} style={{padding:12, cursor:'pointer', borderBottom:'1px solid #f3f4f6', background:selected?.id===c.id?'#f9fafb':'#fff'}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{fontWeight:700}}>#{c.id}</div>
                  <span style={{padding:'2px 8px', background:'#dcfce7', color:'#166534', borderRadius:12, fontSize:12}}>{c.status}</span>
                  <div style={{marginLeft:'auto', fontSize:12, color:'#6b7280'}}>Order: #{c.order?.id || c.orderId}</div>
                </div>
                <div style={{fontSize:12, color:'#6b7280', marginTop:4}}>Khách: {c.customer?.fullName || c.customer?.email}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{padding:16, color:'#6b7280'}}>Không có dữ liệu.</div>
            )}
          </div>
        </div>
        <div style={{border:'1px solid #e5e7eb', borderRadius:10, padding:12, background:'#fff'}}>
          {!selected ? (
            <div>Chọn một case để xem chi tiết</div>
          ) : (
            <div style={{display:'grid', gridTemplateRows:'auto 1fr', height:640}}>
              <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
                <div style={{fontWeight:700}}>Case #{selected.id}</div>
                {String(selected.status).toUpperCase() === 'RESOLVED' && (
                  <span style={{padding:'4px 8px', background:'#dcfce7', borderRadius:16, color:'#166534'}}>RESOLVED</span>
                )}
                {String(selected.status).toUpperCase() === 'APPROVED' && (
                  <span style={{padding:'4px 8px', background:'#dbeafe', borderRadius:16, color:'#1e40af'}}>APPROVED</span>
                )}
                {String(selected.status).toUpperCase() === 'REJECTED' && (
                  <span style={{padding:'4px 8px', background:'#fee2e2', borderRadius:16, color:'#991b1b'}}>REJECTED</span>
                )}
                <div style={{marginLeft:'auto', fontSize:12, color:'#6b7280'}}>
                  Order: #{selected.order?.id || selected.orderId}
                </div>
              </div>
              <div style={{border:'1px solid #f3f4f6', borderRadius:8, padding:12, overflowY:'auto'}}>
                <div style={{marginBottom:12}}>
                  <div><b>Khách hàng:</b> {selected.customer?.fullName || selected.customer?.email}</div>
                  <div><b>Loại quyết định:</b> {selected.decisionType || '—'}</div>
                  <div><b>Số tiền refund:</b> {selected.refundAmount != null ? `$${Number(selected.refundAmount).toLocaleString()}` : '—'}</div>
                  <div><b>Refund status:</b> {selected.refundStatus || '—'}</div>
                  {selected.reDeliveryOrderId && (
                    <div><b>Đơn giao lại:</b> #{selected.reDeliveryOrderId}</div>
                  )}
                  <div style={{marginTop:8}}><b>Lý do:</b> {selected.reason || '—'}</div>
                  <div style={{marginTop:8}}>
                    <b>Người quyết định:</b> {(() => {
                      const hasAdmin = !!selected.approvedByAdminId || String(selected.status).toUpperCase() === 'APPROVED' || String(selected.status).toUpperCase() === 'REJECTED';
                      if (hasAdmin) return 'Admin';
                      const staffName = selected.assignedStaff?.name || selected.assignedStaff?.username;
                      if (staffName) return staffName;
                      if (selected.decidedByStaffId) return `CSKH #${selected.decidedByStaffId}`;
                      return '—';
                    })()}
                  </div>
                </div>

                {/* Công văn xử lý khiếu nại */}
                <div style={{border:'1px dashed #e5e7eb', padding:16, borderRadius:8, background:'#fff'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                    <div style={{fontWeight:700, fontSize:16}}>Công văn xác nhận xử lý khiếu nại</div>
                    <button onClick={()=>window.print()} style={{padding:'6px 10px'}}>In</button>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                    <div>
                      <div style={{fontWeight:600, marginBottom:6}}>Thông tin khách hàng</div>
                      <div>Tên: {selected.customer?.fullName || '—'}</div>
                      <div>Email: {selected.customer?.email || '—'}</div>
                    </div>
                    <div>
                      <div style={{fontWeight:600, marginBottom:6}}>Thông tin đơn hàng</div>
                      <div>Mã đơn: #{selected.order?.id || selected.orderId}</div>
                      <div>Tổng tiền: {selected.order?.totalPrice != null ? `$${Number(selected.order.totalPrice).toLocaleString()}` : '—'}</div>
                      <div>Thanh toán: {selected.order?.paymentMethod || '—'}</div>
                    </div>
                  </div>
                  <div style={{marginTop:12}}>
                    <div style={{fontWeight:600, marginBottom:6}}>Thông tin xử lý</div>
                    <div>Trạng thái: {selected.status}</div>
                    <div>Quyết định: {selected.decisionType || '—'}</div>
                    <div>Số tiền hoàn: {selected.refundAmount != null ? `$${Number(selected.refundAmount).toLocaleString()}` : '—'}</div>
                    <div>Trạng thái hoàn: {selected.status || '—'}</div>
                    {selected.refundReference && (<div>Mã giao dịch hoàn: {selected.refundReference}</div>)}
                    {selected.assignedStaff && (
                      <div>Phụ trách: {selected.assignedStaff?.name || selected.assignedStaff?.username}</div>
                    )}
                  </div>
                  {/* chữ ký không cần hiển thị theo yêu cầu */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


