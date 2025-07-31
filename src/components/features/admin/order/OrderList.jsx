import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import './Order.css';
import { format } from 'date-fns';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // all, delivered, cancelled
  const [searchTerm, setSearchTerm] = useState('');



  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Lấy đơn hàng đã giao và đã hủy
      const [deliveredRes, cancelledRes] = await Promise.all([
        axios.get('http://localhost:8080/api/orders/filter?status=DELIVERED', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/orders/filter?status=CANCELLED', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Gộp kết quả
      const allOrders = [...deliveredRes.data, ...cancelledRes.data]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(allOrders);
      applyFilters(allOrders, statusFilter, searchTerm);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      alert("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const applyFilters = (ordersList, status, search) => {
    let result = [...ordersList];

    // Lọc theo trạng thái
    if (status !== 'all') {
      result = result.filter(order => order.status === status);
    }

    // Lọc theo từ khóa tìm kiếm
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customer?.fullName?.toLowerCase().includes(searchLower) ||
        order.customer?.email?.toLowerCase().includes(searchLower) ||
        order.foodList?.some(food => food.name.toLowerCase().includes(searchLower))
      );
    }

    setFilteredOrders(result);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    applyFilters(orders, status, searchTerm);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(orders, statusFilter, value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  const getStatusBadgeClass = (status) => {
    return status === 'DELIVERED' ? 'status-available' : 'status-onhold';
  };

  return (
    <div className="order-confirm-main">
      <div className="order-waiting-confirm-container">
        <div className="delivery-header">
          <h2>Đơn hàng đã hoàn thành/hủy</h2>

          <div className="order-filters">
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

            <div className="status-filter-buttons">
              <button
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange('all')}
              >
                Tất cả ({orders.length})
              </button>
              <button
                className={`filter-btn ${statusFilter === 'DELIVERED' ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange('DELIVERED')}
              >
                Đã giao ({orders.filter(o => o.status === 'DELIVERED').length})
              </button>
              <button
                className={`filter-btn ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
                onClick={() => handleStatusFilterChange('CANCELLED')}
              >
                Đã hủy ({orders.filter(o => o.status === 'CANCELLED').length})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">Không tìm thấy đơn hàng nào</div>
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
                  onClick={() => setSelectedOrder(order)}
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
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="date-column">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Thông tin chi tiết đơn hàng */}
      <div className="customer-info-card">
        <h3>Thông tin đơn hàng</h3>
        {selectedOrder ? (
          <div className="customer-details">
            <div className="cus-name">{selectedOrder.customer?.fullName}</div>
            <div className="info-row"><span>Email:</span> {selectedOrder.customer?.email}</div>
            <div className="info-row"><span>Điện thoại:</span> {selectedOrder.customer?.phoneNumber || "-"}</div>
            <div className="info-row"><span>Địa chỉ:</span> {selectedOrder.customer?.address || "-"}</div>

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
              <div className="info-row">
                <span>Thanh toán:</span> {selectedOrder.paymentMethod?.name || "Chưa thanh toán"}
              </div>
              <div className="info-row">
                <span>Trạng thái:</span>
                <span className={` ${getStatusBadgeClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="info-row">
                <span>Thời gian:</span> {formatDate(selectedOrder.createdAt)}
              </div>

              {selectedOrder.status === 'CANCELLED' && selectedOrder.rejectReason && (
                <div className="mt-15">
                  <span>Lý do hủy:</span>
                  <p className="reject-reason">{selectedOrder.rejectReason}</p>
                </div>
              )}

              {selectedOrder.deliveryNote && (
                <div className="mt-15">
                  <span>Ghi chú giao hàng:</span>
                  <p>{selectedOrder.deliveryNote}</p>
                </div>
              )}
            </div>

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