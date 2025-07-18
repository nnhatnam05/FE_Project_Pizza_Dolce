import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Delivery.css";
import { FaCheck, FaTimes, FaTruck, FaMotorcycle, FaUtensils, FaSpinner, FaSearch, FaSync } from "react-icons/fa";

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
            // Lấy các đơn theo deliveryStatus (KHÔNG phải status!)
            const responses = await Promise.all([
                axios.get("http://localhost:8080/api/orders/filter?deliveryStatus=PREPARING", {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get("http://localhost:8080/api/orders/filter?deliveryStatus=WAITING_FOR_SHIPPER", {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get("http://localhost:8080/api/orders/filter?deliveryStatus=DELIVERING", {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            const allOrdersRaw = [
                ...responses[0].data,
                ...responses[1].data,
                ...responses[2].data
            ];

            // Loại bỏ đơn trùng theo id (chỉ lấy đơn đầu tiên xuất hiện)
            const seenIds = new Set();
            const allOrders = allOrdersRaw.filter(order => {
                if (seenIds.has(order.id)) return false;
                seenIds.add(order.id);
                return true;
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setOrders(allOrders);


            if (selectedOrder && !allOrders.some(order => order.id === selectedOrder.id)) {
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            if (showLoading) {
                alert("Không thể tải danh sách đơn hàng!");
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
                    alert("Vui lòng nhập lý do hủy đơn hàng!");
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

            if (actionToConfirm === "DELIVERED" || actionToConfirm === "CANCELLED") {
                setOrders(orders.filter(order => order.id !== selectedOrder.id));
                setSelectedOrder(null);
            } else {
                setOrders(orders.map(order =>
                    order.id === selectedOrder.id
                        ? { ...order, status: actionToConfirm, deliveryStatus: actionToConfirm, deliveryNote }
                        : order
                ));
                setSelectedOrder({
                    ...selectedOrder,
                    status: actionToConfirm,
                    deliveryStatus: actionToConfirm,
                    deliveryNote
                });
            }

            alert(`Đã cập nhật trạng thái đơn hàng thành ${getStatusLabel(actionToConfirm)}!`);
        } catch (error) {
            console.error("Failed to update order status:", error);
            alert("Không thể cập nhật trạng thái đơn hàng!");
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
                        title="Chờ shipper đến lấy hàng"
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
        // Chỉ show các đơn có deliveryStatus thuộc 3 trạng thái đang giao hàng
        if (filter === "all") {
            if (!ALLOWED_STATUS.includes(order.deliveryStatus)) return false;
        } else {
            if (order.deliveryStatus !== filter) return false;
        }

        // Lọc theo từ khóa tìm kiếm (nếu có)
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            return (
                order.orderNumber.toLowerCase().includes(searchLower) ||
                order.customer?.fullName?.toLowerCase().includes(searchLower) ||
                order.customer?.email?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });



    return (
        <div className="delivery-container">
            <div className="delivery-header">
                <h2>Quản lý giao hàng</h2>

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
                        Tất cả 
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
                                            {order.customer?.fullName}
                                            <br />
                                            <span className="customer-email">{order.customer?.email}</span>
                                        </td>
                                        <td>
                                            <ul className="food-list">
                                                {order.foodList?.map((food) => (
                                                    <li key={food.id}>
                                                        {food.name} <span className="food-price">${food.price}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="price-column">${order.totalPrice}</td>
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

                {selectedOrder && (
                    <div className="order-detail">
                        <div className="order-detail-header">
                            <h3>Chi tiết đơn hàng #{selectedOrder.orderNumber}</h3>
                        </div>
                        <div className="order-detail-content">
                            <div className="customer-info">
                                <h4>Thông tin khách hàng</h4>
                                <div className="info-row"><span>Họ tên:</span> {selectedOrder.customer?.fullName}</div>
                                <div className="info-row"><span>Email:</span> {selectedOrder.customer?.email}</div>
                                <div className="info-row"><span>Điện thoại:</span> {selectedOrder.customer?.phoneNumber || "-"}</div>
                                <div className="info-row"><span>Địa chỉ:</span> {selectedOrder.customer?.address || "-"}</div>
                            </div>
                            <div className="order-info">
                                <h4>Thông tin đơn hàng</h4>
                                <div className="info-row"><span>Mã đơn:</span> #{selectedOrder.orderNumber}</div>
                                <div className="info-row"><span>Tổng tiền:</span> ${selectedOrder.totalPrice}</div>
                                <div className="info-row"><span>Thanh toán:</span> {selectedOrder.paymentMethod?.name || "-"}</div>
                                <div className="info-row">
                                    <span>Trạng thái:</span>
                                    <span
                                        className="status-badge-small"
                                        style={{ backgroundColor: getStatusColor(selectedOrder.deliveryStatus) }}
                                    >
                                        {getStatusIcon(selectedOrder.deliveryStatus)} {getStatusLabel(selectedOrder.deliveryStatus)}
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
