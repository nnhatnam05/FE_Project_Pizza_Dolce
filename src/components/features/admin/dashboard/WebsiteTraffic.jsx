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
  AreaChart,
  Area
} from 'recharts';
import './WebsiteTraffic.css';

const WebsiteTraffic = ({ data, loading, error, chartType = 'line' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  if (loading) {
    return (
      <div className="website-traffic loading">
        <div className="loading-spinner">🌐</div>
        <div className="loading-text">Đang tải dữ liệu truy cập...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="website-traffic error">
        <div className="error-icon">❌</div>
        <div className="error-text">Lỗi: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="website-traffic no-data">
        <div className="no-data-icon">🌐</div>
        <div className="no-data-text">Không có dữ liệu truy cập</div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  // Mock traffic data (since backend doesn't have real traffic tracking yet)
  const generateTrafficData = (period) => {
    const baseVisits = data.totalVisits || 1000;
    const baseUnique = data.uniqueVisitors || 800;
    
    if (period === 'daily') {
      return Array.from({ length: 7 }, (_, i) => ({
        day: `T${i + 2}`,
        visits: Math.floor(baseVisits * (0.8 + Math.random() * 0.4)),
        uniqueVisitors: Math.floor(baseUnique * (0.8 + Math.random() * 0.4)),
        pageViews: Math.floor(baseVisits * (1.5 + Math.random() * 0.5)),
        avgSession: Math.floor(60 + Math.random() * 120)
      }));
    } else if (period === 'weekly') {
      return Array.from({ length: 4 }, (_, i) => ({
        week: `Tuần ${i + 1}`,
        visits: Math.floor(baseVisits * (0.7 + Math.random() * 0.6)),
        uniqueVisitors: Math.floor(baseUnique * (0.7 + Math.random() * 0.6)),
        pageViews: Math.floor(baseVisits * (1.3 + Math.random() * 0.7)),
        avgSession: Math.floor(45 + Math.random() * 90)
      }));
    } else {
      return Array.from({ length: 6 }, (_, i) => ({
        month: `T${i + 1}`,
        visits: Math.floor(baseVisits * (0.6 + Math.random() * 0.8)),
        uniqueVisitors: Math.floor(baseUnique * (0.6 + Math.random() * 0.8)),
        pageViews: Math.floor(baseVisits * (1.2 + Math.random() * 0.8)),
        avgSession: Math.floor(30 + Math.random() * 60)
      }));
    }
  };

  const trafficData = generateTrafficData(selectedPeriod);

  const renderChart = () => {
    const dataKey = selectedPeriod === 'daily' ? 'day' : selectedPeriod === 'weekly' ? 'week' : 'month';
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'visits' ? formatNumber(value) : 
                name === 'uniqueVisitors' ? formatNumber(value) :
                name === 'pageViews' ? formatNumber(value) :
                formatTime(value),
                name === 'visits' ? 'Lượt truy cập' :
                name === 'uniqueVisitors' ? 'Khách duy nhất' :
                name === 'pageViews' ? 'Lượt xem trang' :
                'Thời gian TB'
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="visits" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Lượt truy cập"
            />
            <Line 
              type="monotone" 
              dataKey="uniqueVisitors" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Khách duy nhất"
            />
            <Line 
              type="monotone" 
              dataKey="pageViews" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Lượt xem trang"
            />
          </LineChart>
        ) : chartType === 'bar' ? (
          <BarChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'visits' ? formatNumber(value) : 
                name === 'uniqueVisitors' ? formatNumber(value) :
                name === 'pageViews' ? formatNumber(value) :
                formatTime(value),
                name === 'visits' ? 'Lượt truy cập' :
                name === 'uniqueVisitors' ? 'Khách duy nhất' :
                name === 'pageViews' ? 'Lượt xem trang' :
                'Thời gian TB'
              ]}
            />
            <Legend />
            <Bar dataKey="visits" fill="#3b82f6" name="Lượt truy cập" />
            <Bar dataKey="uniqueVisitors" fill="#10b981" name="Khách duy nhất" />
            <Bar dataKey="pageViews" fill="#f59e0b" name="Lượt xem trang" />
          </BarChart>
        ) : chartType === 'area' ? (
          <AreaChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'visits' ? formatNumber(value) : 
                name === 'uniqueVisitors' ? formatNumber(value) :
                name === 'pageViews' ? formatNumber(value) :
                formatTime(value),
                name === 'visits' ? 'Lượt truy cập' :
                name === 'uniqueVisitors' ? 'Khách duy nhất' :
                name === 'pageViews' ? 'Lượt xem trang' :
                'Thời gian TB'
              ]}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="visits" 
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Lượt truy cập"
            />
            <Area 
              type="monotone" 
              dataKey="uniqueVisitors" 
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.3}
              name="Khách duy nhất"
            />
            <Area 
              type="monotone" 
              dataKey="pageViews" 
              stroke="#f59e0b" 
              fill="#f59e0b"
              fillOpacity={0.3}
              name="Lượt xem trang"
            />
          </AreaChart>
        ) : (
          <LineChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'visits' ? formatNumber(value) : 
                name === 'uniqueVisitors' ? formatNumber(value) :
                name === 'pageViews' ? formatNumber(value) :
                formatTime(value),
                name === 'visits' ? 'Lượt truy cập' :
                name === 'uniqueVisitors' ? 'Khách duy nhất' :
                name === 'pageViews' ? 'Lượt xem trang' :
                'Thời gian TB'
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="visits" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Lượt truy cập"
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className="website-traffic">
      {/* Period Selector */}
      <div className="period-selector">
        <button 
          className={`period-btn ${selectedPeriod === 'daily' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('daily')}
        >
          📅 Hàng ngày
        </button>
        <button 
          className={`period-btn ${selectedPeriod === 'weekly' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('weekly')}
        >
          📊 Hàng tuần
        </button>
        <button 
          className={`period-btn ${selectedPeriod === 'monthly' ? 'active' : ''}`}
          onClick={() => setSelectedPeriod('monthly')}
        >
          📈 Hàng tháng
        </button>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        <h3 className="chart-title">Thống kê truy cập website</h3>
        {renderChart()}
      </div>

      {/* Traffic Summary Cards */}
      <div className="traffic-summary">
        <div className="summary-card">
          <div className="summary-icon">👁️</div>
          <div className="summary-content">
            <div className="summary-label">Tổng lượt truy cập</div>
            <div className="summary-value">{formatNumber(data.totalVisits || 0)}</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">👤</div>
          <div className="summary-content">
            <div className="summary-label">Khách truy cập duy nhất</div>
            <div className="summary-value">{formatNumber(data.uniqueVisitors || 0)}</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">📄</div>
          <div className="summary-content">
            <div className="summary-label">Lượt xem trang</div>
            <div className="summary-value">{formatNumber(data.pageViews || 0)}</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">⏱️</div>
          <div className="summary-content">
            <div className="summary-label">Thời gian trung bình</div>
            <div className="summary-value">{formatTime(data.averageSessionDuration || 0)}</div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="additional-metrics">
        <div className="metric-item">
          <span className="metric-label">Tỷ lệ bounce:</span>
          <span className="metric-value">{(data.bounceRate || 45).toFixed(1)}%</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Trang/phiên:</span>
          <span className="metric-value">{(data.pagesPerSession || 2.3).toFixed(1)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Tỷ lệ chuyển đổi:</span>
          <span className="metric-value">{(data.conversionRate || 3.2).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default WebsiteTraffic; 