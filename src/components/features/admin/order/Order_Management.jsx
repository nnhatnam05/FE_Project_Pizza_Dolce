import React, { useState, useEffect } from 'react';
import { MdOutlinePending, MdLocalShipping, MdDoneAll } from 'react-icons/md';
import axios from 'axios';
import OrderWaitingConfirmation from './Order_WaitingConfirm';
import OrderList from './OrderList';
import OrderDeliveryStatus from './Order_DeliveryStatus';
import './Order.css';

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState('waiting');
  const [orderStats, setOrderStats] = useState({
    waiting: 0,
    delivery: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderStats();
    // Cập nhật thống kê mỗi 60 giây
    const interval = setInterval(fetchOrderStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrderStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Lấy số lượng đơn hàng chờ xác nhận
      const waitingRes = await axios.get('http://localhost:8080/api/orders/waiting-confirm', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Lấy số lượng đơn hàng đang giao
      const deliveryRes = await Promise.all([
        axios.get('http://localhost:8080/api/orders/filter?deliveryStatus=PREPARING', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/orders/filter?deliveryStatus=WAITING_FOR_SHIPPER', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/orders/filter?deliveryStatus=DELIVERING', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      // Lấy số lượng đơn hàng hoàn thành hoặc đã hủy
      const completedRes = await Promise.all([
        axios.get('http://localhost:8080/api/orders/filter?status=DELIVERED', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/orders/filter?status=CANCELLED', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      // Tính tổng số đơn hàng đang giao
      const deliveryCount = deliveryRes.reduce((total, res) => total + res.data.length, 0);
      
      // Tính tổng số đơn hàng hoàn thành/hủy
      const completedCount = completedRes.reduce((total, res) => total + res.data.length, 0);
      
      setOrderStats({
        waiting: waitingRes.data.length,
        delivery: deliveryCount,
        completed: completedCount
      });
    } catch (error) {
      console.error('Failed to fetch order statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'waiting':
        return <OrderWaitingConfirmation />;
      case 'delivery':
        return <OrderDeliveryStatus />;
      case 'completed':
        return <OrderList />;
      default:
        return <OrderWaitingConfirmation />;
    }
  };

  return (
    <div className="order-management-container">
      <div className="order-management-header">
        <h1>Quản lý đơn hàng</h1>
        <div className="order-stats">
          <div className="stat-item">
            <span className="stat-count waiting">
              {loading ? '...' : orderStats.waiting}
            </span>
            <span className="stat-label">Chờ xác nhận</span>
          </div>
          <div className="stat-item">
            <span className="stat-count delivery">
              {loading ? '...' : orderStats.delivery}
            </span>
            <span className="stat-label">Đang giao</span>
          </div>
          <div className="stat-item">
            <span className="stat-count completed">
              {loading ? '...' : orderStats.completed}
            </span>
            <span className="stat-label">Hoàn thành/Hủy</span>
          </div>
        </div>
      </div>
      
      <div className="order-tabs">
        <button 
          className={`order-tab ${activeTab === 'waiting' ? 'active' : ''}`}
          onClick={() => setActiveTab('waiting')}
        >
          <MdOutlinePending /> 
          <span>Đơn hàng chờ xác nhận</span>
        </button>
        <button 
          className={`order-tab ${activeTab === 'delivery' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivery')}
        >
          <MdLocalShipping />
          <span>Đơn hàng đang giao</span>
        </button>
        <button 
          className={`order-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <MdDoneAll />
          <span>Đơn hàng hoàn thành/Hủy</span>
        </button>
      </div>
      
      <div className="order-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default OrderManagement;
