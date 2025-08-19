import React, { useEffect, useState } from 'react';
import api from '../../../../api/axiosConfig';
import './ChatbotAdmin.css';

const Entities = () => {
	const [items, setItems] = useState([]);
	const [form, setForm] = useState({ name: '', valuesJson: '[]', active: true });
	const [editingId, setEditingId] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const fetchData = async () => {
		setLoading(true);
		try {
			const res = await api.get('/admin/chat/entities');
			setItems(res.data);
		} catch (e) { setError('Failed to load entities'); } finally { setLoading(false); }
	};

	useEffect(() => { fetchData(); }, []);

	const resetForm = () => { setForm({ name: '', valuesJson: '[]', active: true }); setEditingId(null); };

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (editingId) await api.put(`/admin/chat/entities/${editingId}`, form);
			else await api.post('/admin/chat/entities', form);
			resetForm(); fetchData();
		} catch (e) { setError('Save failed'); }
	};

	const handleEdit = (it) => { setEditingId(it.id); setForm({ name: it.name, valuesJson: it.valuesJson || '[]', active: !!it.active }); };
	const handleDelete = async (id) => { if (!window.confirm('Delete this entity?')) return; await api.delete(`/admin/chat/entities/${id}`); fetchData(); };

	const seedDemo = async () => {
		try {
			await api.post('/admin/chat/entities', { name: 'MenuCategory', valuesJson: JSON.stringify(['Pizza','Appetizers','Salads','Drinks','Pasta','Other']), active: true });
			await api.post('/admin/chat/entities', { name: 'CityArea', valuesJson: JSON.stringify(['District 1','District 3','District 7']), active: true });
			fetchData();
		} catch (e) { setError('Seed failed'); }
	};

	return (
		<div className="cb-admin">
			<div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
				<h2>Chat Entities</h2>
				<button onClick={seedDemo}>Tạo dữ liệu demo</button>
			</div>
			<form className="cb-form" onSubmit={handleSubmit}>
				<div className="row">
					<input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
					<input placeholder="Values JSON (array)" value={form.valuesJson} onChange={e=>setForm({...form, valuesJson:e.target.value})} />
					<label className="chk"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form, active:e.target.checked})} /> Active</label>
					<button type="submit">{editingId ? 'Update' : 'Create'}</button>
					{editingId && <button type="button" onClick={resetForm}>Cancel</button>}
				</div>
			</form>
			{error && <div className="cb-error">{error}</div>}
			<div className="cb-table">
				<div className="cb-thead"><div>Name</div><div>Values</div><div>Active</div><div>Actions</div></div>
				{loading ? <div className="cb-loading">Loading...</div> : items.map(it => (
					<div className="cb-row" key={it.id}>
						<div>{it.name}</div>
						<div className="mono">{it.valuesJson}</div>
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

export default Entities;
