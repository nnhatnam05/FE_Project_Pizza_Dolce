import React, { useState } from 'react';
import AdminComplaints from './AdminComplaints';
import AdminResolvedComplaints from './AdminResolvedComplaints';

export default function AdminComplaintsMenu() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div style={{ padding: 16 }}>
      <div style={{paddingTop:12, paddingBottom:16, textAlign:'center'}}>
        <div style={{fontSize:28, fontWeight:800, color:'#111827'}}>Complaints Management</div>
        <div style={{width:84, height:3, background:'#3b82f6', borderRadius:9999, margin:'8px auto 0'}}></div>
        <div style={{display:'inline-flex', gap:8, marginTop:12, background:'#f3f4f6', padding:6, borderRadius:10}}>
          <button
            onClick={()=>setTab('dashboard')}
            style={{
              padding:'10px 14px', borderRadius:8,
              background: tab==='dashboard' ? '#fff' : '#fafafa', border:'1px solid #e5e7eb',
              display:'inline-flex', alignItems:'center', gap:8
            }}
          >
            <span role="img" aria-label="dashboard">📊</span> Complaints Dashboard
          </button>
          <button
            onClick={()=>setTab('resolved')}
            style={{
              padding:'10px 14px', borderRadius:8,
              background: tab==='resolved' ? '#fff' : '#fafafa', border:'1px solid #e5e7eb',
              display:'inline-flex', alignItems:'center', gap:8
            }}
          >
            <span role="img" aria-label="resolved">✅</span> Resolved Complaints
          </button>
        </div>
      </div>
      <div style={{maxWidth:1300, margin:'0 auto'}}>
        {tab === 'dashboard' ? (
          <AdminComplaints />
        ) : (
          <AdminResolvedComplaints />
        )}
      </div>
    </div>
  );
}


