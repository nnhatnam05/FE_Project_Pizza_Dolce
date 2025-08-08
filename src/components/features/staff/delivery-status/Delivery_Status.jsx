import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Delivery.css";
import { FaCheck, FaTimes, FaTruck, FaMotorcycle, FaUtensils, FaSpinner, FaSearch, FaSync } from "react-icons/fa";
import { useNotification } from "../../../../contexts/NotificationContext";

const DELIVERY_STATUS = [
    { key: "PREPARING", label: "Đang chuẩn bị", color: "#ffa502", icon: <FaUtensils /> },
    { key: "WAITING_FOR_SHIPPER", label: "Chờ shipper", color: "#2980b9", icon: <FaTruck /> },
    { key: "DELIVERING", label: "Đang giao hàng", color: "#2196f3", icon: <FaMotorcycle /> },
    { key: "DELIVERED", label: "Đã giao hàng", color: "#4caf50", icon: <FaCheck /> },
    { key: "CANCELLED", label: "Đã hủy", color: "#f44336", icon: <FaTimes /> }
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
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => {
            fetchOrders(false);
        }, refreshInterval * 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, [refreshInterval]);

    const fetchOrders = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Lấy tất cả đơn hàng
            const response = await axios.get("http://localhost:8080/api/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Lọc các đơn hàng có deliveryStatus thuộc 3 trạng thái giao hàng
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
                showError("Không thể tải danh sách đơn hàng!");
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
        setUpdating(true);
        try {
            const params = {
                status: actionToConfirm,
                note: deliveryNote
            };
            if (actionToConfirm === "CANCELLED") {
                if (!cancelReason.trim()) {
                    showWarning("Vui lòng nhập lý do hủy đơn hàng!");
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

            // Refresh danh sách đơn hàng sau khi cập nhật
            await fetchOrders(false);

            showSuccess(`Đã cập nhật trạng thái đơn hàng thành ${getStatusLabel(actionToConfirm)}!`);
        } catch (error) {
            console.error("Failed to update order status:", error);
            showError("Không thể cập nhật trạng thái đơn hàng!");
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
        return date.toLocaleString("vi-VN", {
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
                        className="action-btn"
                        title="Chuyển sang trạng thái chờ shipper"
                        onClick={(e) => {
                            e.stopPropagation();
                            confirmAction("WAITING_FOR_SHIPPER", order);
                        }}
                    >
                        <FaTruck /> Chờ shipper
                    </button>
                );
            case "WAITING_FOR_SHIPPER":
                return (
                    <button
                        className="action-btn"
                        title="Shipper đã lấy hàng, bắt đầu giao"
                        onClick={(e) => {
                            e.stopPropagation();
                            confirmAction("DELIVERING", order);
                        }}
                    >
                        <FaMotorcycle /> Đang giao
                    </button>
                );
            case "DELIVERING":
                return (
                    <>
                        <button
                            className="action-btn success-btn"
                            title="Xác nhận đã giao hàng thành công"
                            onClick={(e) => {
                                e.stopPropagation();
                                confirmAction("DELIVERED", order);
                            }}
                        >
                            <FaCheck /> Đã giao
                        </button>
                        <button
                            className="action-btn cancel-btn"
                            title="Hủy đơn hàng"
                            onClick={(e) => {
                                e.stopPropagation();
                                confirmAction("CANCELLED", order);
                            }}
                        >
                            <FaTimes /> Hủy đơn
                        </button>
                    </>
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
                actionText = "chuyển sang Đang chuẩn bị";
                break;
            case "WAITING_FOR_SHIPPER":
                actionText = "chuyển sang Chờ shipper";
                break;
            case "DELIVERING":
                actionText = "chuyển sang Đang giao hàng";
                break;
            case "DELIVERED":
                actionText = "xác nhận Đã giao hàng";
                break;
            case "CANCELLED":
                actionText = "hủy đơn hàng";
                break;
            default:
                actionText = actionToConfirm;
        }

        return (
            <div className="confirmation-dialog-overlay" onClick={cancelAction}>
                <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
                    <div className="confirmation-dialog-title">
                        {actionToConfirm === "CANCELLED" ? "Xác nhận hủy đơn hàng" : "Xác nhận cập nhật trạng thái"}
                    </div>
                    <div className="confirmation-dialog-content">
                        <p>Bạn có chắc chắn muốn {actionText} cho đơn hàng <strong>#{selectedOrder?.orderNumber}</strong>?</p>

                        {actionToConfirm === "CANCELLED" ? (
                            <div className="form-group mt-15">
                                <label htmlFor="cancelReason">Lý do hủy đơn:</label>
                                <textarea
                                    id="cancelReason"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Nhập lý do hủy đơn hàng..."
                                    rows="3"
                                    className={!cancelReason.trim() ? "required-field" : ""}
                                />
                                {!cancelReason.trim() && (
                                    <small className="text-error">Vui lòng nhập lý do hủy đơn hàng</small>
                                )}
                            </div>
                        ) : (
                            <div className="form-group mt-15">
                                <label htmlFor="deliveryNote">Ghi chú giao hàng:</label>
                                <textarea
                                    id="deliveryNote"
                                    value={deliveryNote}
                                    onChange={(e) => setDeliveryNote(e.target.value)}
                                    placeholder="Ghi chú giao hàng (nếu có)..."
                                    rows="3"
                                />
                            </div>
                        )}
                    </div>
                    <div className="confirmation-dialog-actions">
                        <button className="btn-cancel" onClick={cancelAction} disabled={updating}>
                            Hủy bỏ
                        </button>
                        <button
                            className="btn-confirm"
                            style={{ backgroundColor: actionToConfirm === "CANCELLED" ? "#f44336" : "#4caf50" }}
                            onClick={handleUpdateDeliveryStatus}
                            disabled={
                                updating ||
                                (actionToConfirm === "CANCELLED" && !cancelReason.trim())
                            }
                        >
                            {updating ? (
                                <><div className="spinner-small"></div> Đang xử lý...</>
                            ) : (
                                <>
                                    {actionToConfirm === "CANCELLED" ? <FaTimes /> : <FaCheck />}
                                    {" Xác nhận"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Lọc đơn hàng theo trạng thái và từ khóa tìm kiếm
    const ALLOWED_STATUS = ["PREPARING", "WAITING_FOR_SHIPPER", "DELIVERING"];

    const filteredOrders = orders.filter(order => {
        // Lọc theo trạng thái giao hàng
        let statusMatch = false;
        if (filter === "all") {
            // Hiển thị tất cả đơn hàng có deliveryStatus thuộc 3 trạng thái giao hàng
            statusMatch = ALLOWED_STATUS.includes(order.deliveryStatus);
        } else {
            // Lọc theo trạng thái cụ thể
            statusMatch = order.deliveryStatus === filter;
        }
        
        if (!statusMatch) return false;

        // Lọc theo từ khóa tìm kiếm (nếu có)
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



    return (
        <div className="delivery-container">
            <div className="delivery-header">
                <h2>Quản lý trạng thái giao hàng</h2>
                <p style={{color: '#666', margin: '5px 0 0 0', fontSize: '14px'}}>
                    Cập nhật trạng thái giao hàng cho khách hàng
                </p>

                <div className="delivery-controls">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã đơn, khách hàng..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>

                    <div className="refresh-controls">
                        <button className="refresh-btn" onClick={handleManualRefresh} title="Làm mới dữ liệu">
                            <FaSync className={loading ? "spinning" : ""} /> Làm mới
                        </button>

                        <div className="refresh-interval">
                            <span>Tự động làm mới:</span>
                            <select
                                value={refreshInterval}
                                onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                            >
                                <option value="30">30 giây</option>
                                <option value="60">1 phút</option>
                                <option value="300">5 phút</option>
                                <option value="0">Tắt</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="delivery-filters">
                    <button
                        className={`filter-btn ${filter === "all" ? "active" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        Tất cả ({orders.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === "PREPARING" ? "active" : ""}`}
                        onClick={() => setFilter("PREPARING")}
                    >
                        Đang chuẩn bị ({orders.filter(o => o.deliveryStatus === "PREPARING").length})
                    </button>
                    <button
                        className={`filter-btn ${filter === "WAITING_FOR_SHIPPER" ? "active" : ""}`}
                        onClick={() => setFilter("WAITING_FOR_SHIPPER")}
                    >
                        Chờ shipper ({orders.filter(o => o.deliveryStatus === "WAITING_FOR_SHIPPER").length})
                    </button>
                    <button
                        className={`filter-btn ${filter === "DELIVERING" ? "active" : ""}`}
                        onClick={() => setFilter("DELIVERING")}
                    >
                        Đang giao ({orders.filter(o => o.deliveryStatus === "DELIVERING").length})
                    </button>
                </div>
            </div>

            <div className="delivery-content">
                <div className="orders-list">
                    <div className="table-container">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <div>Đang tải dữ liệu...</div>
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🚚</div>
                                <div className="empty-state-text">
                                    {searchTerm ? "Không tìm thấy đơn hàng nào phù hợp" : "Không có đơn hàng nào"}
                                </div>
                            </div>
                        ) : (
                            <table className="delivery-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Sản phẩm</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Thời gian</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order, idx) => (
                                        <tr
                                            key={order.id}
                                            className={selectedOrder && selectedOrder.id === order.id ? "selected-row" : ""}
                                            onClick={() => handleSelectOrder(order)}
                                        >
                                            <td>{idx + 1}</td>
                                            <td>#{order.orderNumber}</td>
                                            <td>
                                                <div className="customer-info">
                                                    <div className="customer-name">{order.customer?.fullName || 'Không có tên'}</div>
                                                    <div className="customer-email">{order.customer?.email || 'Không có email'}</div>
                                                    {order.customer?.phoneNumber && (
                                                        <div className="customer-phone">{order.customer.phoneNumber}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <ul className="food-list">
                                                    {order.foodList?.map(food => (
                                                        <li key={food.id}>
                                                            {food.name} <b>x{food.quantity}</b>
                                                            <span className="food-price"> ({Number(food.price).toLocaleString()} $)</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="price-column">${Number(order.totalPrice).toFixed(2)}</td>
                                            <td>
                                                <span
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(order.deliveryStatus) }}
                                                >
                                                    {getStatusIcon(order.deliveryStatus)} {getStatusLabel(order.deliveryStatus)}
                                                </span>
                                            </td>
                                            <td className="date-column">{formatDate(order.createdAt)}</td>
                                            <td className="actions-column">
                                                {renderActions(order)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {selectedOrder && (
                    <div className="order-detail">
                        <div className="order-detail-header">
                            <h3>Chi tiết đơn hàng #{selectedOrder.orderNumber}</h3>
                        </div>
                        <div className="order-detail-content">
                            <div className="customer-info">
                                <h4>Thông tin khách hàng</h4>
                                <div className="info-row"><span>Họ tên:</span> {selectedOrder.customer?.fullName || "Không có tên"}</div>
                                <div className="info-row"><span>Email:</span> {selectedOrder.customer?.email || "Không có email"}</div>
                                <div className="info-row"><span>Điện thoại:</span> {selectedOrder.customer?.phoneNumber || "Không có số điện thoại"}</div>
                                
                                <h4 style={{marginTop: '15px', marginBottom: '10px', color: '#333'}}>Thông tin giao hàng</h4>
                                <div className="info-row"><span>Người nhận:</span> {selectedOrder.recipientName || "Không có tên người nhận"}</div>
                                <div className="info-row"><span>SĐT giao hàng:</span> {selectedOrder.recipientPhone || "Không có SĐT"}</div>
                                <div className="info-row"><span>Địa chỉ giao hàng:</span> {selectedOrder.deliveryAddress || "Không có địa chỉ giao hàng"}</div>
                            </div>
                            <div className="order-info">
                                <h4>Thông tin đơn hàng</h4>
                                <div className="info-row"><span>Mã đơn:</span> #{selectedOrder.orderNumber}</div>
                                <div className="info-row"><span>Tổng tiền:</span> ${Number(selectedOrder.totalPrice).toFixed(2)}</div>
                                {selectedOrder.voucherCode && (
                                    <div className="info-row voucher-info">
                                        <span>Voucher:</span> 
                                        <span className="voucher-code">{selectedOrder.voucherCode}</span>
                                        {selectedOrder.voucherDiscount > 0 && (
                                            <span className="voucher-discount">(-${selectedOrder.voucherDiscount})</span>
                                        )}
                                    </div>
                                )}
                                <div className="info-row"><span>Thanh toán:</span> {selectedOrder.paymentMethod?.name || "Chưa chọn phương thức"}</div>
                                <div className="info-row">
                                    <span>Trạng thái giao hàng:</span>
                                    <span
                                        className="status-badge-small"
                                        style={{ backgroundColor: getStatusColor(selectedOrder.deliveryStatus) }}
                                    >
                                        {getStatusIcon(selectedOrder.deliveryStatus)} {getStatusLabel(selectedOrder.deliveryStatus)}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span>Trạng thái thanh toán:</span>
                                    <span
                                        className="status-badge-small"
                                        style={{ backgroundColor: selectedOrder.status === 'PAID' ? '#4caf50' : '#ff9800' }}
                                    >
                                        {selectedOrder.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                    </span>
                                </div>
                                <div className="info-row"><span>Thời gian:</span> {formatDate(selectedOrder.createdAt)}</div>
                                {selectedOrder.deliveryNote && (
                                    <div className="delivery-note">
                                        <h4>Ghi chú giao hàng</h4>
                                        <p>{selectedOrder.deliveryNote}</p>
                                    </div>
                                )}
                            </div>

                            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                                <div className="order-history">
                                    <h4>Lịch sử trạng thái</h4>
                                    <div className="history-timeline">
                                        {selectedOrder.statusHistory.map((history, idx) => (
                                            <div key={idx} className="history-item">
                                                <div className="history-time">{formatDate(history.changedAt)}</div>
                                                <div className="history-status">{history.status}</div>
                                                {history.note && <div className="history-note">{history.note}</div>}
                                                <div className="history-by">Bởi: {history.changedBy}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="order-actions">
                                <h4>Cập nhật trạng thái</h4>
                                <div className="action-buttons">
                                    {renderActions(selectedOrder)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {renderConfirmationDialog()}
        </div>
    );
}
