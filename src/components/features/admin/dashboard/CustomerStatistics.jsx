import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import useLanguage from '../../../../hooks/useLanguage';
import './CustomerStatistics.css';

const CustomerStatistics = ({ customersData, vipCustomersData, loading, error, currency = 'USD' }) => {
  const { t, currentLanguage } = useLanguage();
  
  if (loading) {
    return (
      <div className="customer-statistics loading">
        <div className="loading-spinner">👥</div>
        <div className="loading-text">{t('customers.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-statistics error">
        <div className="error-icon">❌</div>
        <div className="error-text">{t('customers.error')}: {error}</div>
      </div>
    );
  }

  if (!customersData) {
    return (
      <div className="customer-statistics no-data">
        <div className="no-data-icon">👥</div>
        <div className="no-data-text">{t('customers.noData')}</div>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (!num) return '0';
    const locale = currentLanguage === 'en' ? 'en-US' : 'vi-VN';
    return new Intl.NumberFormat(locale).format(num);
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const locale = currentLanguage === 'en' ? 'en-US' : 'vi-VN';
    return new Date(dateString).toLocaleDateString(locale);
  };

  // Customer statistics cards
  const customerCards = [
    {
      title: t('customers.totalCustomers'),
      value: formatNumber(customersData.totalCustomers),
      icon: '👥',
      color: '#3b82f6',
      description: t('customers.totalCustomers')
    },
    {
      title: t('customers.newCustomersThisMonth'),
      value: formatNumber(customersData.newCustomersThisMonth),
      icon: '🆕',
      color: '#10b981',
      description: t('customers.newCustomersThisMonth')
    },
    {
      title: t('customers.newCustomersThisWeek'),
      value: formatNumber(customersData.newCustomersThisWeek),
      icon: '📅',
      color: '#f59e0b',
      description: t('customers.newCustomersThisWeek')
    },
    {
      title: t('customers.newCustomersToday'),
      value: formatNumber(customersData.newCustomersToday),
      icon: '🌟',
      color: '#8b5cf6',
      description: 'Khách hàng mới hôm nay'
    },
    {
      title: 'Khách hàng VIP',
      value: formatNumber(customersData.vipCustomers),
      icon: '👑',
      color: '#f97316',
      description: 'Khách hàng có điểm > 100'
    }
  ];

  // Customer growth data - sử dụng dữ liệu thực tế
  const growthData = [
    {
      name: t('customers.averagePointsPerCustomer'),
      value: customersData?.averagePointsPerCustomer || 0,
      color: '#f59e0b'
    },
    {
      name: t('customers.vipCustomers'),
      value: customersData?.vipCustomers || 0,
      color: '#8b5cf6'
    },
    {
      name: t('customers.newCustomersThisMonth'),
      value: customersData?.newCustomersThisMonth || 0,
      color: '#10b981'
    }
  ];

  // VIP Customers table data
  const vipCustomers = vipCustomersData || [];

  return (
    <div className="customer-statistics">
      {/* Customer Statistics Cards */}
      <div className="stats-cards">
        {customerCards.map((card, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="card-header">
              <span className="card-icon">{card.icon}</span>
              <span className="card-title">{card.title}</span>
            </div>
            <div className="card-value">{card.value}</div>
            <div className="card-description">{card.description}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Customer Growth Chart */}
        <div className="chart-container">
          <h3 className="chart-title">{t('customers.customerGrowth')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [formatNumber(value), t('common.value')]} />
              <Bar dataKey="value" fill="#8884d8">
                {growthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* VIP Customers Table */}
      <div className="vip-customers-section">
        <h3 className="section-title">{t('vipCustomers.title')}</h3>
        <div className="table-container">
          <table className="vip-customers-table">
            <thead>
              <tr>
                <th>{t('common.count')}</th>
                <th>{t('vipCustomers.fullName')}</th>
                <th>Email</th>
                <th>{t('vipCustomers.phoneNumber')}</th>
                <th>{t('vipCustomers.points')}</th>
                <th>{t('vipCustomers.rank')}</th>
                <th>{t('vipCustomers.totalSpent')}</th>
                <th>{t('vipCustomers.lastOrderDate')}</th>
              </tr>
            </thead>
            <tbody>
              {vipCustomers.length > 0 ? (
                vipCustomers.map((customer, index) => (
                  <tr key={customer.customerId || index}>
                    <td>{index + 1}</td>
                    <td className="customer-name">{customer.fullName}</td>
                    <td className="customer-email">{customer.email}</td>
                    <td className="customer-phone">{customer.phoneNumber || 'N/A'}</td>
                    <td className="customer-points">
                      <span className="points-badge">{customer.points}</span>
                    </td>
                    <td className="customer-rank">
                      <span className={`rank-badge rank-${customer.rank?.toLowerCase()}`}>
                        {customer.rank || 'BRONZE'}
                      </span>
                    </td>
                    <td className="customer-spent">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="customer-last-order">
                      {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data-row">
                    <div className="no-data-content">
                      <span className="no-data-icon">👑</span>
                      <span className="no-data-text">{t('vipCustomers.noData')}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerStatistics;