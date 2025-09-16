import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ComplaintStart() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem('token'), []);

  const [type, setType] = useState('REFUND_REQUEST');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!orderId) { setError('Order not found'); return; }
    if (!reason.trim()) { setError('Please describe your issue'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:8080/api/complaints', {
        orderId: Number(orderId),
        type,
        reason: reason.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const complaintId = res.data;
      if (complaintId) {
        navigate(`/complaints/${complaintId}`);
      } else {
        setError('Could not create complaint.');
      }
    } catch (e) {
      const msg = e?.response?.data || 'Failed to create complaint';
      setError(typeof msg === 'string' ? msg : 'Failed to create complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{maxWidth: 720, margin: '0 auto', padding: 16}}>
      <h2>Submit a complaint for order #{orderId}</h2>
      <div style={{background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16}}>
        <div style={{marginBottom: 12}}>
          <label style={{display: 'block', fontWeight: 600, marginBottom: 6}}>Request type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', width: '100%'}}>
            <option value="REFUND_REQUEST">Refund request</option>
            <option value="QUALITY_COMPLAINT">Quality complaint</option>
            <option value="REDELIVERY_REQUEST">Redelivery request</option>
          </select>
        </div>
        <div style={{marginBottom: 12}}>
          <label style={{display: 'block', fontWeight: 600, marginBottom: 6}}>Issue description</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder="Briefly describe the issue you encountered..."
            style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb'}}
          />
        </div>
        {error && (
          <div style={{color: '#b91c1c', marginBottom: 12}}>{error}</div>
        )}
        <div style={{display: 'flex', gap: 8}}>
          <button onClick={() => navigate(-1)} style={{padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff'}}>Back</button>
          <button onClick={submit} disabled={submitting} style={{padding: '10px 14px', borderRadius: 6, background: '#16a34a', color: '#fff'}}>
            {submitting ? 'Creating...' : 'Continue to chat with Support'}
          </button>
        </div>
      </div>
      <p style={{marginTop: 12, color: '#6b7280', fontSize: 13}}>Note: Only orders delivered within 1 hour are eligible for complaints.</p>
    </div>
  );
}


