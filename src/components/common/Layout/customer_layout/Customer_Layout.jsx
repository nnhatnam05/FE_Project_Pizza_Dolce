import React, { useState, useEffect, useRef, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
        imageUrl: '',
    });
    const [changePassword, setChangePassword] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Shopping cart and mini cart pop-ups
    const [cart, setCart] = useState([]);
    const [showMiniCart, setShowMiniCart] = useState(false);
    const [lastAdded, setLastAdded] = useState(null);
    
    // 新增：订单相关状态
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);


    const profileDropdownRef = useRef(null);
    const profileIconRef = useRef(null);
    const fileInputRef = useRef(null);
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
                imageUrl: customer.imageUrl || '',
            });
            setAvatarPreview(customer.imageUrl || null);
            
            // 已登录用户，获取订单历史
            fetchCustomerOrders();
        }
    }, [customer]);
    
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

            if (!response.ok) {
                if (response.status === 401) localStorage.removeItem('token');
                return;
            }
            const data = await response.json();
            setCustomer(data);
        } catch (error) {
            console.error('Failed to fetch customer data:', error);
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
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
        setAvatarFile(file);
    };

    // Update your personal information（multipart/form-data）
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setErrorMessage('You need to login to update your profile');
                return;
            }
            const formDataToSend = new FormData();
            const detailObject = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                imageUrl: formData.imageUrl,
                point: customer?.point || 0,
                voucher: customer?.voucher || 0,
            };
            const detailBlob = new Blob([JSON.stringify(detailObject)], { type: 'application/json' });
            formDataToSend.append('detail', detailBlob);
            if (avatarFile) formDataToSend.append('image', avatarFile);
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
            setAvatarFile(null);
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
                    <div className="p4-search">
                        <input type="text" placeholder="Search" />
                    </div>
                    <div className="p4-header-actions">
                        {/* Personal data */}
                        <div className="p4-profile">
                            {customer?.imageUrl ? (
                                <img
                                    src={
                                        customer?.imageUrl
                                            ? (customer.imageUrl.startsWith('http')
                                                ? customer.imageUrl
                                                : `http://localhost:8080${customer.imageUrl}`)
                                            : 'https://via.placeholder.com/150'
                                    }
                                    alt={customer?.fullName || 'Avatar'}
                                    className="p4-profile-avatar"
                                    onClick={toggleProfile}
                                    ref={profileIconRef}
                                />
                            ) : (
                                <span
                                    className="p4-profile-icon"
                                    onClick={toggleProfile}
                                    ref={profileIconRef}
                                ></span>
                            )}
                            <div
                                className={`p4-profile-dropdown ${isProfileOpen ? 'show' : ''}`}
                                ref={profileDropdownRef}
                            >
                                <span>
                                    {customer ? (
                                        <>Hello, <b>{customer?.fullName || 'Customer'}</b></>
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
                                    <span onClick={() => checkLoginAndRedirect(openChangePasswordModal)}>🔑 Change Password</span>
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
                                                    : 'https://via.placeholder.com/60'
                                            }
                                            alt={lastAdded.name || ''}
                                            className="p4-mini-cart-product-img"
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.src = 'https://via.placeholder.com/60?text=DOLCE';
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
                    <span>Dolce eGift-voucher</span>
                    <span>Delivery Policy</span>
                    <span>Returns & Refund Policy</span>
                    <span>Hotline: +1-800-DOLCE</span>
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
                                    setAvatarPreview(customer?.imageUrl || null);
                                    setAvatarFile(null);
                                    if (customer) {
                                        setFormData({
                                            fullName: customer.fullName || '',
                                            phoneNumber: customer.phoneNumber || '',
                                            address: customer.address || '',
                                            imageUrl: customer.imageUrl || '',
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
                                    </div>
                                ) : (
                                    <>
                                        <div className="p4-customer-info">
                                            <div className="p4-customer-avatar">
                                                {editMode ? (
                                                    <div className="p4-avatar-upload">
                                                        <img
                                                            src={
                                                                avatarPreview
                                                                    ? (avatarPreview.startsWith('data:')
                                                                        ? avatarPreview
                                                                        : (avatarPreview.startsWith('http')
                                                                            ? avatarPreview
                                                                            : `http://localhost:8080${avatarPreview}`))
                                                                    : 'https://via.placeholder.com/150'
                                                            }
                                                            alt="Preview"
                                                            className="p4-avatar-preview"
                                                        />
                                                        <input
                                                            type="file"
                                                            id="avatar-file-input"
                                                            ref={fileInputRef}
                                                            accept="image/*"
                                                            onChange={handleAvatarChange}
                                                            style={{ display: 'none' }}
                                                        />
                                                        <button
                                                            className="p4-avatar-select-btn"
                                                            onClick={() => {
                                                                if (fileInputRef.current) {
                                                                    fileInputRef.current.click();
                                                                } else {
                                                                    document.getElementById('avatar-file-input')?.click();
                                                                }
                                                            }}
                                                            type="button"
                                                        >
                                                            Choose Image
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={
                                                            customer?.imageUrl
                                                                ? (customer.imageUrl.startsWith('http')
                                                                    ? customer.imageUrl
                                                                    : `http://localhost:8080${customer.imageUrl}`)
                                                                : 'https://via.placeholder.com/150'
                                                        }
                                                        alt={customer?.fullName || 'Customer'}
                                                    />

                                                )}
                                            </div>
                                            <div className="p4-customer-details">
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
                                                            type="text"
                                                            name="phoneNumber"
                                                            value={formData.phoneNumber}
                                                            onChange={handleInputChange}
                                                        />
                                                    ) : (
                                                        <p>{customer?.phoneNumber || 'Not updated'}</p>
                                                    )}
                                                </div>
                                                <div className="p4-form-group">
                                                    <label>Address</label>
                                                    {editMode ? (
                                                        <textarea
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={handleInputChange}
                                                            rows="3"
                                                        ></textarea>
                                                    ) : (
                                                        <p>{customer?.address || 'Not updated'}</p>
                                                    )}
                                                </div>
                                                <div className="p4-form-group">
                                                    <label>Loyalty Points</label>
                                                    <p className="readonly">{customer?.point || 0} points</p>
                                                </div>
                                                <div className="p4-form-group">
                                                    <label>Vouchers</label>
                                                    <p className="readonly">{customer?.voucher || 0} vouchers</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p4-modal-actions">
                                            {editMode ? (
                                                <>
                                                    <button className="p4-btn-secondary" onClick={() => {
                                                        setEditMode(false);
                                                        setAvatarPreview(customer?.imageUrl || null);
                                                        setAvatarFile(null);
                                                        if (customer) {
                                                            setFormData({
                                                                fullName: customer.fullName || '',
                                                                phoneNumber: customer.phoneNumber || '',
                                                                address: customer.address || '',
                                                                imageUrl: customer.imageUrl || '',
                                                            });
                                                        }
                                                    }}>Cancel</button>
                                                    <button className="p4-btn-main" onClick={handleSubmit}>Save</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="p4-btn-main" onClick={() => setEditMode(true)}>Edit</button>
                                                    <button className="p4-btn-danger" onClick={() => setShowDeleteConfirm(true)}>Delete Account</button>
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
                            <div className="p4-footer-title">Follow us on social media</div>
                            <div className="p4-social-icons">
                                <span className="p4-social facebook"></span>
                                <span className="p4-social instagram"></span>
                                <span className="p4-social youtube"></span>
                                <span className="p4-trusted-badge"></span>
                            </div>
                        </div>
                    </div>
                    <div className="p4-footer-bottom">
                        <span>Copyright © 2025 Dolce. All Rights Reserved</span>
                    </div>
                </footer>
            </div>
        </CartContext.Provider>
    );
};

export default CustomerLayout;
