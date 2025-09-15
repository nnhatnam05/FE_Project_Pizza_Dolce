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
    if (!reason.trim()) { setError('Vui lòng mô tả vấn đề của bạn'); return; }
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
        setError('Không thể tạo khiếu nại.');
      }
    } catch (e) {
      const msg = e?.response?.data || 'Tạo khiếu nại thất bại';
      setError(typeof msg === 'string' ? msg : 'Tạo khiếu nại thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{maxWidth: 720, margin: '0 auto', padding: 16}}>
      <h2>Gửi yêu cầu khiếu nại đơn hàng #{orderId}</h2>
      <div style={{background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16}}>
        <div style={{marginBottom: 12}}>
          <label style={{display: 'block', fontWeight: 600, marginBottom: 6}}>Loại yêu cầu</label>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{padding: 10, borderRadius: 6, border: '1px solid #e5e7eb', width: '100%'}}>
            <option value="REFUND_REQUEST">Hoàn tiền</option>
            <option value="QUALITY_COMPLAINT">Khiếu nại chất lượng</option>
            <option value="REDELIVERY_REQUEST">Giao lại đơn</option>
          </select>
        </div>
        <div style={{marginBottom: 12}}>
          <label style={{display: 'block', fontWeight: 600, marginBottom: 6}}>Mô tả vấn đề</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder="Mô tả ngắn gọn vấn đề bạn gặp phải..."
            style={{width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e7eb'}}
          />
        </div>
        {error && (
          <div style={{color: '#b91c1c', marginBottom: 12}}>{error}</div>
        )}
        <div style={{display: 'flex', gap: 8}}>
          <button onClick={() => navigate(-1)} style={{padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff'}}>Quay lại</button>
          <button onClick={submit} disabled={submitting} style={{padding: '10px 14px', borderRadius: 6, background: '#16a34a', color: '#fff'}}>
            {submitting ? 'Đang tạo...' : 'Tiếp tục chat với CSKH'}
          </button>
        </div>
      </div>
      <p style={{marginTop: 12, color: '#6b7280', fontSize: 13}}>Lưu ý: Chỉ đơn hàng đã giao trong vòng 1 giờ mới đủ điều kiện khiếu nại.</p>
    </div>
  );
}


