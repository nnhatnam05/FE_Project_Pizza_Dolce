import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Order.css";
import { FaSync, FaSearch } from "react-icons/fa";

const DELIVERY_STATUS = [
  { key: "PREPARING", label: "Đang chuẩn bị", color: "#ff9800" },
  { key: "WAITING_FOR_SHIPPER", label: "Chờ shipper", color: "#9c27b0" },
  { key: "DELIVERING", label: "Đang giao", color: "#2196f3" }
];

export default function Order_DeliveryStatus() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, preparing, waiting, delivering
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

      // Gộp kết quả
      const allOrders = [
        ...responses[0].data,
        ...responses[1].data,
        ...responses[2].data
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Loại trùng theo id
      const uniqueOrders = Array.from(
        new Map(allOrders.map(order => [order.id, order])).values()
      );

      setOrders(uniqueOrders);
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
  };

  const getStatusLabel = (status) => {
    const statusObj = DELIVERY_STATUS.find(s => s.key === status);
    return statusObj ? statusObj.label : status;
  };

  const getStatusColor = (status) => {
    const statusObj = DELIVERY_STATUS.find(s => s.key === status);
    return statusObj ? statusObj.color : "#757575";
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
    <div className="order-confirm-main">
      <div className="order-waiting-confirm-container">
        <div className="delivery-header">
          <h2>Theo dõi giao hàng</h2>
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
              <button className="refresh-btn" onClick={handleManualRefresh}>
                <FaSync className={loading ? "spinning" : ""} /> Làm mới
              </button>
              <div className="refresh-interval">
                <span>Tự động làm mới:</span>
                <select
                  value={refreshInterval}
                  onChange={(e) => handleRefreshIntervalChange(parseInt(e.target.value))}
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

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚚</div>
            <div className="empty-state-text">Không có đơn hàng nào</div>
          </div>
        ) : (
          <table className="waiting-orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
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
                      {order.foodList?.map(food => (
                        <li key={food.id}>
                          {food.name} <b>x{food.quantity}</b>
                          <span className="food-price"> ({Number(food.price).toLocaleString()} $)</span>
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
                      {getStatusLabel(order.deliveryStatus)}
                    </span>
                  </td>
                  <td className="date-column">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Thông tin chi tiết khách hàng */}
      <div className="customer-info-card">
        <h3>Thông tin đơn hàng</h3>
        {selectedOrder ? (
          <div className="customer-details">
            <div className="cus-name">{selectedOrder.customer?.fullName}</div>
            <div className="info-row"><span>Email:</span> {selectedOrder.customer?.email}</div>
            <div className="info-row"><span>Điện thoại:</span> {selectedOrder.customer?.phoneNumber || "-"}</div>
                                            
                                <h4 style={{marginTop: '15px', marginBottom: '10px', color: '#333'}}>Thông tin giao hàng</h4>
                                <div className="info-row"><span>Người nhận:</span> {selectedOrder.recipientName || "-"}</div>
                                <div className="info-row"><span>SĐT giao hàng:</span> {selectedOrder.recipientPhone || "-"}</div>
                                <div className="info-row"><span>Địa chỉ giao hàng:</span> {selectedOrder.deliveryAddress || "-"}</div>

            {selectedOrder.customer?.imageUrl && (
              <div className="customer-image">
                <img
                  src={`http://localhost:8080${selectedOrder.customer.imageUrl}`}
                  alt="Customer"
                />
              </div>
            )}

            <div className="info-row"><span>Điểm tích lũy:</span> {selectedOrder.customer?.point || 0}</div>

            <div className="order-summary">
              <h4>Tóm tắt đơn hàng</h4>
              <div className="info-row"><span>Mã đơn:</span> #{selectedOrder.orderNumber}</div>
              <div className="info-row"><span>Tổng tiền:</span> ${selectedOrder.totalPrice}</div>
              {selectedOrder.voucherCode && (
                <div className="info-row voucher-info">
                  <span>Voucher:</span> 
                  <span className="voucher-code">{selectedOrder.voucherCode}</span>
                  {selectedOrder.voucherDiscount > 0 && (
                    <span className="voucher-discount">(-${selectedOrder.voucherDiscount})</span>
                  )}
                </div>
              )}
              <div className="info-row">
                <span>Thanh toán:</span> {selectedOrder.paymentMethod?.name || "Chưa thanh toán"}
              </div>
              <div className="info-row">
                <span>Trạng thái:</span>
                <span
                  className="status-badge-small"
                  style={{ backgroundColor: getStatusColor(selectedOrder.deliveryStatus) }}
                >
                  {getStatusLabel(selectedOrder.deliveryStatus)}
                </span>
              </div>
              <div className="info-row">
                <span>Thời gian:</span> {formatDate(selectedOrder.createdAt)}
              </div>

              {selectedOrder.deliveryNote && (
                <div className="mt-15">
                  <span>Ghi chú giao hàng:</span>
                  <p>{selectedOrder.deliveryNote}</p>
                </div>
              )}
            </div>

            {/* Hiển thị lịch sử trạng thái */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="order-history mt-15">
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
          </div>
        ) : (
          <div className="empty-selection">
            Chọn một đơn hàng để xem thông tin chi tiết.
          </div>
        )}
      </div>
    </div>
  );
}
