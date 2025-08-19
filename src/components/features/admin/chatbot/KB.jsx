import React, { useEffect, useState } from 'react';
import api from '../../../../api/axiosConfig';
import './ChatbotAdmin.css';

const KB = () => {
	const [items, setItems] = useState([]);
	const [form, setForm] = useState({ title: '', content: '', language: 'en', tags: '' });
	const [editingId, setEditingId] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const fetchData = async () => {
		setLoading(true);
		try {
			const res = await api.get('/admin/chat/kb');
			setItems(res.data);
		} catch (e) { setError('Failed to load KB'); } finally { setLoading(false); }
	};

	useEffect(() => { fetchData(); }, []);

	const resetForm = () => { setForm({ title: '', content: '', language: 'en', tags: '' }); setEditingId(null); };

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (editingId) await api.put(`/admin/chat/kb/${editingId}`, form);
			else await api.post('/admin/chat/kb', form);
			resetForm(); fetchData();
		} catch (e) { setError('Save failed'); }
	};

	const handleEdit = (it) => { setEditingId(it.id); setForm({ title: it.title, content: it.content, language: it.language || 'en', tags: it.tags || '' }); };
	const handleDelete = async (id) => { if (!window.confirm('Delete this article?')) return; await api.delete(`/admin/chat/kb/${id}`); fetchData(); };

	const seedDemo = async () => {
		try {
			await api.post('/admin/chat/kb', { title: 'Delivery Policy', content: 'We deliver within 30–45 minutes in most districts during business hours.', language: 'en', tags: 'delivery,policy' });
			await api.post('/admin/chat/kb', { title: 'Chính sách giao hàng', content: 'Chúng tôi giao trong 30–45 phút tại hầu hết các quận trong giờ làm việc.', language: 'vi', tags: 'giao hàng,quy định' });
			await api.post('/admin/chat/kb', { title: 'Refunds', content: 'Refunds are processed within 3–5 business days.', language: 'en', tags: 'refund,policy' });
			fetchData();
		} catch (e) { setError('Seed failed'); }
	};

	return (
		<div className="cb-admin">
			<div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
				<h2>Knowledge Base</h2>
				<button onClick={seedDemo}>Tạo dữ liệu demo</button>
			</div>
			<form className="cb-form" onSubmit={handleSubmit}>
				<div className="col">
					<input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
					<textarea placeholder="Content" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} required />
					<div className="row">
						<select value={form.language} onChange={e=>setForm({...form, language:e.target.value})}>
							<option value="en">EN</option>
							<option value="vi">VI</option>
						</select>
						<input placeholder="Tags (comma-separated)" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} />
						<button type="submit">{editingId ? 'Update' : 'Create'}</button>
						{editingId && <button type="button" onClick={resetForm}>Cancel</button>}
					</div>
				</div>
			</form>
			{error && <div className="cb-error">{error}</div>}
			<div className="cb-table">
				<div className="cb-thead"><div>Title</div><div>Language</div><div>Tags</div><div>Actions</div></div>
				{loading ? <div className="cb-loading">Loading...</div> : items.map(it => (
					<div className="cb-row" key={it.id}>
						<div className="ellipsis" title={it.title}>{it.title}</div>
						<div>{it.language}</div>
						<div>{it.tags}</div>
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

export default KB;
