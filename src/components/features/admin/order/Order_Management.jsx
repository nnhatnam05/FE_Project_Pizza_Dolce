import React, { useState, useEffect } from 'react';
import { MdOutlinePending, MdLocalShipping, MdDoneAll } from 'react-icons/md';
import { FaUtensils, FaShoppingBag, FaChartLine, FaSync } from 'react-icons/fa';
import axios from 'axios';
import OrderList from './OrderList';
import OrderDeliveryStatus from './Order_DeliveryStatus';
import AdminDineInOrders from './AdminDineInOrders';
import AdminTakeAwayOrders from './AdminTakeAwayOrders';
import './Order.css';

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState('delivery');
  const [orderStats, setOrderStats] = useState({
    delivery: 0,
    dineIn: 0,
    takeAway: 0,
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
      
      // Get number of orders being delivered
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
      
      // Get number of completed or cancelled orders
      const completedRes = await Promise.all([
        axios.get('http://localhost:8080/api/orders/filter?status=DELIVERED', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/orders/filter?status=CANCELLED', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      // Calculate total number of orders being delivered
      const deliveryCount = deliveryRes.reduce((total, res) => total + res.data.length, 0);
      
      // Calculate total number of completed/cancelled orders
      const completedCount = completedRes.reduce((total, res) => total + res.data.length, 0);
      
              // Get DINE-IN orders
      const dineInRes = await axios.get('http://localhost:8080/api/admin/orders/dine-in', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
              // Get TAKE-AWAY orders
      const takeAwayRes = await axios.get('http://localhost:8080/api/admin/orders/take-away', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const dineInCount = dineInRes.data.filter(order => !['COMPLETED', 'CANCELLED'].includes(order.status)).length;
      const takeAwayCount = takeAwayRes.data.filter(order => !['COMPLETED', 'CANCELLED'].includes(order.status)).length;

      setOrderStats({
        delivery: deliveryCount,
        dineIn: dineInCount,
        takeAway: takeAwayCount,
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
      case 'delivery':
        return <OrderDeliveryStatus />;
      case 'dineIn':
        return <AdminDineInOrders />;
      case 'takeAway':
        return <AdminTakeAwayOrders />;
      case 'completed':
        return <OrderList />;
      default:
        return <OrderDeliveryStatus />;
    }
  };

  return (
    <div className="modern-order-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-content">
          <div className="header-title">
            <FaChartLine className="title-icon" />
            <h1>Order Management</h1>
          </div>
          <button 
            className="refresh-btn"
            onClick={fetchOrderStats}
            disabled={loading}
          >
            <FaSync className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
        
        {/* Stats Overview */}
        <div className="order-stats-modern">
          <div className="stat-card-modern delivery">
            <div className="stat-icon-modern">
              <MdLocalShipping />
            </div>
            <div className="stat-content-modern">
              <div className="stat-number-modern">
                {loading ? '...' : orderStats.delivery}
              </div>
              <div className="stat-label-modern">Being Delivered</div>
            </div>
          </div>
          {/* <div className="stat-card-modern dine-in">
            <div className="stat-icon-modern">
              <FaUtensils />
            </div>
            <div className="stat-content-modern">
              <div className="stat-number-modern">
                {loading ? '...' : orderStats.dineIn}
              </div>
              <div className="stat-label-modern">Dine-In</div>
            </div>
          </div>
          <div className="stat-card-modern take-away">
            <div className="stat-icon-modern">
              <FaShoppingBag />
            </div>
            <div className="stat-content-modern">
              <div className="stat-number-modern">
                {loading ? '...' : orderStats.takeAway}
              </div>
              <div className="stat-label-modern">Take-Away</div>
            </div>
          </div> */}
          <div className="stat-card-modern completed">
            <div className="stat-icon-modern">
              <MdDoneAll />
            </div>
            <div className="stat-content-modern">
              <div className="stat-number-modern">
                {loading ? '...' : orderStats.completed}
              </div>
              <div className="stat-label-modern">Completed/Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="management-tabs-modern">
        <button 
          className={`management-tab-modern delivery ${activeTab === 'delivery' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivery')}
        >
          <MdLocalShipping className="tab-icon-modern" />
                          <span className="tab-label-modern">Orders Being Delivered</span>
          <span className="tab-count-modern">{loading ? '...' : orderStats.delivery}</span>
        </button>
        {/* <button 
          className={`management-tab-modern dine-in ${activeTab === 'dineIn' ? 'active' : ''}`}
          onClick={() => setActiveTab('dineIn')}
        >
          <FaUtensils className="tab-icon-modern" />
                          <span className="tab-label-modern">Dine-In Orders</span>
          <span className="tab-count-modern">{loading ? '...' : orderStats.dineIn}</span>
        </button> */}
        {/* <button 
          className={`management-tab-modern take-away ${activeTab === 'takeAway' ? 'active' : ''}`}
          onClick={() => setActiveTab('takeAway')}
        >
          <FaShoppingBag className="tab-icon-modern" />
                          <span className="tab-label-modern">Take-Away Orders</span>
          <span className="tab-count-modern">{loading ? '...' : orderStats.takeAway}</span>
        </button> */}
        <button 
          className={`management-tab-modern completed ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <MdDoneAll className="tab-icon-modern" />
                          <span className="tab-label-modern">Completed/Cancelled Orders</span>
          <span className="tab-count-modern">{loading ? '...' : orderStats.completed}</span>
        </button>
      </div>

      {/* Content */}
      <div className="management-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default OrderManagement;
