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
    
    // New states for enhanced give voucher functionality
    const [giveVoucherMode, setGiveVoucherMode] = useState(''); // 'top10', 'top50', 'all', 'specific', 'multiple'
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    
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
        { value: 'PERCENTAGE', label: 'Giảm giá theo phần trăm (%)' },
        { value: 'FIXED_AMOUNT', label: 'Giảm số tiền cố định ($)' },
        { value: 'FREE_ITEM', label: 'Tặng nước bất kì' }
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
            setFilteredCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    // Filter customers based on search term
    useEffect(() => {
        if (!customerSearchTerm) {
            setFilteredCustomers(customers);
        } else {
            const filtered = customers.filter(customer =>
                customer.fullName.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                (customer.phoneNumber && customer.phoneNumber.includes(customerSearchTerm))
            );
            setFilteredCustomers(filtered);
        }
    }, [customerSearchTerm, customers]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };
        
        // Clear fields when changing voucher type
        if (name === 'type') {
            newFormData.value = '';
            newFormData.minOrderAmount = '';
            newFormData.maxDiscountAmount = '';
        }
        
        setFormData(newFormData);

        // Real-time validation for voucher logic
        if (['type', 'value', 'minOrderAmount', 'maxDiscountAmount'].includes(name)) {
            const voucherData = {
                type: newFormData.type,
                value: parseFloat(newFormData.value) || 0,
                minOrderAmount: parseFloat(newFormData.minOrderAmount) || null,
                maxDiscountAmount: parseFloat(newFormData.maxDiscountAmount) || null
            };
            
            const validationError = validateVoucherLogic(voucherData);
            if (validationError) {
                setError(validationError);
            } else {
                setError(''); // Clear error if validation passes
            }
        }
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

    // Validation function for voucher logic
    const validateVoucherLogic = (voucherData) => {
        const { type, value, minOrderAmount, maxDiscountAmount } = voucherData;

        if (type === 'FIXED_AMOUNT') {
            // For fixed amount vouchers: minOrderAmount must be >= voucher value
            if (minOrderAmount && value && minOrderAmount < value) {
                return `❌ Logic Error: Đơn hàng tối thiểu ($${minOrderAmount}) phải lớn hơn hoặc bằng số tiền giảm ($${value}) để tránh tổng âm!`;
            }
            if (!minOrderAmount && value > 0) {
                return `❌ Logic Error: Voucher giảm số tiền cố định phải có đơn hàng tối thiểu ít nhất bằng số tiền giảm ($${value}) để tránh tổng âm.`;
            }
        } else if (type === 'PERCENTAGE') {
            // For percentage vouchers: validate percentage value
            if (value && (value <= 0 || value > 100)) {
                return `❌ Logic Error: Phần trăm giảm phải từ 0 đến 100%`;
            }
            // For percentage vouchers: if maxDiscountAmount is set, minOrderAmount should be >= maxDiscountAmount
            if (maxDiscountAmount && minOrderAmount && minOrderAmount < maxDiscountAmount) {
                return `❌ Logic Error: Đơn hàng tối thiểu ($${minOrderAmount}) nên lớn hơn hoặc bằng giảm tối đa ($${maxDiscountAmount}) để tránh tổng âm.`;
            }
            if (maxDiscountAmount && !minOrderAmount) {
                return `⚠️ Gợi ý: Nên đặt đơn hàng tối thiểu ít nhất $${maxDiscountAmount} để tránh đơn hàng nhỏ được giảm quá nhiều.`;
            }
        } else if (type === 'FREE_ITEM') {
            // For free item vouchers: value should not be negative
            if (value && value < 0) {
                return `❌ Logic Error: Giá trị ly nước không thể âm`;
            }
        }

        return null; // No validation errors
    };

    // Helper function to check if a field has validation error
    const hasValidationError = (fieldName) => {
        const voucherData = {
            type: formData.type,
            value: parseFloat(formData.value) || 0,
            minOrderAmount: parseFloat(formData.minOrderAmount) || null,
            maxDiscountAmount: parseFloat(formData.maxDiscountAmount) || null
        };
        
        const validationError = validateVoucherLogic(voucherData);
        if (!validationError) return false;

        // Check if the error is related to this field
        if (fieldName === 'minOrderAmount' && validationError.includes('Minimum order amount')) return true;
        if (fieldName === 'value' && validationError.includes('voucher value')) return true;
        if (fieldName === 'maxDiscountAmount' && validationError.includes('max discount amount')) return true;
        
        return false;
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
                expiresAt: formData.expiresAt ? formatDateTimeForBackend(formData.expiresAt) : null
            };

            // Validation: Check voucher logic
            const validationError = validateVoucherLogic(voucherData);
            if (validationError) {
                setError(validationError);
                return;
            }

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
                expiresAt: formData.expiresAt ? formatDateTimeForBackend(formData.expiresAt) : null
            };

            // Validation: Check voucher logic
            const validationError = validateVoucherLogic(voucherData);
            if (validationError) {
                setError(validationError);
                return;
            }

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

    // New enhanced give voucher functions
    const handleGiveVoucherToTopCustomers = async (topCount) => {
        if (!selectedVoucher) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8080/api/admin/vouchers/${selectedVoucher.id}/give-to-top-customers?topCount=${topCount}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess(response.data.message);
                resetGiveVoucherModal();
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Failed to give voucher to top customers: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleGiveVoucherToAllCustomers = async () => {
        if (!selectedVoucher) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8080/api/admin/vouchers/${selectedVoucher.id}/give-to-all-customers`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess(response.data.message);
                resetGiveVoucherModal();
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Failed to give voucher to all customers: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleGiveVoucherToMultipleCustomers = async () => {
        if (!selectedVoucher || selectedCustomers.length === 0) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8080/api/admin/vouchers/${selectedVoucher.id}/give-to-multiple-customers`,
                selectedCustomers,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess(response.data.message);
                resetGiveVoucherModal();
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError('Failed to give voucher to multiple customers: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetGiveVoucherModal = () => {
        setShowGiveModal(false);
        setSelectedVoucher(null);
        setGiveVoucherMode('');
        setSelectedCustomers([]);
        setSelectedCustomer('');
        setCustomerSearchTerm('');
    };

    const handleCustomerSelection = (customerId) => {
        if (giveVoucherMode === 'specific') {
            setSelectedCustomer(customerId);
        } else if (giveVoucherMode === 'multiple') {
            setSelectedCustomers(prev => {
                if (prev.includes(customerId)) {
                    return prev.filter(id => id !== customerId);
                } else {
                    return [...prev, customerId];
                }
            });
        }
    };

    const executeGiveVoucher = async () => {
        switch (giveVoucherMode) {
            case 'top10':
                await handleGiveVoucherToTopCustomers(10);
                break;
            case 'top50':
                await handleGiveVoucherToTopCustomers(50);
                break;
            case 'all':
                await handleGiveVoucherToAllCustomers();
                break;
            case 'specific':
                await handleGiveVoucher({ preventDefault: () => {} });
                break;
            case 'multiple':
                await handleGiveVoucherToMultipleCustomers();
                break;
            default:
                setError('Please select a give voucher option');
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
        
        try {
            const date = new Date(dateTime);
            if (isNaN(date.getTime())) return 'Invalid date';
            
            const now = new Date();
            const diffTime = date.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return 'Expired';
            if (diffDays === 0) return 'Expires today';
            if (diffDays === 1) return 'Expires tomorrow';
            if (diffDays <= 7) return `Expires in ${diffDays} days`;
            
            return date.toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatDateTimeForBackend = (dateTimeString) => {
        if (!dateTimeString) return null;
        
        try {
            // Convert local datetime to ISO string and send to backend
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) return null;
            
            // Format as ISO string without timezone (backend will handle as local time)
            return date.toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss
        } catch (error) {
            console.error('Error formatting datetime:', error);
            return null;
        }
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
                                    {voucher.type === 'PERCENTAGE' ? `${voucher.value}%` : 
                                     voucher.type === 'FREE_ITEM' ? 'Tặng nước' : 
                                     `$${voucher.value}`}
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

                            {/* Dynamic form fields based on voucher type */}
                            {formData.type === 'PERCENTAGE' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Phần Trăm Giảm (%) *</label>
                                            <input
                                                type="number"
                                                name="value"
                                                value={formData.value}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                placeholder="Ví dụ: 20"
                                                required
                                                className={hasValidationError('value') ? 'validation-error' : ''}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số Lượng Voucher *</label>
                                            <input
                                                type="number"
                                                name="totalQuantity"
                                                value={formData.totalQuantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                placeholder="Ví dụ: 100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Đơn Hàng Tối Thiểu ($)</label>
                                            <input
                                                type="number"
                                                name="minOrderAmount"
                                                value={formData.minOrderAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Ví dụ: 25"
                                                className={hasValidationError('minOrderAmount') ? 'validation-error' : ''}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Giảm Tối Đa ($)</label>
                                            <input
                                                type="number"
                                                name="maxDiscountAmount"
                                                value={formData.maxDiscountAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Ví dụ: 5"
                                                className={hasValidationError('maxDiscountAmount') ? 'validation-error' : ''}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.type === 'FIXED_AMOUNT' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Số Tiền Giảm ($) *</label>
                                            <input
                                                type="number"
                                                name="value"
                                                value={formData.value}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Ví dụ: 10"
                                                required
                                                className={hasValidationError('value') ? 'validation-error' : ''}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số Lượng Voucher *</label>
                                            <input
                                                type="number"
                                                name="totalQuantity"
                                                value={formData.totalQuantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                placeholder="Ví dụ: 100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Đơn Hàng Tối Thiểu ($) *</label>
                                            <input
                                                type="number"
                                                name="minOrderAmount"
                                                value={formData.minOrderAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Phải >= số tiền giảm"
                                                required
                                                className={hasValidationError('minOrderAmount') ? 'validation-error' : ''}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Giảm Tối Đa ($)</label>
                                            <input
                                                type="number"
                                                name="maxDiscountAmount"
                                                value={formData.maxDiscountAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Không cần thiết cho loại này"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.type === 'FREE_ITEM' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Giá Trị Ly Nước ($)</label>
                                            <input
                                                type="number"
                                                name="value"
                                                value={formData.value}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Ví dụ: 3 (có thể để 0)"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số Lượng Voucher *</label>
                                            <input
                                                type="number"
                                                name="totalQuantity"
                                                value={formData.totalQuantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                placeholder="Ví dụ: 100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Đơn Hàng Tối Thiểu ($)</label>
                                            <input
                                                type="number"
                                                name="minOrderAmount"
                                                value={formData.minOrderAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Không bắt buộc"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Giảm Tối Đa ($)</label>
                                            <input
                                                type="number"
                                                name="maxDiscountAmount"
                                                value={formData.maxDiscountAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Không cần thiết cho loại này"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Validation Hint for Create Form */}
                            {formData.type === 'FIXED_AMOUNT' && (
                                <div className="validation-hint">
                                    💡 <strong>Voucher Giảm Số Tiền Cố Định:</strong> 
                                    <br />
                                    • Số tiền đơn hàng tối thiểu phải lớn hơn hoặc bằng số tiền giảm
                                    <br />
                                    • Ví dụ: Giảm $10 cho đơn hàng từ $15 trở lên
                                    <br />
                                    • Trường "Giảm Tối Đa" không cần thiết cho loại này
                                </div>
                            )}
                            
                            {formData.type === 'PERCENTAGE' && (
                                <div className="validation-hint">
                                    💡 <strong>Voucher Giảm Theo Phần Trăm:</strong>
                                    <br />
                                    • Phần trăm giảm từ 0-100%
                                    <br />
                                    • Có thể đặt giới hạn giảm tối đa để kiểm soát
                                    <br />
                                    • Ví dụ: Giảm 20% tối đa $5 cho đơn hàng từ $25
                                </div>
                            )}

                            {formData.type === 'FREE_ITEM' && (
                                <div className="validation-hint">
                                    💡 <strong>Voucher Tặng Nước:</strong>
                                    <br />
                                    • Khách hàng được tặng một ly nước bất kì
                                    <br />
                                    • Giá trị có thể đặt là 0 hoặc giá ly nước để tính toán
                                    <br />
                                    • Đơn hàng tối thiểu và giảm tối đa không bắt buộc
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expires At</label>
                                    <input
                                        type="datetime-local"
                                        name="expiresAt"
                                        value={formData.expiresAt}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().slice(0, 16)}
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

                            {/* Dynamic form fields based on voucher type */}
                            {formData.type === 'PERCENTAGE' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Phần Trăm Giảm (%) *</label>
                                            <input
                                                type="number"
                                                name="value"
                                                value={formData.value}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                placeholder="Ví dụ: 20"
                                                required
                                                className={hasValidationError('value') ? 'validation-error' : ''}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số Lượng Voucher *</label>
                                            <input
                                                type="number"
                                                name="totalQuantity"
                                                value={formData.totalQuantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                placeholder="Ví dụ: 100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Đơn Hàng Tối Thiểu ($)</label>
                                            <input
                                                type="number"
                                                name="minOrderAmount"
                                                value={formData.minOrderAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Ví dụ: 25"
                                                className={hasValidationError('minOrderAmount') ? 'validation-error' : ''}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Giảm Tối Đa ($)</label>
                                            <input
                                                type="number"
                                                name="maxDiscountAmount"
                                                value={formData.maxDiscountAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Ví dụ: 5"
                                                className={hasValidationError('maxDiscountAmount') ? 'validation-error' : ''}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.type === 'FIXED_AMOUNT' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Số Tiền Giảm ($) *</label>
                                            <input
                                                type="number"
                                                name="value"
                                                value={formData.value}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Ví dụ: 10"
                                                required
                                                className={hasValidationError('value') ? 'validation-error' : ''}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số Lượng Voucher *</label>
                                            <input
                                                type="number"
                                                name="totalQuantity"
                                                value={formData.totalQuantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                placeholder="Ví dụ: 100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Đơn Hàng Tối Thiểu ($) *</label>
                                            <input
                                                type="number"
                                                name="minOrderAmount"
                                                value={formData.minOrderAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Phải >= số tiền giảm"
                                                required
                                                className={hasValidationError('minOrderAmount') ? 'validation-error' : ''}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Giảm Tối Đa ($)</label>
                                            <input
                                                type="number"
                                                name="maxDiscountAmount"
                                                value={formData.maxDiscountAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Không cần thiết cho loại này"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.type === 'FREE_ITEM' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Giá Trị Ly Nước ($)</label>
                                            <input
                                                type="number"
                                                name="value"
                                                value={formData.value}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Ví dụ: 3 (có thể để 0)"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Số Lượng Voucher *</label>
                                            <input
                                                type="number"
                                                name="totalQuantity"
                                                value={formData.totalQuantity}
                                                onChange={handleInputChange}
                                                min="1"
                                                placeholder="Ví dụ: 100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Đơn Hàng Tối Thiểu ($)</label>
                                            <input
                                                type="number"
                                                name="minOrderAmount"
                                                value={formData.minOrderAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Không bắt buộc"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Giảm Tối Đa ($)</label>
                                            <input
                                                type="number"
                                                name="maxDiscountAmount"
                                                value={formData.maxDiscountAmount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                min="0"
                                                placeholder="Không cần thiết cho loại này"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Validation Hint for Edit Form */}
                            {formData.type === 'FIXED_AMOUNT' && (
                                <div className="validation-hint">
                                    💡 <strong>Voucher Giảm Số Tiền Cố Định:</strong> 
                                    <br />
                                    • Số tiền đơn hàng tối thiểu phải lớn hơn hoặc bằng số tiền giảm
                                    <br />
                                    • Ví dụ: Giảm $10 cho đơn hàng từ $15 trở lên
                                    <br />
                                    • Trường "Giảm Tối Đa" không cần thiết cho loại này
                                </div>
                            )}
                            
                            {formData.type === 'PERCENTAGE' && (
                                <div className="validation-hint">
                                    💡 <strong>Voucher Giảm Theo Phần Trăm:</strong>
                                    <br />
                                    • Phần trăm giảm từ 0-100%
                                    <br />
                                    • Có thể đặt giới hạn giảm tối đa để kiểm soát
                                    <br />
                                    • Ví dụ: Giảm 20% tối đa $5 cho đơn hàng từ $25
                                </div>
                            )}

                            {formData.type === 'FREE_ITEM' && (
                                <div className="validation-hint">
                                    💡 <strong>Voucher Tặng Nước:</strong>
                                    <br />
                                    • Khách hàng được tặng một ly nước bất kì
                                    <br />
                                    • Giá trị có thể đặt là 0 hoặc giá ly nước để tính toán
                                    <br />
                                    • Đơn hàng tối thiểu và giảm tối đa không bắt buộc
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expires At</label>
                                    <input
                                        type="datetime-local"
                                        name="expiresAt"
                                        value={formData.expiresAt}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().slice(0, 16)}
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

            {/* Enhanced Give Voucher Modal */}
            {showGiveModal && (
                <div className="modal-overlay">
                    <div className="modal-container large-modal">
                        <div className="modal-header">
                            <h2>🎁 Give Voucher to Customers</h2>
                            <button 
                                className="modal-close"
                                onClick={resetGiveVoucherModal}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="give-voucher-content">
                            {/* Voucher Info */}
                            <div className="voucher-info">
                                <h3>📋 Voucher: {selectedVoucher?.name}</h3>
                                <div className="voucher-details">
                                    <span className="voucher-code">Code: {selectedVoucher?.code}</span>
                                    <span className="voucher-remaining">Remaining: {selectedVoucher?.remainingQuantity}</span>
                                    <span className="voucher-value">
                                        Value: {selectedVoucher?.type === 'PERCENTAGE' ? `${selectedVoucher?.value}%` : `$${selectedVoucher?.value}`}
                                    </span>
                                </div>
                            </div>

                            {/* Give Options */}
                            {!giveVoucherMode && (
                                <div className="give-options">
                                    <h3>🎯 Choose Distribution Method:</h3>
                                    <div className="option-buttons">
                                        <button 
                                            className="option-btn top-customers"
                                            onClick={() => setGiveVoucherMode('top10')}
                                        >
                                            🏆 Top 10 Customers
                                            <small>Highest points</small>
                                        </button>
                                        <button 
                                            className="option-btn top-customers"
                                            onClick={() => setGiveVoucherMode('top50')}
                                        >
                                            🥇 Top 50 Customers
                                            <small>Highest points</small>
                                        </button>
                                        <button 
                                            className="option-btn all-customers"
                                            onClick={() => setGiveVoucherMode('all')}
                                        >
                                            👥 All Customers
                                            <small>Everyone gets it</small>
                                        </button>
                                        <button 
                                            className="option-btn specific-customer"
                                            onClick={() => setGiveVoucherMode('specific')}
                                        >
                                            👤 Specific Customer
                                            <small>Choose one customer</small>
                                        </button>
                                        <button 
                                            className="option-btn multiple-customers"
                                            onClick={() => setGiveVoucherMode('multiple')}
                                        >
                                            ✅ Multiple Customers
                                            <small>Select multiple</small>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Customer Selection for specific/multiple modes */}
                            {(giveVoucherMode === 'specific' || giveVoucherMode === 'multiple') && (
                                <div className="customer-selection">
                                    <div className="selection-header">
                                        <h3>
                                            {giveVoucherMode === 'specific' ? '👤 Select One Customer:' : '✅ Select Multiple Customers:'}
                                        </h3>
                                        <button 
                                            className="back-btn"
                                            onClick={() => setGiveVoucherMode('')}
                                        >
                                            ← Back to Options
                                        </button>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="search-bar">
                                        <input
                                            type="text"
                                            placeholder="🔍 Search customers by name, email, or phone..."
                                            value={customerSearchTerm}
                                            onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                            className="search-input"
                                        />
                                    </div>

                                    {/* Customer List */}
                                    <div className="customer-list">
                                        <div className="customer-list-header">
                                            <span>Customer</span>
                                            <span>Points</span>
                                            <span>Contact</span>
                                            <span>Select</span>
                                        </div>
                                        <div className="customer-list-body">
                                            {filteredCustomers.map(customer => (
                                                <div 
                                                    key={customer.id} 
                                                    className={`customer-item ${
                                                        (giveVoucherMode === 'specific' && selectedCustomer == customer.id) ||
                                                        (giveVoucherMode === 'multiple' && selectedCustomers.includes(customer.id))
                                                        ? 'selected' : ''
                                                    }`}
                                                    onClick={() => handleCustomerSelection(customer.id)}
                                                >
                                                    <div className="customer-info">
                                                        <div className="customer-name">{customer.fullName}</div>
                                                        <div className="customer-email">{customer.email}</div>
                                                    </div>
                                                    <div className="customer-points">
                                                        <span className="points-badge">{customer.points || 0} pts</span>
                                                    </div>
                                                    <div className="customer-contact">
                                                        {customer.phoneNumber || 'N/A'}
                                                    </div>
                                                    <div className="customer-select">
                                                        {giveVoucherMode === 'specific' ? (
                                                            <input
                                                                type="radio"
                                                                name="selectedCustomer"
                                                                checked={selectedCustomer == customer.id}
                                                                onChange={() => {}}
                                                            />
                                                        ) : (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCustomers.includes(customer.id)}
                                                                onChange={() => {}}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {giveVoucherMode === 'multiple' && selectedCustomers.length > 0 && (
                                        <div className="selected-count">
                                            ✅ Selected: {selectedCustomers.length} customers
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Confirmation for top/all modes */}
                            {(giveVoucherMode === 'top10' || giveVoucherMode === 'top50' || giveVoucherMode === 'all') && (
                                <div className="confirmation-section">
                                    <div className="confirmation-header">
                                        <h3>⚠️ Confirm Distribution</h3>
                                        <button 
                                            className="back-btn"
                                            onClick={() => setGiveVoucherMode('')}
                                        >
                                            ← Back to Options
                                        </button>
                                    </div>
                                    <div className="confirmation-message">
                                        {giveVoucherMode === 'top10' && (
                                            <p>🏆 This will give the voucher to the <strong>Top 10 customers</strong> with the highest points.</p>
                                        )}
                                        {giveVoucherMode === 'top50' && (
                                            <p>🥇 This will give the voucher to the <strong>Top 50 customers</strong> with the highest points.</p>
                                        )}
                                        {giveVoucherMode === 'all' && (
                                            <p>👥 This will give the voucher to <strong>ALL customers</strong> in the system.</p>
                                        )}
                                        <p className="warning">⚠️ This action cannot be undone!</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {giveVoucherMode && (
                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="cancel-btn"
                                        onClick={resetGiveVoucherModal}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button"
                                        className="execute-btn"
                                        onClick={executeGiveVoucher}
                                        disabled={
                                            (giveVoucherMode === 'specific' && !selectedCustomer) ||
                                            (giveVoucherMode === 'multiple' && selectedCustomers.length === 0)
                                        }
                                    >
                                        🎁 Give Voucher
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherManagement; 