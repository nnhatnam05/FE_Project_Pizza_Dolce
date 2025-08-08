import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../../contexts/NotificationContext';
import './VoucherManagement.css';

const VoucherManagement = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showConfirm } = useNotification();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showGiveModal, setShowGiveModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'PERCENTAGE',
        value: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        totalQuantity: '',
        expiresAt: '',
        isPublic: false
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const voucherTypes = [
        { value: 'PERCENTAGE', label: 'Giảm theo %' },
        { value: 'FIXED_AMOUNT', label: 'Giảm số tiền cố định' },
        { value: 'FREE_SHIPPING', label: 'Miễn phí ship' },
        { value: 'BUY_ONE_GET_ONE', label: 'Mua 1 tặng 1' },
        { value: 'FREE_ITEM', label: 'Tặng món' }
    ];

    useEffect(() => {
        fetchVouchers();
        fetchCustomers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/admin/vouchers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setVouchers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            setError('Failed to fetch vouchers');
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/admin/vouchers/customers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: 'PERCENTAGE',
            value: '',
            minOrderAmount: '',
            maxDiscountAmount: '',
            totalQuantity: '',
            expiresAt: '',
            isPublic: false
        });
        setError('');
        setSuccess('');
    };

    const handleCreateVoucher = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            // Prepare data
            const voucherData = {
                ...formData,
                value: parseFloat(formData.value),
                minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                totalQuantity: parseInt(formData.totalQuantity),
                expiresAt: formData.expiresAt ? formData.expiresAt + ':00' : null
            };

            const response = await axios.post('http://localhost:8080/api/admin/vouchers', voucherData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setSuccess('Voucher created successfully!');
                fetchVouchers();
                setShowCreateModal(false);
                resetForm();
            }
        } catch (error) {
            setError('Failed to create voucher: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditVoucher = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            const voucherData = {
                ...formData,
                value: parseFloat(formData.value),
                minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                totalQuantity: parseInt(formData.totalQuantity),
                expiresAt: formData.expiresAt ? formData.expiresAt + ':00' : null
            };

            const response = await axios.put(`http://localhost:8080/api/admin/vouchers/${selectedVoucher.id}`, voucherData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setSuccess('Voucher updated successfully!');
                fetchVouchers();
                setShowEditModal(false);
                resetForm();
                setSelectedVoucher(null);
            }
        } catch (error) {
            setError('Failed to update voucher: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteVoucher = async (voucherId) => {
        const confirmed = await showConfirm({
            title: 'Delete Voucher',
            message: 'Are you sure you want to delete this voucher?',
            type: 'danger',
            confirmText: 'Delete'
        });
        
        if (!confirmed) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:8080/api/admin/vouchers/${voucherId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setSuccess('Voucher deleted successfully!');
                fetchVouchers();
            }
        } catch (error) {
            setError('Failed to delete voucher: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleGiveVoucher = async (e) => {
        e.preventDefault();
        if (!selectedCustomer || !selectedVoucher) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8080/api/admin/vouchers/${selectedVoucher.id}/give-to-customer/${selectedCustomer}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess('Voucher given to customer successfully!');
                setShowGiveModal(false);
                setSelectedCustomer('');
                setSelectedVoucher(null);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Failed to give voucher: ' + (error.response?.data?.message || error.message));
        }
    };

    const openEditModal = (voucher) => {
        setSelectedVoucher(voucher);
        setFormData({
            name: voucher.name,
            description: voucher.description,
            type: voucher.type,
            value: voucher.value.toString(),
            minOrderAmount: voucher.minOrderAmount?.toString() || '',
            maxDiscountAmount: voucher.maxDiscountAmount?.toString() || '',
            totalQuantity: voucher.totalQuantity.toString(),
            expiresAt: voucher.expiresAt ? voucher.expiresAt.substring(0, 16) : '',
            isPublic: voucher.isPublic
        });
        setShowEditModal(true);
    };

    const openGiveModal = (voucher) => {
        setSelectedVoucher(voucher);
        setShowGiveModal(true);
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'No expiry';
        return new Date(dateTime).toLocaleString();
    };

    const getTypeLabel = (type) => {
        const typeObj = voucherTypes.find(t => t.value === type);
        return typeObj ? typeObj.label : type;
    };

    if (loading) {
        return <div className="voucher-loading">Loading vouchers...</div>;
    }

    return (
        <div className="voucher-management">
            <div className="voucher-header">
                <h1>Voucher Management</h1>
                <button 
                    className="btn-create-voucher"
                    onClick={() => setShowCreateModal(true)}
                >
                    Create New Voucher
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="voucher-stats">
                <div className="stat-card">
                    <h3>Total Vouchers</h3>
                    <p>{vouchers.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Vouchers</h3>
                    <p>{vouchers.filter(v => v.isActive && v.isAvailable).length}</p>
                </div>
                <div className="stat-card">
                    <h3>Public Vouchers</h3>
                    <p>{vouchers.filter(v => v.isPublic).length}</p>
                </div>
            </div>

            <div className="voucher-table-container">
                <table className="voucher-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Usage</th>
                            <th>Status</th>
                            <th>Expires</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vouchers.map(voucher => (
                            <tr key={voucher.id}>
                                <td className="voucher-code">{voucher.code}</td>
                                <td>{voucher.name}</td>
                                <td>{getTypeLabel(voucher.type)}</td>
                                <td>
                                    {voucher.type === 'PERCENTAGE' ? `${voucher.value}%` : `$${voucher.value}`}
                                </td>
                                <td>
                                    {voucher.usedQuantity}/{voucher.totalQuantity}
                                    <div className="usage-bar">
                                        <div 
                                            className="usage-fill"
                                            style={{ width: `${(voucher.usedQuantity / voucher.totalQuantity) * 100}%` }}
                                        ></div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status ${voucher.isActive ? 'active' : 'inactive'}`}>
                                        {voucher.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {voucher.isPublic && <span className="public-badge">Public</span>}
                                    {voucher.isExpired && <span className="expired-badge">Expired</span>}
                                </td>
                                <td>{formatDateTime(voucher.expiresAt)}</td>
                                <td className="voucher-actions">
                                    <button 
                                        className="btn-edit"
                                        onClick={() => openEditModal(voucher)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-give"
                                        onClick={() => openGiveModal(voucher)}
                                        disabled={!voucher.isAvailable}
                                    >
                                        Give
                                    </button>
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDeleteVoucher(voucher.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Voucher Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Create New Voucher</h2>
                            <button 
                                className="modal-close"
                                onClick={() => { setShowCreateModal(false); resetForm(); }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateVoucher} className="voucher-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type *</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {voucherTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Value *</label>
                                    <input
                                        type="number"
                                        name="value"
                                        value={formData.value}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Total Quantity *</label>
                                    <input
                                        type="number"
                                        name="totalQuantity"
                                        value={formData.totalQuantity}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Min Order Amount</label>
                                    <input
                                        type="number"
                                        name="minOrderAmount"
                                        value={formData.minOrderAmount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Max Discount Amount</label>
                                    <input
                                        type="number"
                                        name="maxDiscountAmount"
                                        value={formData.maxDiscountAmount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expires At</label>
                                    <input
                                        type="datetime-local"
                                        name="expiresAt"
                                        value={formData.expiresAt}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isPublic"
                                            checked={formData.isPublic}
                                            onChange={handleInputChange}
                                        />
                                        Make Public (visible to all customers)
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }}>
                                    Cancel
                                </button>
                                <button type="submit">Create Voucher</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Voucher Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Edit Voucher</h2>
                            <button 
                                className="modal-close"
                                onClick={() => { setShowEditModal(false); resetForm(); setSelectedVoucher(null); }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleEditVoucher} className="voucher-form">
                            {/* Same form fields as create modal */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type *</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {voucherTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Value *</label>
                                    <input
                                        type="number"
                                        name="value"
                                        value={formData.value}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Total Quantity *</label>
                                    <input
                                        type="number"
                                        name="totalQuantity"
                                        value={formData.totalQuantity}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Min Order Amount</label>
                                    <input
                                        type="number"
                                        name="minOrderAmount"
                                        value={formData.minOrderAmount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Max Discount Amount</label>
                                    <input
                                        type="number"
                                        name="maxDiscountAmount"
                                        value={formData.maxDiscountAmount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expires At</label>
                                    <input
                                        type="datetime-local"
                                        name="expiresAt"
                                        value={formData.expiresAt}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isPublic"
                                            checked={formData.isPublic}
                                            onChange={handleInputChange}
                                        />
                                        Make Public (visible to all customers)
                                    </label>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); setSelectedVoucher(null); }}>
                                    Cancel
                                </button>
                                <button type="submit">Update Voucher</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Give Voucher Modal */}
            {showGiveModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Give Voucher to Customer</h2>
                            <button 
                                className="modal-close"
                                onClick={() => { setShowGiveModal(false); setSelectedCustomer(''); setSelectedVoucher(null); }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleGiveVoucher} className="give-voucher-form">
                            <div className="voucher-info">
                                <h3>Voucher: {selectedVoucher?.name}</h3>
                                <p>Code: {selectedVoucher?.code}</p>
                                <p>Remaining: {selectedVoucher?.remainingQuantity}</p>
                            </div>

                            <div className="form-group">
                                <label>Select Customer *</label>
                                <select
                                    value={selectedCustomer}
                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                    required
                                >
                                    <option value="">Choose a customer...</option>
                                    {customers.map(customer => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.fullName} ({customer.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => { setShowGiveModal(false); setSelectedCustomer(''); setSelectedVoucher(null); }}>
                                    Cancel
                                </button>
                                <button type="submit">Give Voucher</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherManagement; 