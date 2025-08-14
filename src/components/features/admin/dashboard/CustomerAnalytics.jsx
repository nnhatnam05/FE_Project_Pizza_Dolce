import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import './CustomerAnalytics.css';

const CustomerAnalytics = ({ data, loading, error, chartType = 'line' }) => {
  const [selectedMetric, setSelectedMetric] = useState('growth');

  if (loading) {
    return (
      <div className="customer-analytics loading">
        <div className="loading-spinner">👥</div>
        <div className="loading-text">Đang tải dữ liệu khách hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-analytics error">
        <div className="error-icon">❌</div>
        <div className="error-text">Lỗi: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="customer-analytics no-data">
        <div className="no-data-icon">👥</div>
        <div className="no-data-text">Không có dữ liệu khách hàng</div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Prepare customer growth data (mock data for now)
  const customerGrowthData = [
    { month: 'T1', newCustomers: data.newCustomersThisMonth || 0, totalCustomers: data.totalCustomers || 0 },
    { month: 'T2', newCustomers: Math.floor((data.newCustomersThisMonth || 0) * 0.8), totalCustomers: (data.totalCustomers || 0) + Math.floor((data.newCustomersThisMonth || 0) * 0.8) },
    { month: 'T3', newCustomers: Math.floor((data.newCustomersThisMonth || 0) * 1.2), totalCustomers: (data.totalCustomers || 0) + Math.floor((data.newCustomersThisMonth || 0) * 2) },
    { month: 'T4', newCustomers: Math.floor((data.newCustomersThisMonth || 0) * 0.9), totalCustomers: (data.totalCustomers || 0) + Math.floor((data.newCustomersThisMonth || 0) * 2.9) },
    { month: 'T5', newCustomers: Math.floor((data.newCustomersThisMonth || 0) * 1.1), totalCustomers: (data.totalCustomers || 0) + Math.floor((data.newCustomersThisMonth || 0) * 4) },
    { month: 'T6', newCustomers: data.newCustomersThisMonth || 0, totalCustomers: data.totalCustomers || 0 }
  ];

  // Customer engagement metrics
  const engagementData = [
    { metric: 'Tổng khách hàng', value: data.totalCustomers || 0, color: '#3b82f6' },
    { metric: 'Khách hàng mới', value: data.newCustomersThisMonth || 0, color: '#10b981' },
    { metric: 'Khách hàng VIP', value: data.vipCustomers || 0, color: '#f59e0b' },
    { metric: 'Khách hàng hoạt động', value: data.activeCustomers || 0, color: '#8b5cf6' }
  ];

  // Customer type distribution
  const customerTypeData = [
    { type: 'Khách hàng thường', value: (data.totalCustomers || 0) - (data.vipCustomers || 0), color: '#6b7280' },
    { type: 'Khách hàng VIP', value: data.vipCustomers || 0, color: '#f59e0b' }
  ];

  const renderChart = () => {
    switch (selectedMetric) {
      case 'growth':
        return (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [formatNumber(value), name === 'newCustomers' ? 'Khách hàng mới' : 'Tổng khách hàng']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="newCustomers" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Khách hàng mới"
                />
                <Line 
                  type="monotone" 
                  dataKey="totalCustomers" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Tổng khách hàng"
                />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [formatNumber(value), name === 'newCustomers' ? 'Khách hàng mới' : 'Tổng khách hàng']} />
                <Legend />
                <Bar dataKey="newCustomers" fill="#10b981" name="Khách hàng mới" />
                <Bar dataKey="totalCustomers" fill="#3b82f6" name="Tổng khách hàng" />
              </BarChart>
            ) : chartType === 'area' ? (
              <AreaChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [formatNumber(value), name === 'newCustomers' ? 'Khách hàng mới' : 'Tổng khách hàng']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="newCustomers" 
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.3}
                  name="Khách hàng mới"
                />
                <Area 
                  type="monotone" 
                  dataKey="totalCustomers" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Tổng khách hàng"
                />
              </AreaChart>
            ) : (
              <LineChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [formatNumber(value), name === 'newCustomers' ? 'Khách hàng mới' : 'Tổng khách hàng']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="newCustomers" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Khách hàng mới"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        );
      
      case 'engagement':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip formatter={(value) => [formatNumber(value), 'Số lượng']} />
              <Bar dataKey="value" fill="#8884d8">
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerTypeData}
                dataKey="value"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={({ type, value }) => `${type}: ${formatNumber(value)}`}
                labelLine={true}
              >
                {customerTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [formatNumber(value), name]} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="customer-analytics">
      {/* Metric Selector */}
      <div className="metric-selector">
        <button 
          className={`metric-btn ${selectedMetric === 'growth' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('growth')}
        >
          📈 Tăng trưởng
        </button>
        <button 
          className={`metric-btn ${selectedMetric === 'engagement' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('engagement')}
        >
          🔥 Tương tác
        </button>
        <button 
          className={`metric-btn ${selectedMetric === 'distribution' ? 'active' : ''}`}
          onClick={() => setSelectedMetric('distribution')}
        >
          🥧 Phân bố
        </button>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        <h3 className="chart-title">
          {selectedMetric === 'growth' && 'Tăng trưởng khách hàng'}
          {selectedMetric === 'engagement' && 'Chỉ số tương tác khách hàng'}
          {selectedMetric === 'distribution' && 'Phân bố loại khách hàng'}
        </h3>
        {renderChart()}
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-label">Tổng khách hàng</div>
            <div className="metric-value">{formatNumber(data.totalCustomers)}</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🆕</div>
          <div className="metric-content">
            <div className="metric-label">Khách hàng mới tháng này</div>
            <div className="metric-value">{formatNumber(data.newCustomersThisMonth)}</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">👑</div>
          <div className="metric-content">
            <div className="metric-label">Khách hàng VIP</div>
            <div className="metric-value">{formatNumber(data.vipCustomers)}</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-content">
            <div className="metric-label">Khách hàng hoạt động</div>
            <div className="metric-value">{formatNumber(data.activeCustomers)}</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="additional-stats">
        <div className="stat-item">
          <span className="stat-label">Điểm trung bình:</span>
          <span className="stat-value">{data.averagePointsPerCustomer?.toFixed(1) || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tỷ lệ VIP:</span>
          <span className="stat-value">
            {data.totalCustomers > 0 ? ((data.vipCustomers / data.totalCustomers) * 100).toFixed(1) : 0}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tỷ lệ hoạt động:</span>
          <span className="stat-value">
            {data.totalCustomers > 0 ? ((data.activeCustomers / data.totalCustomers) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics; 