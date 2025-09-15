import React, { useState, useEffect, useRef, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { validatePhoneNumber } from '../../../../utils/phoneValidation';
import useAccountStatusWebSocket from '../../../../hooks/useAccountStatusWebSocket';
import AccountDeactivationModal from '../../AccountDeactivationModal';
import './Customer_Layout.css';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Create a cart context to share cart functionality across the component tree
export const CartContext = createContext();

const CustomerLayout = ({ children }) => {
    // User Profile
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
    });
    const [changePassword, setChangePassword] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // Avatar upload removed - using fixed SVG avatar

    // Shopping cart and mini cart pop-ups
    const [cart, setCart] = useState([]);
    const [showMiniCart, setShowMiniCart] = useState(false);
    const [lastAdded, setLastAdded] = useState(null);

    // 新增：订单相关状态
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Account deactivation states
    const [deactivationModalOpen, setDeactivationModalOpen] = useState(false);
    const [deactivationNotification, setDeactivationNotification] = useState(null);

    // Use account status WebSocket hook
    const { connectWebSocket, disconnectWebSocket } = useAccountStatusWebSocket();

    // Handle account deactivation
    const handleAccountDeactivated = (notification) => {
        console.log('[CustomerLayout] Account deactivated:', notification);
        setDeactivationNotification(notification);
        setDeactivationModalOpen(true);
    };

    // Handle account activation
    const handleAccountActivated = (notification) => {
        console.log('[CustomerLayout] Account activated:', notification);
        // You can show a success notification here if needed
    };


    const profileDropdownRef = useRef(null);
    const profileIconRef = useRef(null);
    const navigate = useNavigate();

    // Get customer details via token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCustomerData(token);
        }
    }, []);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        setCart(storedCart ? JSON.parse(storedCart) : []);
    }, []);

    // Sync profile data
    useEffect(() => {
        if (customer) {
            setFormData({
                fullName: customer.fullName || '',
                phoneNumber: customer.phoneNumber || '',
                address: customer.address || '',
            });
            // Avatar preview removed

            // 已登录用户，获取订单历史 - Tạm thời disable để tránh spam
            // fetchCustomerOrders();
        }
    }, [customer]);

    // Connect WebSocket when customer data is available
    useEffect(() => {
        if (customer && customer.customerId) {
            console.log('[CustomerLayout] Connecting WebSocket for customer:', customer.customerId);
            connectWebSocket(customer.customerId.toString(), handleAccountDeactivated, handleAccountActivated);
        }
    }, [customer?.customerId]); // Use customerId instead of id

    // Cleanup WebSocket on unmount
    useEffect(() => {
        return () => {
            if (customer && customer.customerId) {
                console.log('[CustomerLayout] Disconnecting WebSocket for customer:', customer.customerId);
                disconnectWebSocket();
            }
        };
    }, [customer?.customerId]);

    // 获取客户订单历史
    const fetchCustomerOrders = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setOrdersLoading(true);
            const response = await fetch('http://localhost:8080/api/orders/myorder', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data);
            setOrdersLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrdersLoading(false);
        }
    };

    // Close dropdown menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target) &&
                !profileIconRef.current.contains(event.target)
            ) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [profileDropdownRef]);

    // Get Details API
    const fetchCustomerData = async (token) => {
        try {
            const response = await fetch('http://localhost:8080/api/customer/me/detail', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCustomer(data);
                console.log('[CustomerLayout] Customer data fetched successfully:', data);
            } else if (response.status === 401) {
                console.log('[CustomerLayout] Token invalid, but keeping for WebSocket connection');
                // Don't remove token immediately - let WebSocket handle deactivation
                // Only remove if it's a real authentication error, not account deactivation
            } else {
                console.error('[CustomerLayout] Failed to fetch customer data:', response.status);
            }
        } catch (error) {
            console.error('[CustomerLayout] Error fetching customer data:', error);
        }
    };

    // --- Shopping cart handler ---
    // Add to cart and show mini cart
    const handleAddToCart = (product) => {
        let updatedCart = [];
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            updatedCart = cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                    : item
            );
        } else {
            updatedCart = [...cart, { ...product, quantity: product.quantity || 1 }];
        }
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setLastAdded(product);
        setShowMiniCart(true);
        setTimeout(() => setShowMiniCart(false), 3000);
    };
    // Remove product from cart
    const handleRemoveFromCart = (id) => {
        const updatedCart = cart.filter(item => item.id !== id);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    // --- Personal data and form processing ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setChangePassword((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    // Avatar upload function removed

    // Using imported validatePhoneNumber function

    // Update your personal information（multipart/form-data）
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorMessage('You need to login to update your profile');
                return;
            }

            // Validate phone number if provided
            if (formData.phoneNumber) {
                const phoneError = validatePhoneNumber(formData.phoneNumber);
                if (phoneError) {
                    setErrorMessage(phoneError);
                    setTimeout(() => setErrorMessage(''), 3000);
                    return;
                }
            }
            const formDataToSend = new FormData();
            const detailObject = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                point: customer?.point || 0,
                voucher: customer?.voucher || 0,
            };
            const detailBlob = new Blob([JSON.stringify(detailObject)], { type: 'application/json' });
            formDataToSend.append('detail', detailBlob);
            // No image upload needed
            const response = await fetch('http://localhost:8080/api/customer/me/detail', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataToSend,
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Update failed: ' + errorText);
            }
            const updatedCustomer = await response.json();
            setCustomer(updatedCustomer);
            setEditMode(false);
            setSuccessMessage('Update successful');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage(error.message || 'Update failed');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handlePasswordSubmit = async () => {
        if (changePassword.newPassword !== changePassword.confirmPassword) {
            setErrorMessage('New passwords do not match');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorMessage('You need to login to change your password');
                return;
            }
            const response = await fetch('http://localhost:8080/api/customer/change-password', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword: changePassword.oldPassword,
                    newPassword: changePassword.newPassword,
                }),
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Password change failed');
            }
            setChangePassword({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setShowChangePassword(false);
            setSuccessMessage('Password changed successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage(error.message || 'Password change failed');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorMessage('You need to login to delete your account');
                return;
            }
            const response = await fetch('http://localhost:8080/api/customer/me/detail', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Account deletion failed');
            handleLogout();
            setShowModal(false);
            setShowDeleteConfirm(false);
        } catch (error) {
            setErrorMessage(error.message || 'Account deletion failed');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    // Log out
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setCustomer(null);
        setIsProfileOpen(false);
    };

    // Toggle profile drop-down menu
    const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
    // Check for login and redirect if needed
    const checkLoginAndRedirect = (action) => {
        if (!customer) {
            navigate('/login/customer');
            return;
        }
        action();
    };
    // Show personal information modal
    const showCustomerInfo = () => {
        setShowModal(true);
        setIsProfileOpen(false);
    };
    // Open the change password modal
    const openChangePasswordModal = () => {
        // Check if user logged in with Google then don't allow password change
        if (customer && customer.customer && (customer.customer.provider === 'GOOGLE' || customer.customer.provider === 'google')) {
            setShowChangePassword(true);
            setShowModal(true);
            setIsProfileOpen(false);
            return;
        }
        setShowChangePassword(true);
        setShowModal(true);
        setIsProfileOpen(false);
    };
    // Jump to the order history page
    const goToOrderHistory = () => {
        navigate('/order-history');
        setIsProfileOpen(false);
    };

    return (
        <CartContext.Provider value={{
            cart,
            setCart,
            handleAddToCart,
            handleRemoveFromCart,
            showMiniCart,
            setShowMiniCart,
            // 添加订单相关状态和函数
            customer,
            orders,
            ordersLoading,
            fetchCustomerOrders
        }}>
            <div className="pizza4ps-root">
                {/* Header */}
                <header className="p4-header">
                    <div className="p4-logo" onClick={() => navigate('/')}>DOLCE</div>
                    {/* <div className="p4-search">
                        <input type="text" placeholder="Search" />
                    </div> */}
                    <div className="p4-header-actions">
                        {/* Personal data */}
                        <div className="p4-profile">
                            <div
                                className="p4-profile-avatar-container"
                                onClick={toggleProfile}
                                ref={profileIconRef}
                            >
                                <svg width="40" height="40" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="p4-profile-avatar-svg">
                                    <rect width="150" height="150" fill="#f0f0f0" />
                                    <circle cx="75" cy="60" r="25" fill="#ccc" />
                                    <path d="M30 120c0-25 20-45 45-45s45 20 45 45v30H30z" fill="#ccc" />
                                </svg>
                            </div>
                            <div
                                className={`p4-profile-dropdown ${isProfileOpen ? 'show' : ''}`}
                                ref={profileDropdownRef}
                            >
                                <span>
                                    {customer ? (
                                        <>
                                            Hello, <b>{customer?.fullName || 'Customer'}</b>
                                            {customer.customer && customer.customer.provider && (customer.customer.provider === 'GOOGLE' || customer.customer.provider === 'google') && (
                                                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                                                    Google Account
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>Welcome to<br /><b>Dolce</b></>
                                    )}
                                </span>
                                <div className="p4-profile-btns">
                                    {customer ? (
                                        <button className="p4-btn-main" onClick={handleLogout}>Logout</button>
                                    ) : (
                                        <>
                                            <button className="p4-btn-main" onClick={() => navigate('/signup')}>Sign Up</button>
                                            <button className="p4-btn-secondary" onClick={() => navigate('/login/customer')}>Login</button>
                                        </>
                                    )}
                                </div>
                                <div className="p4-profile-list">
                                    <span onClick={() => checkLoginAndRedirect(showCustomerInfo)}>😊 Personal Information</span>
                                    <span onClick={() => checkLoginAndRedirect(() => navigate('/addresses'))}>📍 Manage Addresses</span>
                                    <span onClick={() => checkLoginAndRedirect(() => navigate('/vouchers'))}>🎫 My Vouchers</span>
                                    {/* Only show change password button if not logged in with Google */}
                                    {customer && customer.customer && customer.customer.provider !== 'GOOGLE' && customer.customer.provider !== 'google' && (
                                        <span onClick={() => checkLoginAndRedirect(openChangePasswordModal)}>🔑 Change Password</span>
                                    )}
                                    {/* Show notice for Google login */}
                                    {customer && customer.customer && (customer.customer.provider === 'GOOGLE' || customer.customer.provider === 'google') && (
                                        <span style={{ color: '#888', fontSize: '0.9rem', cursor: 'default' }}>
                                            🔑 Password (Google Account)
                                        </span>
                                    )}
                                    <span onClick={() => checkLoginAndRedirect(goToOrderHistory)}>🕒 Order History</span>
                                </div>
                            </div>
                        </div>
                        {/* Cart */}
                        <div className="p4-cart">
                            <span className="p4-cart-icon" onClick={() => navigate('/cart')}>
                                <ShoppingCartIcon style={{ color: 'white', fontSize: '24px' }} />
                            </span>
                            <span className="p4-cart-count">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                            {/* Mini Cart Popup */}
                            {showMiniCart && lastAdded && (
                                <div className="p4-mini-cart-popup">
                                    <div className="mini-cart-title">A new item has been added to your cart</div>
                                    <div className="p4-mini-cart-product">
                                        <img
                                            src={
                                                lastAdded.imageUrl?.startsWith('http')
                                                    ? lastAdded.imageUrl
                                                    : lastAdded.imageUrl
                                                        ? `http://localhost:8080${lastAdded.imageUrl}`
                                                        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ET0xDRTwvdGV4dD4KPHN2Zz4K'
                                            }
                                            alt={lastAdded.name || ''}
                                            className="p4-mini-cart-product-img"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ET0xDRTwvdGV4dD4KPHN2Zz4K';
                                            }}
                                        />
                                        <div className="p4-mini-cart-product-info">
                                            <div className="p4-mini-cart-product-name">{lastAdded.name}</div>
                                            <div className="p4-mini-cart-product-price">
                                                {Number(lastAdded.price).toLocaleString()} $
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </header>

                {/* Navigation links */}
                <div className="p4-nav-links">
                    <span onClick={() => navigate('/voucher-policy')}>Dolce eGift-voucher</span>
                    <span onClick={() => navigate('/delivery-policy')}>Delivery Policy</span>
                    <span onClick={() => navigate('/about-us')}>About Us</span>
                    <span onClick={() => navigate('/contact-us')}>Contact Us</span>
                </div>

                {/* Profile modal */}
                {showModal && (
                    <div className="p4-modal-overlay">
                        <div className="p4-modal">
                            <div className="p4-modal-header">
                                <h2>{showChangePassword ? 'Change Password' : 'Personal Information'}</h2>
                                <button className="p4-modal-close" onClick={() => {
                                    setShowModal(false);
                                    setEditMode(false);
                                    setShowChangePassword(false);
                                    setShowDeleteConfirm(false);
                                    setErrorMessage('');
                                    setSuccessMessage('');
                                    if (customer) {
                                        setFormData({
                                            fullName: customer.fullName || '',
                                            phoneNumber: customer.phoneNumber || '',
                                            address: customer.address || '',
                                        });
                                    }
                                }}>×</button>
                            </div>
                            {successMessage && (
                                <div className="p4-modal-message success">
                                    {successMessage}
                                </div>
                            )}
                            {errorMessage && (
                                <div className="p4-modal-message error">
                                    {errorMessage}
                                </div>
                            )}
                            <div className="p4-modal-body">
                                {showDeleteConfirm ? (
                                    <div className="p4-delete-confirm">
                                        <h3>Confirm Account Deletion?</h3>
                                        <p>Are you sure you want to delete this account? This action cannot be undone.</p>
                                        <div className="p4-modal-actions">
                                            <button className="p4-btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                                            <button className="p4-btn-danger" onClick={handleDeleteAccount}>Delete</button>
                                        </div>
                                    </div>
                                ) : showChangePassword ? (
                                    <div className="p4-change-password">
                                        {/* Check if user logged in with Google */}
                                        {customer && customer.customer && (customer.customer.provider === 'GOOGLE' || customer.customer.provider === 'google') ? (
                                            <div className="p4-google-login-notice">
                                                <h3>🔐 Google Account Login</h3>
                                                <p>Password change is not available for accounts logged in via Google. Please manage your password through your Google account settings.</p>
                                                <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '10px' }}>
                                                    <strong>Note:</strong> Your account is linked to Google, so password management is handled through your Google account.
                                                </p>
                                                <div className="p4-modal-actions">
                                                    <button className="p4-btn-secondary" onClick={() => setShowChangePassword(false)}>Close</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p4-form-group">
                                                    <label>Current Password</label>
                                                    <input
                                                        type="password"
                                                        name="oldPassword"
                                                        value={changePassword.oldPassword}
                                                        onChange={handlePasswordChange}
                                                    />
                                                </div>
                                                <div className="p4-form-group">
                                                    <label>New Password</label>
                                                    <input
                                                        type="password"
                                                        name="newPassword"
                                                        value={changePassword.newPassword}
                                                        onChange={handlePasswordChange}
                                                    />
                                                </div>
                                                <div className="p4-form-group">
                                                    <label>Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={changePassword.confirmPassword}
                                                        onChange={handlePasswordChange}
                                                    />
                                                </div>
                                                <div className="p4-modal-actions">
                                                    <button className="p4-btn-secondary" onClick={() => setShowChangePassword(false)}>Cancel</button>
                                                    <button className="p4-btn-main" onClick={handlePasswordSubmit}>Save</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="p4-customer-info">
                                            <div className="p4-customer-avatar">
                                                <div className="p4-avatar-fixed">
                                                    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <rect width="150" height="150" fill="#f0f0f0" />
                                                        <circle cx="75" cy="60" r="25" fill="#ccc" />
                                                        <path d="M30 120c0-25 20-45 45-45s45 20 45 45v30H30z" fill="#ccc" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="p4-customer-details">
                                                <h3 className="p4-section-title">Basic Information</h3>
                                                <div className="p4-form-group">
                                                    <label>Full Name</label>
                                                    {editMode ? (
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            value={formData.fullName}
                                                            onChange={handleInputChange}
                                                        />
                                                    ) : (
                                                        <p>{customer?.fullName || 'Not updated'}</p>
                                                    )}
                                                </div>
                                                <div className="p4-form-group">
                                                    <label>Email</label>
                                                    <p className="readonly">{customer?.email}</p>
                                                </div>
                                                <div className="p4-form-group">
                                                    <label>Phone Number</label>
                                                    {editMode ? (
                                                        <input
                                                            type="tel"
                                                            name="phoneNumber"
                                                            value={formData.phoneNumber}
                                                            onChange={handleInputChange}
                                                            placeholder="0xxxxxxxxx or +84xxxxxxxxx"
                                                        />
                                                    ) : (
                                                        <p>{customer?.phoneNumber || 'Not updated'}</p>
                                                    )}
                                                </div>
                                                <div className="p4-divider"></div>
                                                <h3 className="p4-section-title">Delivery Addresses</h3>
                                                <div className="p4-form-group">
                                                    <label>Addresses</label>
                                                    <div className="p4-address-list">
                                                        {customer?.addresses && customer.addresses.length > 0 ? (
                                                            customer.addresses.map((address, index) => (
                                                                <div key={index} className="p4-address-item">
                                                                    <div className="p4-address-header">
                                                                        <span className="p4-address-name">{address.name}</span>
                                                                        {address.isDefault && (
                                                                            <span className="p4-address-default">Default</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="p4-address-details">
                                                                        <div className="p4-address-text">{address.address}</div>
                                                                        <div className="p4-address-phone">📞 {address.phoneNumber}</div>
                                                                        {address.note && (
                                                                            <div className="p4-address-note">📝 {address.note}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="p4-no-addresses">
                                                                <p>No addresses found</p>
                                                                <button
                                                                    className="p4-btn-link"
                                                                    onClick={() => {
                                                                        setShowModal(false);
                                                                        navigate('/addresses');
                                                                    }}
                                                                >
                                                                    Add your first address
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div className="p4-address-actions">
                                                            <button
                                                                className="p4-btn-link"
                                                                onClick={() => {
                                                                    setShowModal(false);
                                                                    navigate('/addresses');
                                                                }}
                                                            >
                                                                Manage Addresses
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p4-divider"></div>
                                                <div className="p4-form-group">
                                                    <label>Loyalty Points</label>
                                                    <p className="readonly">{customer?.point || 0} points</p>
                                                </div>
                                                {/* <div className="p4-form-group">
                                                    <label>Vouchers</label>
                                                    <p className="readonly">{customer?.voucher || 0} vouchers</p>
                                                </div> */}
                                                {/* Display information about login type */}
                                                {customer && customer.customer && customer.customer.provider && (
                                                    <>
                                                        <div className="p4-divider"></div>
                                                        <h3 className="p4-section-title">Account</h3>
                                                        <div className="p4-form-group">
                                                            <label>Login Method</label>
                                                            <p className="readonly">
                                                                {customer.customer.provider === 'GOOGLE' || customer.customer.provider === 'google'
                                                                    ? 'Google Account (Password change not available)'
                                                                    : 'Email/Password'}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p4-modal-actions">
                                            {editMode ? (
                                                <>
                                                    <button className="p4-btn-secondary" onClick={() => {
                                                        setEditMode(false);
                                                        if (customer) {
                                                            setFormData({
                                                                fullName: customer.fullName || '',
                                                                phoneNumber: customer.phoneNumber || '',
                                                                address: customer.address || '',
                                                            });
                                                        }
                                                    }}>Cancel</button>
                                                    <button className="p4-btn-main" onClick={handleSubmit}>Save</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="p4-btn-main" onClick={() => setEditMode(true)}>Edit</button>
                                                    {/* Only show change password button if not logged in with Google */}
                                                    {customer && customer.customer && customer.customer.provider !== 'GOOGLE' && customer.customer.provider !== 'google' && (
                                                        <button className="p4-btn-secondary" onClick={openChangePasswordModal}>Change Password</button>
                                                    )}
                                                    {/* Hiển thị nút thông báo cho Google login */}
                                                    {customer && customer.customer && (customer.customer.provider === 'GOOGLE' || customer.customer.provider === 'google') && (
                                                        <button className="p4-btn-secondary" onClick={openChangePasswordModal} style={{ opacity: 0.7 }}>
                                                            Password (Google)
                                                        </button>
                                                    )}
                                                    {/* <button className="p4-btn-danger" onClick={() => setShowDeleteConfirm(true)}>Delete Account</button> */}
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main content */}
                {children}

                {/* Floating Chat Button */}
                <button
                    onClick={() => navigate('/chat')}
                    aria-label="Open chat"
                    style={{
                        position: 'fixed',
                        right: 20,
                        bottom: 20,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'linear-gradient(135deg,#6366f1,#22c55e)',
                        color: '#fff',
                        boxShadow: '0 10px 15px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        zIndex: 100000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22
                    }}
                >
                    💬
                </button>

                {/* footer */}
                <footer className="p4-footer">
                    <div className="p4-footer-main">
                        <div className="p4-footer-column">
                            <div className="p4-footer-logo">DOLCE</div>
                            <div className="p4-footer-text">Dolce Corporation</div>
                            <div className="p4-footer-title">Address</div>
                            <div className="p4-footer-text">123 Main Street, Downtown, New York, NY 10001</div>
                            <div className="p4-footer-title">Call our Hotline for additional support</div>
                            <div className="p4-footer-text">+1-800-DOLCE</div>
                        </div>
                        <div className="p4-footer-column">
                            <div className="p4-footer-title">Food Safety Certification</div>
                            <div className="p4-footer-text">Certificate No. 200/2023/FS-CERT issued by the Food Safety Administration on 08/07/2023</div>
                            <div className="p4-footer-title">Business Registration</div>
                            <div className="p4-footer-text">No. 0313188651 issued by the Department of Planning and Investment on 19/03/2022</div>
                        </div>
                        <div className="p4-footer-column">
                            <div className="p4-footer-title">Policies & Regulations</div>
                            <div className="p4-footer-link">Privacy Policy</div>
                            <div className="p4-footer-link">Return Policy</div>
                            <div className="p4-footer-link">Terms & Conditions & Vouchers</div>
                            <div className="p4-footer-title">Customer Service</div>
                            <div className="p4-footer-link">Delivery Policy</div>
                            <div className="p4-footer-link">Returns & Refund Policy</div>
                        </div>
                        <div className="p4-footer-column">
                            <div className="p4-footer-title">Be the first to receive our latest updates</div>
                            <div className="p4-footer-subscribe">
                                <input type="email" placeholder="Enter your email here" />
                                <button>Subscribe</button>
                            </div>
                            {/* <div className="p4-footer-title">Follow us on social media</div>
                            <div className="p4-social-icons">
                                <span className="p4-social facebook"></span>
                                <span className="p4-social instagram"></span>
                                <span className="p4-social youtube"></span>
                                <span className="p4-trusted-badge"></span>
                            </div> */}
                        </div>
                    </div>
                    <div className="p4-footer-bottom">
                        <span>Copyright © 2025 Dolce. All Rights Reserved</span>
                    </div>
                </footer>

                {/* Account Deactivation Modal */}
                <AccountDeactivationModal
                    isOpen={deactivationModalOpen}
                    onClose={() => {
                        setDeactivationModalOpen(false);
                        setDeactivationNotification(null);
                        // Clear storage and redirect to login
                        localStorage.clear();
                        sessionStorage.clear();
                        navigate('/login/customer');
                    }}
                    notification={deactivationNotification}
                />
            </div>
        </CartContext.Provider>
    );
};

export default CustomerLayout;
