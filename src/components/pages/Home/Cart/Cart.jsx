import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../../common/Layout/customer_layout';
import axios from 'axios';
import AddressSelection from '../Cart/AddressSelection/AddressSelection';
import { useNotification } from '../../../../contexts/NotificationContext';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, setCart, handleRemoveFromCart } = useContext(CartContext);
    const [paymentMethod, setPaymentMethod] = useState('PAYOS'); // PAYOS or CASH
    const { showSuccess, showError } = useNotification();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [otherItems, setOtherItems] = useState([]);
    const [selectedOtherItems, setSelectedOtherItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');
    const [voucher, setVoucher] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherError, setVoucherError] = useState('');
    const [needInvoice, setNeedInvoice] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [isTokenValid, setIsTokenValid] = useState(Boolean(localStorage.getItem('token')));
    const [redirectCount, setRedirectCount] = useState(10); 


    // Trạng thái modal
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showIncompleteInfoModal, setShowIncompleteInfoModal] = useState(false);
    const [showExistingOrderModal, setShowExistingOrderModal] = useState(false);
    const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
    const [existingOrderId, setExistingOrderId] = useState(null);
    const [showAddressSelection, setShowAddressSelection] = useState(false);
    const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);

    // phí vận chuyển
    const shippingFee = 0;

    useEffect(() => {
        if (orderPlaced) {
            const countdownTimer = setInterval(() => {
                setRedirectCount(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownTimer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            return () => clearInterval(countdownTimer);
        }
    }, [orderPlaced]);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                console.log("Token changed in storage:", e.oldValue, "->", e.newValue);
                const newTokenValue = e.newValue;

                if (!newTokenValue) {
                    console.log("Token removed, clearing customer data");
                    setCustomer(null);
                    setIsTokenValid(false);

                    if (window.location.pathname === '/cart') {
                        setShowLoginModal(true);
                    }
                } else {
                    setIsTokenValid(true);
                    fetchCustomerData(newTokenValue);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        // Lấy thông tin người dùng
        const token = localStorage.getItem('token');
        setIsTokenValid(Boolean(token));
        if (token) {
            fetchCustomerData(token);
        } else {

            setCustomer(null);
        }

        // Tải sản phẩm loại OTHER
        fetchOtherItems();
    }, []);


    useEffect(() => {
        const token = localStorage.getItem('token');
        const retryCount = parseInt(localStorage.getItem('customerDataRetryCount') || '0');


        if (token && !customer && retryCount < 3) {
            const timer = setTimeout(() => {
                console.log(`Retrying customer data fetch, attempt ${retryCount + 1}`);
                localStorage.setItem('customerDataRetryCount', (retryCount + 1).toString());
                fetchCustomerData(token);
            }, 1000);

            return () => clearTimeout(timer);
        }


        if (customer) {
            localStorage.removeItem('customerDataRetryCount');
        }
    }, [customer]);

    // Get customer details
    const fetchCustomerData = async (token) => {
        try {
            const response = await fetch('http://localhost:8080/api/customer/me/detail', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    setIsTokenValid(false);
                    setCustomer(null);
                    console.log("Token invalid and has been removed");
                }
                return;
            }
            const data = await response.json();
            setCustomer(data);
            setIsTokenValid(true);
            console.log("Successfully collected customer data:", data);
        } catch (error) {
            console.error('Failed to fetch customer data:', error);
        }
    };

    // Validate voucher
    const validateVoucher = async () => {
        if (!voucher.trim()) {
            setVoucherError('Please enter a voucher code');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const orderAmount = calculateSubtotal() + shippingFee;
            
            const response = await axios.post('http://localhost:8080/api/customer/vouchers/validate', {
                voucherCode: voucher,
                orderAmount: orderAmount
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.valid) {
                setAppliedVoucher(response.data.voucher);
                setVoucherDiscount(response.data.discount);
                setVoucherError('');
                showSuccess(`Voucher applied! You saved $${response.data.discount.toFixed(2)}`);
            } else {
                setVoucherError(response.data.message);
                setAppliedVoucher(null);
                setVoucherDiscount(0);
            }
        } catch (error) {
            setVoucherError('Failed to validate voucher: ' + (error.response?.data?.message || error.message));
            setAppliedVoucher(null);
            setVoucherDiscount(0);
        }
    };

    // Remove applied voucher
    const removeVoucher = () => {
        setVoucher('');
        setAppliedVoucher(null);
        setVoucherDiscount(0);
        setVoucherError('');
    };

    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');


        if (!token) {
            setIsTokenValid(false);
            setCustomer(null);
            return false;
        }


        if (customer !== null) {
            return true;
        }


        if (token && token.length > 0) {

            if (token.length > 20) {
                return true;
            }
        }


        return false;
    };

    // Load products of type OTHER and status AVAILABLE
    const fetchOtherItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/foods');
            const availableOtherItems = (response.data || [])
                .filter(food => food.type === 'OTHER' && food.status === 'AVAILABLE')
                .map(item => ({
                    ...item,
                    quantity: 1 // Initialize with quantity 1
                }));
            setOtherItems(availableOtherItems);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching OTHER items:', error);
            setLoading(false);
        }
    };

    // Update shopping cart item quantity
    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;

        const updatedCart = cart.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        );
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    // Update other item quantity
    const updateOtherItemQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;

        setOtherItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );

        // Update in selectedOtherItems if it's already selected
        setSelectedOtherItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Handle checkbox change for other items
    const handleOtherItemSelection = (item, isChecked) => {
        if (isChecked) {
            setSelectedOtherItems(prev => [...prev, item]);
        } else {
            setSelectedOtherItems(prev => prev.filter(selectedItem => selectedItem.id !== item.id));
        }
    };

    // Calculate the total price of goods in cart
    const calculateSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Calculate the total price of selected other items
    const calculateOtherItemsTotal = () => {
        return selectedOtherItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Calculate total (including shipping and other items)
    const calculateTotal = () => {
        const subtotal = calculateSubtotal() + calculateOtherItemsTotal() + shippingFee;
        return Math.max(0, subtotal - voucherDiscount);
    };


    const isCustomerInfoComplete = () => {

        if (!checkLoginStatus()) return false;

        return customer &&
            customer.address &&
            customer.address.trim() !== '' &&
            customer.phoneNumber &&
            customer.phoneNumber.trim() !== '';
    };


    const verifyToken = () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsTokenValid(false);
            setCustomer(null);
            return false;
        }


        fetch('http://localhost:8080/api/customer/me/detail', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        console.log("Token verification failed, clear local data");
                        localStorage.removeItem('token');
                        setIsTokenValid(false);
                        setCustomer(null);
                        setShowLoginModal(true);
                    }
                    return false;
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    setCustomer(data);
                    setIsTokenValid(true);
                    return true;
                }
                return false;
            })
            .catch(error => {
                console.error("An error occurred while verifying token:", error);
                return false;
            });
    };


    useEffect(() => {
        verifyToken();


        const handleLogoutClick = (e) => {

            if (e.target.matches('.p4-btn-main') && e.target.innerText === 'Logout') {
                console.log("The Logout button was detected to be clicked");
                setTimeout(() => {

                    if (!localStorage.getItem('token')) {
                        console.log("The user has logged out, clearing customer data");
                        setCustomer(null);
                        setIsTokenValid(false);


                        if (window.location.pathname === '/cart') {
                            setShowLoginModal(true);
                        }
                    }
                }, 100);
            }
        };


        document.addEventListener('click', handleLogoutClick);

        return () => {
            document.removeEventListener('click', handleLogoutClick);
        };
    }, []);


    useEffect(() => {
        verifyToken();


        const handleLogoutClick = (e) => {

            if (e.target.matches('.p4-btn-main') && e.target.innerText === 'Logout') {
                console.log("The Logout button was detected to be clicked");
                setTimeout(() => {

                    if (!localStorage.getItem('token')) {
                        console.log("The user has logged out, clearing customer data");
                        setCustomer(null);
                        setIsTokenValid(false);


                        if (window.location.pathname === '/cart') {
                            setShowLoginModal(true);
                        }
                    }
                }, 100);
            }
        };


        document.addEventListener('click', handleLogoutClick);


  

        return () => {
            document.removeEventListener('click', handleLogoutClick);
        };
    }, []);


    const renderShippingInfo = () => {

        const token = localStorage.getItem('token');
        const currentTokenValid = Boolean(token);

        if (currentTokenValid !== isTokenValid) {
            console.log("Token status is inconsistent, update status");
            setIsTokenValid(currentTokenValid);
            if (!currentTokenValid) {
                setCustomer(null);
            }
        }

        if (selectedDeliveryAddress) {
            return (
                <div className="customer-address-info">
                    <p><strong>Selected Delivery Address:</strong></p>
                    <p><strong>Recipient:</strong> {selectedDeliveryAddress.recipientName}</p>
                    <p><strong>Phone:</strong> {selectedDeliveryAddress.recipientPhone}</p>
                    <p><strong>Address:</strong> {selectedDeliveryAddress.deliveryAddress}</p>
                    {selectedDeliveryAddress.note && (
                        <p><strong>Note:</strong> {selectedDeliveryAddress.note}</p>
                    )}
                    <button 
                        className="change-address-btn" 
                        onClick={handleShowAddressSelection}
                    >
                        Change Address
                    </button>
                </div>
            );
        } else if (currentTokenValid && customer) {
            return (
                <div className="customer-address-info">
                    <p><strong>Select Delivery Address:</strong></p>
                    <p>Please choose a delivery address for your order</p>
                    <button 
                        className="select-address-btn" 
                        onClick={handleShowAddressSelection}
                    >
                        Select Address
                    </button>
                </div>
            );
        } else if (currentTokenValid) {
            return (
                <div className="customer-address-info">
                    <p>Loading your shipping information...</p>
                    <button onClick={verifyToken} className="reload-btn">
                        Reload Information
                    </button>
                </div>
            );
        } else {
            return (
                <div className="login-required">
                    <p>Please login to use your saved address</p>
                    <button className="login-btn" onClick={() => navigate('/login/customer')}>Login</button>
                </div>
            );
        }
    };


    const handlePlaceOrder = async () => {
        console.log("Start the payment process and complete verification");
    
        // Kiểm tra tổng giá trị đơn hàng tối thiểu
        const totalAmount = calculateTotal();
        if (totalAmount < 15) {
            showError(`Order total must be at least $15. Current total: $${totalAmount.toFixed(2)}`);
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setShowLoginModal(true);
                setCustomer(null);
                setIsTokenValid(false);
                return;
            }
    
            
            const response = await fetch('http://localhost:8080/api/customer/me/detail', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    setIsTokenValid(false);
                    setCustomer(null);
                    setShowLoginModal(true);
                    return;
                }
                throw new Error("An error occurred while verifying token");
            }
    
            const customerData = await response.json();
            setCustomer(customerData);
            setIsTokenValid(true);
    
            if (!selectedDeliveryAddress) {
                setShowIncompleteInfoModal(true);
                return;
            }

            // Hiển thị modal xác nhận thanh toán (giữ nguyên comment tiếng Việt)
            console.log("Showing confirmation modal");
            setShowConfirmPaymentModal(true);
        } catch (error) {
            console.error("Error during verification:", error);
            setShowLoginModal(true);
        }
    };

    const confirmPayment = async () => {
        console.log("Confirm payment clicked");
        setShowConfirmPaymentModal(false);
        
        // Kiểm tra lại tổng giá trị đơn hàng tối thiểu
        const totalAmount = calculateTotal();
        if (totalAmount < 15) {
            showError(`Order total must be at least $15. Current total: $${totalAmount.toFixed(2)}`);
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setShowLoginModal(true);
                return;
            }
    
            const orderData = {
                foods: [
                    ...cart.map(item => ({
                        id: Number(item.id),
                        quantity: item.quantity
                    })),
                    ...selectedOtherItems.map(item => ({
                        id: Number(item.id),
                        quantity: item.quantity
                    }))
                ],
                note: note || "",
                deliveryAddress: selectedDeliveryAddress,
                voucherCode: appliedVoucher ? appliedVoucher.code : null,
                voucherDiscount: voucherDiscount || 0,
                needInvoice: needInvoice,
                paymentMethod: paymentMethod
            };
    
            console.log("Submit order data:", orderData);
    
            try {
                const orderResponse = await axios.post('http://localhost:8080/api/orders/create', orderData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
    
                if (orderResponse.status === 201 || orderResponse.status === 200) {
                    setCart([]);
                    localStorage.removeItem('cart');
                    setOrderPlaced(true);
    
                    // Điều hướng theo phương thức thanh toán
                    if (paymentMethod === 'CASH') {
                        navigate(`/detail-delivery/${orderResponse.data.id}`);
                    } else {
                        navigate(`/payment-details/${orderResponse.data.id}`);
                    }
                } else {
                    throw new Error("Order creation failed");
                }
            } catch (error) {
                console.error("Failed to create an order:", error.response?.data || error.message);
                

                if (error.response && error.response.status === 400 && 
                    error.response.data && 
                    error.response.data.message && 
                    error.response.data.message.includes("already have an order waiting for confirmation")) {
                    
                    console.log("User already has a pending order");
                    

                    try {
                        const ordersResponse = await axios.get('http://localhost:8080/api/orders/myorder', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (ordersResponse.data && ordersResponse.data.length > 0) {
                            const waitingOrder = ordersResponse.data.find(order => 
                                order.status === 'WAITING_PAYMENT' || order.confirmStatus === 'WAITING_PAYMENT');
                            
                            if (waitingOrder) {
                                console.log("Found waiting order:", waitingOrder);
                                setExistingOrderId(waitingOrder.id);
                            }
                        }
                    } catch (ordersError) {
                        console.error("Error fetching orders:", ordersError);
                    }
                    
                    setShowExistingOrderModal(true);
                } else {
              
                    showError("Failed to create an order, please try again later");
                }
            }
    
        } catch (error) {
            console.error("An error occurred while processing the payment:", error);
                            showError("An error occurred, please refresh the page and try again");
        }
    };
    

    // Navigate to login page
    const goToLogin = () => {
        navigate('/login/customer');
    };

    // Navigate to address management page
    const goToPersonalInfo = () => {
        setShowIncompleteInfoModal(false);
        navigate('/addresses');
    };

    // Get list of missing fields
    const getMissingFields = () => {
        const missingFields = [];

        if (!selectedDeliveryAddress) {
            missingFields.push('deliveryAddress');
        }

        return missingFields;
    };

    // Handle image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://via.placeholder.com/60?text=No+Image';
        return imageUrl.startsWith('http')
            ? imageUrl
            : `http://localhost:8080${imageUrl}`;
    };

    // Check if an other item is selected
    const isOtherItemSelected = (id) => {
        return selectedOtherItems.some(item => item.id === id);
    };

    // Get the current quantity of an other item
    const getOtherItemQuantity = (id) => {
        const item = otherItems.find(item => item.id === id);
        return item ? item.quantity : 1;
    };

    // Address selection handlers
    const handleAddressSelect = (addressData) => {
        setSelectedDeliveryAddress(addressData);
        setShowAddressSelection(false);
    };

    const handleShowAddressSelection = () => {
        setShowAddressSelection(true);
    };

    return (
        <div className="cart-content-container">
            <div className="breadcrumb">
                <span onClick={() => navigate('/')}>Home</span>
                <span> • </span>
                <span>Cart</span>
            </div>
            <h1 className="cart-page-title">My Cart</h1>

            {orderPlaced ? (
                <div className="order-success">
                    <div className="success-animation">
                        <div className="success-circle">
                            <div className="success-draw"></div>
                        </div>
                        <div className="success-rays"></div>
                    </div>
                    <h2>Order Placed Successfully!</h2>
                    <p className="success-message">Your delicious order is now being processed.</p>
                    <div className="success-confetti">
                        <span className="confetti-item"></span>
                        <span className="confetti-item"></span>
                        <span className="confetti-item"></span>
                        <span className="confetti-item"></span>
                        <span className="confetti-item"></span>
                        <span className="confetti-item"></span>
                        <span className="confetti-item"></span>
                        <span className="confetti-item"></span>
                    </div>
                    <p className="redirect-message">
                        Order has been created, you will be redirected to payment page in <span className="countdown">{redirectCount}s</span>
                    </p>
                    <div className="order-decoration">
                        <span className="decoration-item">🍕</span>
                        <span className="decoration-item">🥂</span>
                        <span className="decoration-item">🍝</span>
                        <span className="decoration-item">🥗</span>
                        <span className="decoration-item">🧁</span>
                    </div>
                </div>
            ) : cart.length === 0 && selectedOtherItems.length === 0 ? (
                <div className="cart-empty">
                    <div className="empty-cart-animation">
                        <div className="empty-cart-icon">🛒</div>
                    </div>
                    <h2>Your cart is as empty as a pizza box after dinner!</h2>
                    <p className="empty-message">Looks like your cart is hungry for some delicious items.</p>
                    <p className="joke-message">Why did the pizza go to therapy? It had too many toppings to work through!</p>
                    <button className="continue-shopping" onClick={() => navigate('/')}>
                        <span className="btn-text">Fill Your Cart with Goodness</span>
                        <span className="btn-icon">→</span>
                    </button>
                </div>
            ) : (
                <div className="cart-layout-container">
                    <div className="cart-main-content">
                        {/* Left Column - Cart Items */}
                        <div className="cart-left-column">
                            <h2>Cart Items</h2>
                            {cart.length === 0 ? (
                                <div className="empty-section-message">No items in cart yet</div>
                            ) : (
                                <div className="cart-items-wrapper">
                                    {cart.map((item) => (
                                        <div className="cart-item" key={item.id}>
                                            <div className="cart-item-image">
                                                <img
                                                    src={getImageUrl(item.imageUrl)}
                                                    alt={item.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                            <div className="cart-item-content">
                                                <div className="cart-item-header">
                                                    <h3>{item.name}</h3>
                                                    <button
                                                        className="remove-item-btn"
                                                        onClick={() => handleRemoveFromCart(item.id)}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                                <div className="cart-item-price">{Number(item.price).toLocaleString()} $</div>
                                                <div className="cart-item-quantity">
                                                    <button
                                                        className="quantity-btn"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="quantity-value">{item.quantity}</span>
                                                    <button
                                                        className="quantity-btn"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Middle Column - Condiments & Accessories */}
                        <div className="cart-middle-column">
                            <h2>Tableware & Accessories</h2>
                            <div className="condiment-section">
                                {loading ? (
                                    <p className="loading-text">Loading...</p>
                                ) : (
                                    <div className="condiment-options">
                                        {otherItems.length > 0 ? (
                                            otherItems.map(item => (
                                                <div className="condiment-option" key={item.id}>
                                                    <div className="condiment-row">
                                                        <label className="checkbox-container">
                                                            <input
                                                                type="checkbox"
                                                                checked={isOtherItemSelected(item.id)}
                                                                onChange={(e) => handleOtherItemSelection(item, e.target.checked)}
                                                            />
                                                            <span className="checkmark"></span>
                                                            <span className="condiment-name">{item.name}</span>
                                                        </label>

                                                        {isOtherItemSelected(item.id) && (
                                                            <div className="condiment-quantity">
                                                                <button
                                                                    className="quantity-btn"
                                                                    onClick={() => updateOtherItemQuantity(item.id, getOtherItemQuantity(item.id) - 1)}
                                                                    disabled={getOtherItemQuantity(item.id) <= 1}
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="quantity-value">{getOtherItemQuantity(item.id)}</span>
                                                                <button
                                                                    className="quantity-btn"
                                                                    onClick={() => updateOtherItemQuantity(item.id, getOtherItemQuantity(item.id) + 1)}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className="condiment-price">
                                                            {Number(item.price).toLocaleString()} $
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No accessories available</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <h2>Order Note</h2>
                            <div className="order-note-section">
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="If you have any special requests, please specify here"
                                    rows="4"
                                ></textarea>
                            </div>

                            <h2>Voucher</h2>
                            <div className="voucher-section">
                                {!appliedVoucher ? (
                                    <div className="voucher-input-group">
                                        <input
                                            type="text"
                                            value={voucher}
                                            onChange={(e) => setVoucher(e.target.value)}
                                            placeholder="Enter voucher code"
                                        />
                                        <button className="apply-btn" onClick={validateVoucher}>Apply</button>
                                    </div>
                                ) : (
                                    <div className="applied-voucher">
                                        <div className="voucher-info">
                                            <span className="voucher-code">✅ {appliedVoucher.code}</span>
                                            <span className="voucher-discount">-${voucherDiscount.toFixed(2)}</span>
                                        </div>
                                        <button className="remove-voucher-btn" onClick={removeVoucher}>Remove</button>
                                    </div>
                                )}
                                {voucherError && <div className="voucher-error">{voucherError}</div>}
                                <div className="voucher-link">
                                    <a href="/vouchers" target="_blank" rel="noopener noreferrer">
                                        🎫 View My Vouchers
                                    </a>
                                </div>
                            </div>

                            <div className="invoice-section">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={needInvoice}
                                        onChange={(e) => setNeedInvoice(e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    Issue Invoice
                                </label>
                                {needInvoice && (
                                    <div className="invoice-notice">
                                        <i className="notice-icon">📧</i>
                                        <span>Electronic invoice will be sent to your email after successful payment</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="cart-right-column">
                            <div className="shipping-info-section">
                                <h2>Shipping Information</h2>
                                {renderShippingInfo()}
                            </div>

                            <div className="order-summary-section">
                                <h2>Order Summary</h2>
                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span className="price">{calculateSubtotal().toLocaleString()} $</span>
                                </div>
                                {selectedOtherItems.length > 0 && (
                                    <div className="summary-row">
                                        <span>Accessories:</span>
                                        <span className="price">{calculateOtherItemsTotal().toLocaleString()} $</span>
                                    </div>
                                )}
                                <div className="summary-row">
                                    <span>Shipping Fee:</span>
                                    <span className="price">Free Shipping</span>
                                </div>
                                {voucherDiscount > 0 && (
                                    <div className="summary-row voucher-discount">
                                        <span>Voucher Discount:</span>
                                        <span className="price discount">-{voucherDiscount.toLocaleString()} $</span>
                                    </div>
                                )}
                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span className="price">{calculateTotal().toLocaleString()} $</span>
                                </div>
                                <div className="summary-row">
                                    <span>Payment Method:</span>
                                    <span className="price">{paymentMethod === 'CASH' ? 'Cash on Delivery' : 'PayOS (QR/Redirect)'}</span>
                                </div>
                                
                                {/* Minimum order amount warning */}
                                {calculateTotal() < 15 && (
                                    <div className="minimum-order-warning">
                                        <div className="warning-icon">⚠️</div>
                                        <div className="warning-text">
                                            <strong>Minimum order amount:</strong> $15.00
                                            <br />
                                            <span className="warning-detail">
                                                Add ${(15 - calculateTotal()).toFixed(2)} more to your order
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="payment-method-section" style={{marginTop: '12px'}}>
                                    <div style={{fontWeight:'600', marginBottom: 6}}>Choose Payment Method</div>
                                    <label className="checkbox-container" style={{display:'flex', alignItems:'center', gap:8}}>
                                        <input type="radio" name="pm" checked={paymentMethod==='PAYOS'} onChange={() => setPaymentMethod('PAYOS')} />
                                        <span className="checkmark"></span>
                                        <span>PayOS (QR/Redirect)</span>
                                    </label>
                                    <label className="checkbox-container" style={{display:'flex', alignItems:'center', gap:8}}>
                                        <input type="radio" name="pm" checked={paymentMethod==='CASH'} onChange={() => setPaymentMethod('CASH')} />
                                        <span className="checkmark"></span>
                                        <span>Cash on Delivery</span>
                                    </label>
                                </div>

                                <button
                                    className={`checkout-btn ${calculateTotal() < 15 ? 'disabled' : ''}`}
                                    onClick={handlePlaceOrder}
                                    disabled={cart.length === 0 && selectedOtherItems.length === 0 || calculateTotal() < 15}
                                >
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Required Modal */}
            {showLoginModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Login Required</h3>
                            <button className="modal-close" onClick={() => setShowLoginModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <p>You need to login to complete the order</p>
                            <div className="modal-actions">
                                <button className="modal-btn secondary" onClick={() => setShowLoginModal(false)}>
                                    Back
                                </button>
                                <button className="modal-btn primary" onClick={goToLogin}>
                                    Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Incomplete Information Modal */}
            {showIncompleteInfoModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Missing Information</h3>
                            <button className="modal-close" onClick={() => setShowIncompleteInfoModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <p>Please update your shipping information completely before continuing.</p>
                            <div className="missing-fields">
                                <p className="missing-field">• Please select a delivery address for your order</p>
                                <p className="missing-field">• You can manage your addresses in your profile</p>
                            </div>
                            <div className="modal-actions">
                                <button className="modal-btn secondary" onClick={() => setShowIncompleteInfoModal(false)}>
                                    Back
                                </button>
                                <button className="modal-btn primary" onClick={goToPersonalInfo}>
                                    Manage Addresses
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Confirmation Modal */}
            {showConfirmPaymentModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Payment Confirmation</h3>
                            <button className="modal-close" onClick={() => setShowConfirmPaymentModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="warning-icon">
                                <i>⚠️</i>
                            </div>
                            <h4 className="warning-title">Are you sure you want to proceed with payment?</h4>
                            <p>The order will be created and you cannot undo it after confirmation.</p>
                            <div className="order-summary">
                                <p><strong>Total Amount:</strong> {calculateTotal().toLocaleString()} $</p>
                                <p><strong>Number of Items:</strong> {cart.length + selectedOtherItems.length}</p>
                            </div>
                            <div className="modal-actions">
                                <button className="modal-btn secondary" onClick={() => setShowConfirmPaymentModal(false)}>
                                    Cancel
                                </button>
                                <button className="modal-btn primary" onClick={confirmPayment}>
                                    Confirm Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Order Modal */}
            {showExistingOrderModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Existing Order Found</h3>
                            <button className="modal-close" onClick={() => setShowExistingOrderModal(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="warning-icon">
                                <i>⚠️</i>
                            </div>
                            <h4 className="warning-title">You already have a pending order</h4>
                            <p>You need to complete or cancel your existing order before creating a new one.</p>
                            <p className="order-info">Order: #{existingOrderId}</p>
                            <div className="modal-actions">
                                <button className="modal-btn secondary" onClick={() => setShowExistingOrderModal(false)}>
                                    Back to Cart
                                </button>
                                <button className="modal-btn primary" onClick={() => navigate(`/payment-details/${existingOrderId}`)}>
                                    View Pending Order
                                </button>
                                <button className="modal-btn danger" onClick={() => navigate('/order-history')}>
                                    Go to Order History
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Address Selection Modal */}
            {showAddressSelection && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <AddressSelection 
                            onAddressSelect={handleAddressSelect}
                            selectedAddress={selectedDeliveryAddress}
                            onClose={() => setShowAddressSelection(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
