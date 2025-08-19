import React, { useEffect, useState } from 'react';
import api from '../../../../api/axiosConfig';
import './ChatbotAdmin.css';

const Intents = () => {
	const [items, setItems] = useState([]);
	const [form, setForm] = useState({ name: '', description: '', active: true });
	const [editingId, setEditingId] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const fetchData = async () => {
		setLoading(true);
		try {
			const res = await api.get('/admin/chat/intents');
			setItems(res.data);
		} catch (e) {
			setError('Failed to load intents');
		} finally { setLoading(false); }
	};

	useEffect(() => { fetchData(); }, []);

	const resetForm = () => { setForm({ name: '', description: '', active: true }); setEditingId(null); };

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (editingId) {
				await api.put(`/admin/chat/intents/${editingId}`, form);
			} else {
				await api.post('/admin/chat/intents', form);
			}
			resetForm();
			fetchData();
		} catch (e) { setError('Save failed'); }
	};

	const handleEdit = (it) => { setEditingId(it.id); setForm({ name: it.name, description: it.description || '', active: !!it.active }); };
	const handleDelete = async (id) => { if (!window.confirm('Delete this intent?')) return; await api.delete(`/admin/chat/intents/${id}`); fetchData(); };

	const seedDemo = async () => {
		try {
			await api.post('/admin/chat/intents', { name: 'DeliveryTime', description: 'Questions about delivery times', active: true });
			await api.post('/admin/chat/intents', { name: 'MenuInfo', description: 'Questions about menu and prices', active: true });
			await api.post('/admin/chat/intents', { name: 'PolicyFAQ', description: 'Store policies and common questions', active: true });
			fetchData();
		} catch (e) { setError('Seed failed'); }
	};

	return (
		<div className="cb-admin">
			<div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
				<h2>Chat Intents</h2>
				<button onClick={seedDemo}>Tạo dữ liệu demo</button>
			</div>
			<form className="cb-form" onSubmit={handleSubmit}>
				<div className="row">
					<input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
					<input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
					<label className="chk"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} /> Active</label>
					<button type="submit">{editingId ? 'Update' : 'Create'}</button>
					{editingId && <button type="button" onClick={resetForm}>Cancel</button>}
				</div>
			</form>
			{error && <div className="cb-error">{error}</div>}
			<div className="cb-table">
				<div className="cb-thead">
					<div>Name</div><div>Description</div><div>Active</div><div>Actions</div>
				</div>
				{loading ? <div className="cb-loading">Loading...</div> : items.map(it => (
					<div className="cb-row" key={it.id}>
						<div>{it.name}</div>
						<div>{it.description}</div>
						<div>{String(it.active)}</div>
						<div className="cb-actions">
							<button onClick={()=>handleEdit(it)}>Edit</button>
							<button className="danger" onClick={()=>handleDelete(it.id)}>Delete</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Intents; 