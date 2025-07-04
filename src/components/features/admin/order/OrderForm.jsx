import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function OrderForm() {
  const [form, setForm] = useState({ foods: [], status: 'PENDING' });
  const [tableId, setTableId] = useState('');
  const [tables, setTables] = useState([]);
  const [foods, setFoods] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    axios.get('http://localhost:8080/api/tables', { headers }).then(res => setTables(res.data));
    axios.get('http://localhost:8080/api/foods', { headers }).then(res => setFoods(res.data));
  
    if (id) {
      axios.get(`http://localhost:8080/api/orders/${id}`, { headers }).then(res => {
        setForm({
          foods: res.data.foods.map(f => f.id),
          status: res.data.status
        });
        setTableId(res.data.table.id);
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFoods = (e) => {
    const value = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setForm({ ...form, foods: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    const payload = {
      ...form,
      table: { id: parseInt(tableId) },
      foods: form.foods.map(id => ({ id }))
    };
  
    if (id) {
      await axios.put(`http://localhost:8080/api/orders/${id}`, payload, { headers });
    } else {
      await axios.post('http://localhost:8080/api/orders', payload, { headers });
    }
    navigate('/admin/orders');
  };

  return (
    <div className="container mt-4">
      <h2>{id ? "Edit Order" : "Create Order"}</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Table</label>
          <select className="form-select" value={tableId} onChange={(e) => setTableId(e.target.value)} required>
            <option value="">-- Select Table --</option>
            {tables.map(t => <option key={t.id} value={t.id}>Table #{t.number}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Foods</label>
          <select multiple className="form-select" value={form.foods} onChange={handleFoods}>
            {foods.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Status</label>
          <select className="form-select" name="status" value={form.status} onChange={handleChange}>
            <option value="PENDING">PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
        <button type="submit" className="btn btn-success">{id ? "Update" : "Create"}</button>
      </form>
    </div>
  );
}