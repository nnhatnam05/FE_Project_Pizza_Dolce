import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function AdminResolvedComplaints({ source = 'admin' }) {
  const token = useMemo(() => localStorage.getItem('token'), []);
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    try {
      if (source === 'staff') {
        // Staff endpoint already returns only resolved statuses and is permissioned for CSKH
        const res = await axios.get('http://localhost:8080/api/staff/complaints/resolved', { headers: { Authorization: `Bearer ${token}` }});
        setList(res.data || []);
      } else {
        // Admin: load all then filter client-side
        const allRes = await axios.get('http://localhost:8080/api/admin/complaints', { headers: { Authorization: `Bearer ${token}` }});
        const resolvedCases = (allRes.data || []).filter(c => {
          const s = (c.status || '').toUpperCase();
          return s === 'RESOLVED' || s === 'APPROVED' || s === 'REJECTED';
        });
        setList(resolvedCases);
      }
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
        <h2 style={{margin:0}}>Resolved Complaints</h2>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:16}}>
        <div style={{border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden', background:'#fff'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, padding:8, borderBottom:'1px solid #e5e7eb'}}>
            <input
              placeholder="Search by Case/Order/Customer"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              style={{flex:1, padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:6}}
            />
            <button onClick={load}>Refresh</button>
          </div>
          <div style={{maxHeight:640, overflowY:'auto'}}>
            {filtered.map(c => (
              <div key={`case-${c.id}`} onClick={()=>setSelected(c)} style={{padding:12, cursor:'pointer', borderBottom:'1px solid #f3f4f6', background:selected?.id===c.id?'#f9fafb':'#fff'}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{fontWeight:700}}>#{c.id}</div>
                  <span style={{padding:'2px 8px', background:'#dcfce7', color:'#166534', borderRadius:12, fontSize:12}}>{c.status}</span>
                  <div style={{marginLeft:'auto', fontSize:12, color:'#6b7280'}}>Order: #{c.order?.id || c.orderId}</div>
                </div>
                <div style={{fontSize:12, color:'#6b7280', marginTop:4}}>Customer: {c.customer?.fullName || c.customer?.email}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{padding:16, color:'#6b7280'}}>No data available.</div>
            )}
          </div>
        </div>
        <div style={{border:'1px solid #e5e7eb', borderRadius:10, padding:12, background:'#fff'}}>
          {!selected ? (
            <div>Select a case to view details</div>
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
                  <div><b>Customer:</b> {selected.customer?.fullName || selected.customer?.email}</div>
                  <div><b>Decision Type:</b> {selected.decisionType || '—'}</div>
                  <div><b>Refund Amount:</b> {selected.refundAmount != null ? `$${Number(selected.refundAmount).toLocaleString()}` : '—'}</div>
                  <div><b>Refund Status:</b> {selected.status || '—'}</div>
                  {selected.reDeliveryOrderId && (
                    <div><b>Re-delivery Order:</b> #{selected.reDeliveryOrderId}</div>
                  )}
                  <div style={{marginTop:8}}><b>Reason:</b> {selected.reason || '—'}</div>
                  <div style={{marginTop:8}}>
                    <b>Decided By:</b> {(() => {
                      const hasAdmin = !!selected.approvedByAdminId || String(selected.status).toUpperCase() === 'APPROVED' || String(selected.status).toUpperCase() === 'REJECTED';
                      if (hasAdmin) return 'Admin';
                      const staffName = selected.assignedStaff?.name || selected.assignedStaff?.username;
                      if (staffName) return staffName;
                      if (selected.decidedByStaffId) return `Support Staff #${selected.decidedByStaffId}`;
                      return '—';
                    })()}
                  </div>
                </div>

                {/* Complaint resolution document */}
                <div style={{border:'1px dashed #e5e7eb', padding:16, borderRadius:8, background:'#fff'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                    <div style={{fontWeight:700, fontSize:16}}>Complaint Resolution Confirmation</div>
                    <button onClick={()=>window.print()} style={{padding:'6px 10px'}}>Print</button>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                    <div>
                      <div style={{fontWeight:600, marginBottom:6}}>Customer Information</div>
                      <div>Name: {selected.customer?.fullName || '—'}</div>
                      <div>Email: {selected.customer?.email || '—'}</div>
                    </div>
                    <div>
                      <div style={{fontWeight:600, marginBottom:6}}>Order Information</div>
                      <div>Order ID: #{selected.order?.id || selected.orderId}</div>
                      <div>Total Price: {selected.order?.totalPrice != null ? `$${Number(selected.order.totalPrice).toLocaleString()}` : '—'}</div>
                      <div>Payment Method: {selected.order?.paymentMethod || '—'}</div>
                    </div>
                  </div>
                  <div style={{marginTop:12}}>
                    <div style={{fontWeight:600, marginBottom:6}}>Resolution Information</div>
                    <div>Status: {selected.status}</div>
                    <div>Decision: {selected.decisionType || '—'}</div>
                    <div>Refund Amount: {selected.refundAmount != null ? `$${Number(selected.refundAmount).toLocaleString()}` : '—'}</div>
                    <div>Refund Status: {selected.status || '—'}</div>
                    {selected.refundReference && (<div>Refund Transaction ID: {selected.refundReference}</div>)}
                    {selected.assignedStaff && (
                      <div>Handled By: {selected.assignedStaff?.name || selected.assignedStaff?.username}</div>
                    )}
                  </div>
                  {/* signature not required */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
