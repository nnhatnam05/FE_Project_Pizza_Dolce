import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Order.css';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function Order_WaitingConfirm() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
    // Thiết lập interval để tự động làm mới dữ liệu mỗi 30 giây
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/orders/waiting-confirm', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
      // Nếu đơn hàng đang được chọn không còn trong danh sách, bỏ chọn
      if (selectedOrder && !res.data.some(order => order.id === selectedOrder.id)) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      if (showLoading) {
        alert('Không thể tải danh sách đơn hàng!');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleConfirm = async (orderId) => {
    setConfirming(orderId);
    try {
      await axios.put(
        `http://localhost:8080/api/orders/${orderId}/admin-confirm`,
        {},
        {
          params: { action: 'confirm' },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchOrders();
      alert('Đơn hàng đã được xác nhận thành công!');
    } catch (error) {
      console.error('Failed to confirm order:', error);
      alert('Không thể xác nhận đơn hàng!');
    } finally {
      setConfirming(null);
    }
  };

  const handleRejectClick = (order) => {
    setSelectedOrder(order);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }
    setConfirming(selectedOrder.id);
    try {
      await axios.put(
        `http://localhost:8080/api/orders/${selectedOrder.id}/admin-confirm`,
        {},
        {
          params: {
            action: 'reject',
            reason: rejectReason
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setShowRejectModal(false);
      setSelectedOrder(null);
      setRejectReason('');
      await fetchOrders();
      alert('Đơn hàng đã bị từ chối!');
    } catch (error) {
      console.error('Failed to reject order:', error);
      alert('Không thể từ chối đơn hàng!');
    } finally {
      setConfirming(null);
    }
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

  return (
    <div className="order-confirm-main">
      <div className="order-waiting-confirm-container">
        <h2>Đơn hàng chờ xác nhận</h2>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <div>Đang tải dữ liệu...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">Không có đơn hàng nào đang chờ xác nhận</div>
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
                <th>Thanh toán</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
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
                  <td>{order.paymentMethod?.name || "Chưa thanh toán"}</td>
                  <td className="date-column">{formatDate(order.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="confirm-btn-s"
                        disabled={confirming === order.id}
                        onClick={e => { e.stopPropagation(); handleConfirm(order.id); }}
                        title="Đã nhận được tiền"
                      >
                        {confirming === order.id ? <div className="spinner-small"></div> : <FaCheck />}
                      </button>
                      <button
                        className="reject-btn"
                        disabled={confirming === order.id}
                        onClick={e => { e.stopPropagation(); handleRejectClick(order); }}
                        title="Chưa nhận được tiền"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal for reject reason */}
        {showRejectModal && (
          <div className="confirmation-dialog-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="confirmation-dialog" onClick={e => e.stopPropagation()}>
              <div className="confirmation-dialog-title">Từ chối đơn hàng</div>
              <div className="confirmation-dialog-content">
                <p>Bạn có chắc chắn muốn từ chối đơn hàng <strong>#{selectedOrder?.orderNumber}</strong>?</p>

                <div className="form-group mt-15">
                  <label htmlFor="rejectReason">Lý do từ chối:</label>
                  <textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do từ chối đơn hàng..."
                    rows="3"
                    className={!rejectReason.trim() ? "required-field" : ""}
                  />
                  {!rejectReason.trim() && (
                    <small className="text-error">Vui lòng nhập lý do từ chối</small>
                  )}
                </div>
              </div>
              <div className="confirmation-dialog-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowRejectModal(false)}
                  disabled={confirming}
                >
                  Hủy bỏ
                </button>
                <button
                  className="btn-confirm"
                  disabled={confirming || !rejectReason.trim()}
                  onClick={handleRejectSubmit}
                >
                  {confirming ? <><div className="spinner-small"></div> Đang xử lý...</> : "Từ chối"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right-side customer info panel */}
      <div className="customer-info-card">
        <h3>Thông tin khách hàng</h3>
        {selectedOrder && selectedOrder.customer ? (
          <div className="customer-details">
            <div className="cus-name">{selectedOrder.customer.fullName}</div>
            <div className="info-row"><span>Email:</span> {selectedOrder.customer.email}</div>
            <div className="info-row"><span>Điện thoại:</span> {selectedOrder.customer.phoneNumber || "-"}</div>
            <div className="info-row"><span>Địa chỉ:</span> {selectedOrder.customer.address || "-"}</div>

            {selectedOrder.customer.imageUrl && (
              <div className="customer-image">
                <img
                  src={`http://localhost:8080${selectedOrder.customer.imageUrl}`}
                  alt="Customer"
                />
              </div>
            )}

            <div className="info-row"><span>Điểm tích lũy:</span> {selectedOrder.customer.point || 0}</div>

            <div className="order-summary">
              <h4>Tóm tắt đơn hàng</h4>
              <div className="info-row"><span>Mã đơn:</span> #{selectedOrder.orderNumber}</div>
              <div className="info-row"><span>Tổng tiền:</span> ${selectedOrder.totalPrice}</div>
              <div className="info-row">
                <span>Thanh toán:</span> {selectedOrder.paymentMethod?.name || "Chưa thanh toán"}
              </div>
              <div className="info-row">
                <span>Thời gian:</span> {formatDate(selectedOrder.createdAt)}
              </div>
            </div>

            <div className="action-section">
              <button
                className="btn-track"
                onClick={() => handleConfirm(selectedOrder.id)}
                disabled={confirming === selectedOrder.id}
              >
                {confirming === selectedOrder.id ?
                  <><div className="spinner-small"></div> Đang xử lý...</> :
                  <><FaCheck /> Đã nhận được tiền</>
                }
              </button>
              <button
                className="btn-contact"
                onClick={() => handleRejectClick(selectedOrder)}
                disabled={confirming === selectedOrder.id}
              >
                <FaTimes /> Không nhận được tiền
              </button>
            </div>
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
