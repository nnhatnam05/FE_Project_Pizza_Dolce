import React from 'react';
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
  Area,
  PieChart,
  Pie
} from 'recharts';
import useLanguage from '../../../../hooks/useLanguage';
import './RevenueAnalytics.css';

const RevenueAnalytics = ({ data, loading, error, chartType = 'line', currency = 'USD' }) => {
  const { t, currentLanguage } = useLanguage();
  
  // Debug logging
  console.log('RevenueAnalytics - data:', data);
  console.log('RevenueAnalytics - loading:', loading);
  console.log('RevenueAnalytics - error:', error);
  console.log('RevenueAnalytics - chartType:', chartType);
  
  if (loading) {
    return (
      <div className="revenue-analytics loading">
        <div className="loading-spinner">📊</div>
        <div className="loading-text">{t('revenue.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="revenue-analytics error">
        <div className="error-icon">❌</div>
        <div className="error-text">{t('revenue.error')}: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="revenue-analytics no-data">
        <div className="no-data-icon">📈</div>
        <div className="no-data-text">{t('revenue.noData')}</div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount) return currency === 'USD' ? '$0' : '₫0';
    
    if (currency === 'USD') {
      const locale = currentLanguage === 'en' ? 'en-US' : 'vi-VN';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount);
    } else {
      // Convert USD to VND (assuming 1 USD = 24,000 VND)
      const vndAmount = amount * 24000;
      const locale = currentLanguage === 'en' ? 'en-US' : 'vi-VN';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(vndAmount);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    const locale = currentLanguage === 'en' ? 'en-US' : 'vi-VN';
    return new Intl.NumberFormat(locale).format(num);
  };

  const formatPercentage = (value) => {
    if (!value) return '0%';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Prepare chart data
  const revenueOverTime = data.revenueOverTime || [];
  const revenueByOrderType = data.revenueByOrderType || {};

  // Ensure revenueOverTime has at least some data for chart display
  const hasRevenueData = revenueOverTime.length > 0;
  
  // Debug: Log chart data
  console.log('RevenueAnalytics - revenueOverTime:', revenueOverTime);
  console.log('RevenueAnalytics - hasRevenueData:', hasRevenueData);
  
  const finalHasRevenueData = revenueOverTime.length > 0;
  console.log('RevenueAnalytics - finalHasRevenueData:', finalHasRevenueData);

  // Prepare revenue distribution data for pie chart
  const revenueDistribution = [
    { name: t('revenue.deliveryRevenue'), value: data.deliveryRevenue || 0, color: '#3b82f6', percentage: 0 },
    { name: t('revenue.dineInRevenue'), value: data.dineInRevenue || 0, color: '#f59e0b', percentage: 0 },
    { name: t('revenue.takeAwayRevenue'), value: data.takeAwayRevenue || 0, color: '#8b5cf6', percentage: 0 }
  ].filter(item => item.value > 0);

  // Calculate percentages
  const totalRevenueValue = data.totalRevenue || 0;
  revenueDistribution.forEach(item => {
    item.percentage = totalRevenueValue > 0 ? (item.value / totalRevenueValue * 100).toFixed(1) : 0;
  });

  // Revenue summary cards
  const revenueCards = [
    {
      title: t('revenue.totalRevenue'),
      value: formatCurrency(data.totalRevenue),
      change: formatPercentage(data.revenueGrowth || 0),
      isPositive: (data.revenueGrowth || 0) >= 0,
      icon: '💰',
      color: '#10b981'
    },
    {
      title: t('revenue.deliveryRevenue'),
      value: formatCurrency(data.deliveryRevenue),
      count: formatNumber(data.deliveryOrders),
      icon: '🚚',
      color: '#3b82f6'
    },
    {
      title: t('revenue.dineInRevenue'),
      value: formatCurrency(data.dineInRevenue),
      count: formatNumber(data.dineInOrders),
      icon: '🍽️',
      color: '#f59e0b'
    },
    {
      title: t('revenue.takeAwayRevenue'),
      value: formatCurrency(data.takeAwayRevenue),
      count: formatNumber(data.takeAwayOrders),
      icon: '📦',
      color: '#8b5cf6'
    }
  ];

  // Order type distribution for pie chart
  const orderTypeData = [
    { name: t('revenue.deliveryOrders'), value: data.deliveryOrders || 0, color: '#3b82f6' },
    { name: t('revenue.dineInOrders'), value: data.dineInOrders || 0, color: '#f59e0b' },
    { name: t('revenue.takeAwayOrders'), value: data.takeAwayOrders || 0, color: '#8b5cf6' }
  ];

  // Check if there's any order data
  const hasOrderData = orderTypeData.some(item => item.value > 0);
  
  const finalHasOrderData = orderTypeData.some(item => item.value > 0);
  console.log('RevenueAnalytics - finalHasOrderData:', finalHasOrderData);

  return (
    <div className="revenue-analytics">
      {/* Revenue Summary Cards */}
      <div className="revenue-cards">
        {revenueCards.map((card, index) => (
          <div key={index} className="revenue-card" style={{ borderLeftColor: card.color }}>
            <div className="card-header">
              <span className="card-icon">{card.icon}</span>
              <span className="card-title">{card.title}</span>
            </div>
            <div className="card-value">{card.value}</div>
            {card.change && (
              <div className={`card-change ${card.isPositive ? 'positive' : 'negative'}`}>
                {card.isPositive ? '▲' : '▼'} {card.change}
              </div>
            )}
            {card.count && (
              <div className="card-count">{card.count} {t('revenue.totalOrders').toLowerCase()}</div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Revenue Over Time Chart */}
        <div className="chart-container">
          <h3 className="chart-title">{t('revenue.revenueOverTime')}</h3>
          {finalHasRevenueData ? (
            <ResponsiveContainer width="100%" height={350}>
            {chartType === 'line' ? (
                              <LineChart data={revenueOverTime} margin={{ top: 20, right: 40, left: 40, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'vi-VN')}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), t('revenue.revenue')]}
                  labelFormatter={(date) => new Date(date).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'vi-VN')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name={t('revenue.totalRevenue')}
                />
                <Line 
                  type="monotone" 
                  dataKey="deliveryRevenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name={t('revenue.deliveryRevenue')}
                />
                <Line 
                  type="monotone" 
                  dataKey="dineInRevenue" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name={t('revenue.dineInRevenue')}
                />
                <Line 
                  type="monotone" 
                  dataKey="takeAwayRevenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name={t('revenue.takeAwayRevenue')}
                />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={revenueOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'vi-VN')}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), t('revenue.revenue')]}
                  labelFormatter={(date) => new Date(date).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'vi-VN')}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name={t('revenue.totalRevenue')} />
                <Bar dataKey="deliveryRevenue" fill="#3b82f6" name={t('revenue.deliveryRevenue')} />
                <Bar dataKey="dineInRevenue" fill="#f59e0b" name={t('revenue.dineInRevenue')} />
                <Bar dataKey="takeAwayRevenue" fill="#8b5cf6" name={t('revenue.takeAwayRevenue')} />
              </BarChart>
            ) : chartType === 'area' ? (
              <AreaChart data={revenueOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'vi-VN')}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), t('revenue.revenue')]}
                  labelFormatter={(date) => new Date(date).toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'vi-VN')}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.3}
                  name={t('revenue.totalRevenue')}
                />
                <Area 
                  type="monotone" 
                  dataKey="deliveryRevenue" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name={t('revenue.deliveryRevenue')}
                />
                <Area 
                  type="monotone" 
                  dataKey="dineInRevenue" 
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  fillOpacity={0.3}
                  name={t('revenue.dineInRevenue')}
                />
                <Area 
                  type="monotone" 
                  dataKey="takeAwayRevenue" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  name={t('revenue.takeAwayRevenue')}
                />
              </AreaChart>
            ) : (
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('vi-VN')}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('vi-VN')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Tổng doanh thu"
                />
              </LineChart>
            )}
            </ResponsiveContainer>
          ) : (
            <div className="no-data-chart">
              <div className="no-data-icon">📈</div>
              <div className="no-data-text">{t('revenue.noData')}</div>
              <div className="no-data-subtext">{t('common.noData')}</div>
            </div>
          )}
        </div>

        {/* Revenue Distribution Pie Chart */}
        <div className="chart-container">
          <h3 className="chart-title">{t('revenue.revenueByOrderType')}</h3>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={revenueDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  labelLine={true}
                >
                  {revenueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrency(value), 
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Order Type Distribution */}
      <div className="chart-container">
        <h3 className="chart-title">{t('revenue.revenueByOrderType')}</h3>
        <div className="chart-content">
          {finalHasOrderData ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={orderTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [formatNumber(value), t('revenue.totalOrders')]}
                  labelStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                  {orderTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-chart">
              <div className="no-data-icon">📊</div>
              <div className="no-data-text">{t('revenue.noData')}</div>
              <div className="no-data-subtext">{t('common.noData')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="metrics-section">
        <div className="metric-item">
          <span className="metric-label">{t('revenue.averageOrderValue')}:</span>
          <span className="metric-value">{formatCurrency(data.averageOrderValue)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">{t('revenue.totalOrders')}:</span>
          <span className="metric-value">{formatNumber(data.totalOrders)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">{t('revenue.revenueGrowth')}:</span>
          <span className={`metric-value ${(data.revenueGrowth || 0) >= 0 ? 'positive' : 'negative'}`}>
            {formatPercentage(data.revenueGrowth || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics; 