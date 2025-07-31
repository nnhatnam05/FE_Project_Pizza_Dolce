import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function OrderForm() {
  const [form, setForm] = useState({ foodIds: [], paymentMethodId: '', customerId: '' });
  const [customers, setCustomers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    axios.get('http://localhost:8080/api/foods', { headers }).then(res => setFoods(res.data));
    axios.get('http://localhost:8080/api/customers', { headers }).then(res => setCustomers(res.data));
    axios.get('http://localhost:8080/api/payment-methods', { headers }).then(res => setPaymentMethods(res.data));
    if (id) {
      axios.get(`http://localhost:8080/api/orders/${id}`, { headers }).then(res => {
        setForm({
          foodIds: res.data.foodList.map(f => f.id),
          paymentMethodId: res.data.paymentMethod?.id || '',
          customerId: res.data.customer?.id || ''
        });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFoods = (e) => {
    const value = Array.from(e.target.selectedOptions, option => Number(option.value));
    setForm({ ...form, foodIds: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    if (id) {
      await axios.put(`http://localhost:8080/api/orders/${id}`, form, { headers });
    } else {
      await axios.post('http://localhost:8080/api/orders', form, { headers });
    }
    navigate('/admin/orders');
  };

  // XÓA ĐƠN HÀNG
  const handleDelete = async () => {
    if(window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:8080/api/orders/${id}`, { headers });
      navigate('/admin/orders');
    }
  };

  return (
    <div className="container mt-4">
      <h2>{id ? "Edit Order" : "Create Order"}</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Khách hàng</label>
          <select className="form-select" name="customerId" value={form.customerId} onChange={handleChange} required>
            <option value="">-- Chọn khách hàng --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Món ăn</label>
          <select multiple className="form-select" value={form.foodIds} onChange={handleFoods}>
            {foods.map(f => <option key={f.id} value={f.id}>{f.name} (${f.price})</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Phương thức thanh toán</label>
          <select className="form-select" name="paymentMethodId" value={form.paymentMethodId} onChange={handleChange} required>
            <option value="">-- Chọn phương thức --</option>
            {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-success">{id ? "Update" : "Create"}</button>
        {id && (
          <button type="button" className="btn btn-danger ms-2" onClick={handleDelete}>
            Xóa đơn hàng
          </button>
        )}
      </form>
    </div>
  );
}
