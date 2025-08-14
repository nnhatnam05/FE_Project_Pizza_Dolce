import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Delivery.css";
import { FaCheck, FaTimes, FaTruck, FaMotorcycle, FaUtensils, FaSpinner, FaSearch, FaSync, FaUser, FaDollarSign, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { useNotification } from "../../../../contexts/NotificationContext";

const DELIVERY_STATUS = [
    { key: "PREPARING", label: "Preparing", color: "#ffa502", icon: <FaUtensils /> },
    { key: "WAITING_FOR_SHIPPER", label: "Waiting for Shipper", color: "#2980b9", icon: <FaTruck /> },
    { key: "DELIVERING", label: "Delivering", color: "#2196f3", icon: <FaMotorcycle /> },
    { key: "DELIVERED", label: "Delivered", color: "#4caf50", icon: <FaCheck /> },
    { key: "CANCELLED", label: "Cancelled", color: "#f44336", icon: <FaTimes /> }
];

export default function Delivery_Status() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError, showWarning } = useNotification();
    const [updating, setUpdating] = useState(false);
    const [deliveryNote, setDeliveryNote] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [refreshInterval, setRefreshInterval] = useState(60); // seconds
    const [currentUser, setCurrentUser] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchCurrentUser();
        fetchOrders();
        const interval = setInterval(() => {
            fetchOrders(false);
        }, refreshInterval * 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, [refreshInterval]);

    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(response.data);
        } catch (error) {
            console.error("Failed to fetch current user:", error);
        }
    };

    const fetchOrders = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Get all orders
            const response = await axios.get("http://localhost:8080/api/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Filter orders with delivery status in 3 delivery states
            const allOrders = response.data.filter(order => 
                order.deliveryStatus === "PREPARING" || 
                order.deliveryStatus === "WAITING_FOR_SHIPPER" || 
                order.deliveryStatus === "DELIVERING"
            ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setOrders(allOrders);

            if (selectedOrder && !allOrders.some(order => order.id === selectedOrder.id)) {
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            if (showLoading) {
                showError("Unable to load order list!");
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleSelectOrder = (order) => {
        setSelectedOrder(order);
        setDeliveryNote(order.deliveryNote || "");
        setCancelReason("");
    };

    const confirmAction = (action, order) => {
        setSelectedOrder(order);
        setActionToConfirm(action);
        setShowConfirmation(true);
        setDeliveryNote(order.deliveryNote || "");
        setCancelReason("");
    };

    const cancelAction = () => {
        setShowConfirmation(false);
        setActionToConfirm(null);
        setCancelReason("");
    };

    const handleUpdateDeliveryStatus = async () => {
        if (!selectedOrder || !actionToConfirm) return;
        
        // Check if staff is the creator/manager of this order
        if (selectedOrder.staff && currentUser && selectedOrder.staff.id !== currentUser.id) {
            const confirmMessage = `⚠️ WARNING: This order is managed by ${selectedOrder.staff.name} (${selectedOrder.staff.email}). Are you sure you want to update the status?`;
            if (!window.confirm(confirmMessage)) {
                setShowConfirmation(false);
                setActionToConfirm(null);
                return;
            }
        }
        
        setUpdating(true);
        try {
            const params = {
                status: actionToConfirm,
                note: deliveryNote
            };
            if (actionToConfirm === "CANCELLED") {
                if (!cancelReason.trim()) {
                    showWarning("Please enter a reason for cancelling the order!");
                    setUpdating(false);
                    return;
                }
                params.cancelReason = cancelReason;
            }
            
            await axios.put(
                `http://localhost:8080/api/orders/${selectedOrder.id}/delivery-status`,
                {},
                {
                    params,
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setShowConfirmation(false);
            setActionToConfirm(null);

            // Refresh order list after update
            await fetchOrders(false);

            showSuccess(`Order status updated to ${getStatusLabel(actionToConfirm)}!`);
        } catch (error) {
            console.error("Failed to update order status:", error);
            showError("Unable to update order status!");
        } finally {
            setUpdating(false);
        }
    };

    const getStatusLabel = (status) => {
        const statusObj = DELIVERY_STATUS.find((s) => s.key === status);
        return statusObj ? statusObj.label : status;
    };

    const getStatusColor = (status) => {
        const statusObj = DELIVERY_STATUS.find((s) => s.key === status);
        return statusObj ? statusObj.color : "#757575";
    };

    const getStatusIcon = (status) => {
        const statusObj = DELIVERY_STATUS.find((s) => s.key === status);
        return statusObj ? statusObj.icon : <FaSpinner />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRefreshIntervalChange = (seconds) => {
        setRefreshInterval(seconds);
    };

    const handleManualRefresh = () => {
        fetchOrders(true);
    };

    const renderActions = (order) => {
        switch (order.deliveryStatus) {
            case "PREPARING":
                return (
                    <button
                        className="staff-action-btn waiting"
                        title="Move to waiting for shipper status"
                        onClick={(e) => {
                            e.stopPropagation();
                            confirmAction("WAITING_FOR_SHIPPER", order);
                        }}
                    >
                        <FaTruck /> Wait for Shipper
                    </button>
                );
            case "WAITING_FOR_SHIPPER":
                return (
                    <button
                        className="staff-action-btn delivering"
                        title="Shipper has picked up, start delivery"
                        onClick={(e) => {
                            e.stopPropagation();
                            confirmAction("DELIVERING", order);
                        }}
                    >
                        <FaMotorcycle /> Delivering
                    </button>
                );
            case "DELIVERING":
                return (
                    <div className="staff-action-group">
                        <button
                            className="staff-action-btn success"
                            title="Confirm successful delivery"
                            onClick={(e) => {
                                e.stopPropagation();
                                confirmAction("DELIVERED", order);
                            }}
                        >
                            <FaCheck /> Delivered
                        </button>
                        <button
                            className="staff-action-btn cancel"
                            title="Cancel order"
                            onClick={(e) => {
                                e.stopPropagation();
                                confirmAction("CANCELLED", order);
                            }}
                        >
                            <FaTimes /> Cancel
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderConfirmationDialog = () => {
        if (!showConfirmation) return null;

        let actionText = "";
        switch (actionToConfirm) {
            case "PREPARING":
                actionText = "change to Preparing";
                break;
            case "WAITING_FOR_SHIPPER":
                actionText = "change to Waiting for Shipper";
                break;
            case "DELIVERING":
                actionText = "change to Delivering";
                break;
            case "DELIVERED":
                actionText = "confirm as Delivered";
                break;
            case "CANCELLED":
                actionText = "cancel the order";
                break;
            default:
                actionText = actionToConfirm;
        }

        return (
            <div className="staff-confirmation-overlay" onClick={cancelAction}>
                <div className="staff-confirmation-dialog" onClick={(e) => e.stopPropagation()}>
                    <div className="staff-confirmation-header">
                        {actionToConfirm === "CANCELLED" ? "Confirm Order Cancellation" : "Confirm Status Update"}
                    </div>
                    <div className="staff-confirmation-content">
                        <p>Are you sure you want to {actionText} for order <strong>#{selectedOrder?.orderNumber}</strong>?</p>

                        {actionToConfirm === "CANCELLED" ? (
                            <div className="staff-form-group">
                                <label htmlFor="cancelReason">Cancellation Reason:</label>
                                <textarea
                                    id="cancelReason"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Enter reason for cancelling the order..."
                                    rows="3"
                                    className={!cancelReason.trim() ? "required-field" : ""}
                                />
                                {!cancelReason.trim() && (
                                    <small className="staff-text-error">Please enter a reason for cancelling the order</small>
                                )}
                            </div>
                        ) : (
                            <div className="staff-form-group">
                                <label htmlFor="deliveryNote">Delivery Note:</label>
                                <textarea
                                    id="deliveryNote"
                                    value={deliveryNote}
                                    onChange={(e) => setDeliveryNote(e.target.value)}
                                    placeholder="Delivery note (if any)..."
                                    rows="3"
                                />
                            </div>
                        )}
                    </div>
                    <div className="staff-confirmation-actions">
                        <button className="staff-btn-cancel" onClick={cancelAction} disabled={updating}>
                            Cancel
                        </button>
                        <button
                            className="staff-btn-confirm"
                            style={{ backgroundColor: actionToConfirm === "CANCELLED" ? "#f44336" : "#4caf50" }}
                            onClick={handleUpdateDeliveryStatus}
                            disabled={
                                updating ||
                                (actionToConfirm === "CANCELLED" && !cancelReason.trim())
                            }
                        >
                            {updating ? (
                                <><div className="staff-spinner-small"></div> Processing...</>
                            ) : (
                                <>
                                    {actionToConfirm === "CANCELLED" ? <FaTimes /> : <FaCheck />}
                                    {" Confirm"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Filter orders by status and search term
    const ALLOWED_STATUS = ["PREPARING", "WAITING_FOR_SHIPPER", "DELIVERING"];

    const filteredOrders = orders.filter(order => {
        // Filter by delivery status
        let statusMatch = false;
        if (filter === "all") {
            // Show all orders with delivery status in 3 delivery states
            statusMatch = ALLOWED_STATUS.includes(order.deliveryStatus);
        } else {
            // Filter by specific status
            statusMatch = order.deliveryStatus === filter;
        }
        
        if (!statusMatch) return false;

        // Filter by search term (if any)
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = (
                order.orderNumber?.toLowerCase().includes(searchLower) ||
                order.customer?.fullName?.toLowerCase().includes(searchLower) ||
                order.customer?.email?.toLowerCase().includes(searchLower)
            );
            return searchMatch;
        }

        return true;
    });

    const getOrderStats = () => {
        const preparing = orders.filter(o => o.deliveryStatus === 'PREPARING').length;
        const waiting = orders.filter(o => o.deliveryStatus === 'WAITING_FOR_SHIPPER').length;
        const delivering = orders.filter(o => o.deliveryStatus === 'DELIVERING').length;
        
        return { preparing, waiting, delivering };
    };

    const stats = getOrderStats();

    return (
        <div className="staff-delivery-container">
            {/* Header */}
            <div className="staff-delivery-header">
                <div className="staff-header-content">
                    <h1 className="staff-page-title">
                        <FaTruck className="staff-title-icon" />
                        Delivery Status Management
                    </h1>
                    <p className="staff-subtitle">Update delivery status for customers</p>
                </div>
                <div className="staff-header-actions">
                    <button 
                        className="staff-refresh-btn"
                        onClick={handleManualRefresh}
                        disabled={loading}
                    >
                        <FaSync className={loading ? 'spinning' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="staff-stats-overview">
                <div className="staff-stat-card preparing">
                    <div className="staff-stat-icon">
                        <FaUtensils />
                    </div>
                    <div className="staff-stat-content">
                        <div className="staff-stat-number">{stats.preparing}</div>
                        <div className="staff-stat-label">Preparing</div>
                    </div>
                </div>
                <div className="staff-stat-card waiting">
                    <div className="staff-stat-icon">
                        <FaTruck />
                    </div>
                    <div className="staff-stat-content">
                        <div className="staff-stat-number">{stats.waiting}</div>
                        <div className="staff-stat-label">Waiting for Shipper</div>
                    </div>
                </div>
                <div className="staff-stat-card delivering">
                    <div className="staff-stat-icon">
                        <FaMotorcycle />
                    </div>
                    <div className="staff-stat-content">
                        <div className="staff-stat-number">{stats.delivering}</div>
                        <div className="staff-stat-label">Delivering</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="staff-filters">
                <div className="staff-filter-group">
                    <div className="staff-search-wrapper">
                        <FaSearch className="staff-search-icon" />
                        <input
                            type="text"
                            placeholder="Search by order number, customer..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="staff-search-input"
                        />
                    </div>
                </div>

                <div className="staff-filter-group">
                    <label className="staff-filter-label">Auto Refresh:</label>
                    <select
                        value={refreshInterval}
                        onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                        className="staff-filter-select"
                    >
                        <option value="30">30 seconds</option>
                        <option value="60">1 minute</option>
                        <option value="300">5 minutes</option>
                        <option value="0">Off</option>
                    </select>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="staff-status-tabs">
                <button
                    className={`staff-status-tab ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                >
                    All ({orders.length})
                </button>
                <button
                    className={`staff-status-tab preparing ${filter === "PREPARING" ? "active" : ""}`}
                    onClick={() => setFilter("PREPARING")}
                >
                    <FaUtensils /> Preparing ({stats.preparing})
                </button>
                <button
                    className={`staff-status-tab waiting ${filter === "WAITING_FOR_SHIPPER" ? "active" : ""}`}
                    onClick={() => setFilter("WAITING_FOR_SHIPPER")}
                >
                    <FaTruck /> Waiting for Shipper ({stats.waiting})
                </button>
                <button
                    className={`staff-status-tab delivering ${filter === "DELIVERING" ? "active" : ""}`}
                    onClick={() => setFilter("DELIVERING")}
                >
                    <FaMotorcycle /> Delivering ({stats.delivering})
                </button>
            </div>

            {/* Content */}
            <div className="staff-content">
                <div className="staff-content-layout">
                    {/* Orders List */}
                    <div className="staff-orders-section">
                        {loading ? (
                            <div className="staff-loading-state">
                                <div className="staff-spinner"></div>
                                <div>Loading data...</div>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="staff-empty-state">
                                <FaTruck className="staff-empty-icon" />
                                <h3>No orders found</h3>
                                <p>{searchTerm ? "No orders match your search" : "No orders need processing"}</p>
                            </div>
                        ) : (
                            <div className="staff-orders-grid">
                                {filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className={`staff-order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectOrder(order)}
                                    >
                                        <div className="staff-order-header">
                                            <div className="staff-order-number">#{order.orderNumber}</div>
                                            <span 
                                                className="staff-status-badge"
                                                style={{ backgroundColor: getStatusColor(order.deliveryStatus) }}
                                            >
                                                {getStatusIcon(order.deliveryStatus)} {getStatusLabel(order.deliveryStatus)}
                                            </span>
                                        </div>

                                        <div className="staff-order-body">
                                            <div className="staff-order-info-row">
                                                <FaUser className="staff-info-icon" />
                                                <span>{order.customer?.fullName || 'No name'}</span>
                                            </div>
                                            
                                            <div className="staff-order-info-row">
                                                <FaMapMarkerAlt className="staff-info-icon" />
                                                <span className="staff-address">{order.deliveryAddress || 'No address'}</span>
                                            </div>

                                            {order.staff && currentUser && order.staff.id !== currentUser.id && (
                                                <div className="staff-order-info-row staff-warning-row">
                                                    <FaUser className="staff-info-icon" />
                                                    <span>Managed by: {order.staff.name}</span>
                                                    <span className="staff-warning-badge">⚠️</span>
                                                </div>
                                            )}

                                            <div className="staff-order-info-row">
                                                <FaDollarSign className="staff-info-icon" />
                                                <span className="staff-price">${Number(order.totalPrice).toFixed(2)}</span>
                                            </div>

                                            <div className="staff-order-info-row">
                                                <FaClock className="staff-info-icon" />
                                                <span className="staff-date">{formatDate(order.createdAt)}</span>
                                            </div>

                                            <div className="staff-order-actions">
                                                {renderActions(order)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Order Details */}
                    <div className="staff-details-section">
                        {selectedOrder ? (
                            <div className="staff-order-details">
                                <div className="staff-details-header">
                                    <h3>Order Details #{selectedOrder.orderNumber}</h3>
                                    <span 
                                        className="staff-status-badge"
                                        style={{ backgroundColor: getStatusColor(selectedOrder.deliveryStatus) }}
                                    >
                                        {getStatusIcon(selectedOrder.deliveryStatus)} {getStatusLabel(selectedOrder.deliveryStatus)}
                                    </span>
                                </div>
                                
                                <div className="staff-details-content">
                                    <div className="staff-detail-section">
                                        <h4>Customer Information</h4>
                                        <div className="staff-detail-grid">
                                            <div className="staff-detail-item">
                                                <label>Full Name:</label>
                                                <span>{selectedOrder.customer?.fullName || "No name"}</span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Email:</label>
                                                <span>{selectedOrder.customer?.email || "No email"}</span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Phone:</label>
                                                <span>{selectedOrder.customer?.phoneNumber || "No phone number"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="staff-detail-section">
                                        <h4>Delivery Information</h4>
                                        <div className="staff-detail-grid">
                                            <div className="staff-detail-item">
                                                <label>Recipient:</label>
                                                <span>{selectedOrder.recipientName || "No recipient name"}</span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Delivery Phone:</label>
                                                <span>{selectedOrder.recipientPhone || "No phone"}</span>
                                            </div>
                                            <div className="staff-detail-item full-width">
                                                <label>Delivery Address:</label>
                                                <span>{selectedOrder.deliveryAddress || "No delivery address"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="staff-detail-section">
                                        <h4>Order Information</h4>
                                        <div className="staff-detail-grid">
                                            <div className="staff-detail-item">
                                                <label>Total Amount:</label>
                                                <span className="staff-price">${Number(selectedOrder.totalPrice).toFixed(2)}</span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Payment Method:</label>
                                                <span>{selectedOrder.paymentMethod?.name || "No payment method selected"}</span>
                                            </div>
                                            <div className="staff-detail-item">
                                                <label>Order Time:</label>
                                                <span>{formatDate(selectedOrder.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedOrder.staff && (
                                        <div className="staff-detail-section">
                                            <h4>Managing Staff</h4>
                                            <div className="staff-detail-grid">
                                                <div className="staff-detail-item">
                                                    <label>Name:</label>
                                                    <span>{selectedOrder.staff.name}</span>
                                                </div>
                                                <div className="staff-detail-item">
                                                    <label>Email:</label>
                                                    <span>{selectedOrder.staff.email}</span>
                                                </div>
                                                {currentUser && selectedOrder.staff.id !== currentUser.id && (
                                                    <div className="staff-detail-item full-width">
                                                        <div className="staff-warning-message">
                                                            ⚠️ This is not your order. Please be careful when updating the status.
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="staff-detail-section">
                                        <h4>Items</h4>
                                        <div className="staff-items-list">
                                            {selectedOrder.foodList?.map((food, idx) => (
                                                <div key={idx} className="staff-item-row">
                                                    <span className="staff-item-name">{food.name}</span>
                                                    <span className="staff-item-quantity">×{food.quantity}</span>
                                                    <span className="staff-item-price">${(food.price * food.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedOrder.deliveryNote && (
                                        <div className="staff-detail-section">
                                            <h4>Delivery Note</h4>
                                            <p className="staff-delivery-note">{selectedOrder.deliveryNote}</p>
                                        </div>
                                    )}

                                    <div className="staff-detail-section">
                                        <h4>Update Status</h4>
                                        <div className="staff-action-buttons">
                                            {renderActions(selectedOrder)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="staff-no-selection">
                                <FaTruck className="staff-no-selection-icon" />
                                <h3>Select an Order</h3>
                                <p>Select an order from the list to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {renderConfirmationDialog()}
        </div>
    );
}
