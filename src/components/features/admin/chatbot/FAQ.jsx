import React, { useEffect, useState } from 'react';
import api from '../../../../api/axiosConfig';
import './ChatbotAdmin.css';

const FAQ = () => {
	const [items, setItems] = useState([]);
	const [form, setForm] = useState({ question: '', answer: '', language: 'en', tags: '' });
	const [editingId, setEditingId] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const fetchData = async () => {
		setLoading(true);
		try {
			const res = await api.get('/admin/chat/faq');
			setItems(res.data);
		} catch (e) { setError('Failed to load FAQ'); } finally { setLoading(false); }
	};

	useEffect(() => { fetchData(); }, []);

	const resetForm = () => { setForm({ question: '', answer: '', language: 'en', tags: '' }); setEditingId(null); };

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (editingId) await api.put(`/admin/chat/faq/${editingId}`, form);
			else await api.post('/admin/chat/faq', form);
			resetForm(); fetchData();
		} catch (e) { setError('Save failed'); }
	};

	const handleEdit = (it) => { setEditingId(it.id); setForm({ question: it.question, answer: it.answer, language: it.language || 'en', tags: it.tags || '' }); };
	const handleDelete = async (id) => { if (!window.confirm('Delete this FAQ?')) return; await api.delete(`/admin/chat/faq/${id}`); fetchData(); };

	const seedDemo = async () => {
		try {
			await api.post('/admin/chat/faq', { question: 'What are your delivery hours?', answer: 'We deliver from 9:00 to 21:00 daily.', language: 'en', tags: 'delivery,time' });
			await api.post('/admin/chat/faq', { question: 'Giờ giao hàng là khi nào?', answer: 'Chúng tôi giao từ 9:00 đến 21:00 mỗi ngày.', language: 'vi', tags: 'giao hàng,giờ' });
			await api.post('/admin/chat/faq', { question: 'Do you have vegetarian pizzas?', answer: 'Yes, we offer multiple vegetarian options.', language: 'en', tags: 'menu,vegetarian' });
			fetchData();
		} catch (e) { setError('Seed failed'); }
	};

	return (
		<div className="cb-admin">
			<div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
				<h2>Chat FAQ</h2>
				<button onClick={seedDemo}>Tạo dữ liệu demo</button>
			</div>
			<form className="cb-form" onSubmit={handleSubmit}>
				<div className="col">
					<input placeholder="Question" value={form.question} onChange={e=>setForm({...form, question:e.target.value})} required />
					<textarea placeholder="Answer" value={form.answer} onChange={e=>setForm({...form, answer:e.target.value})} required />
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
				<div className="cb-thead"><div>Question</div><div>Language</div><div>Tags</div><div>Actions</div></div>
				{loading ? <div className="cb-loading">Loading...</div> : items.map(it => (
					<div className="cb-row" key={it.id}>
						<div className="ellipsis" title={it.question}>{it.question}</div>
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

export default FAQ; 