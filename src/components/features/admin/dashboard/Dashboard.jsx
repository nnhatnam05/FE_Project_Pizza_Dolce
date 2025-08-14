import React, { useMemo } from 'react';
import { useDashboardContext } from '../../../../contexts/DashboardContext';
import useFilterParams from '../../../../hooks/useFilterParams';
import useLanguage from '../../../../hooks/useLanguage';
import AdvancedFilter from './AdvancedFilter';
import FilterSummary from './FilterSummary';
import RevenueAnalytics from './RevenueAnalytics';
import CustomerStatistics from './CustomerStatistics';
import './Dashboard.css';

export default function Dashboard() {
  const {
    data,
    loading,
    error,
    timeRange,
    chartType,
    currency,
    setTimeRange,
    setChartType,
    setCurrency,
    refreshAllData
  } = useDashboardContext();

  // Initialize filter params with defaults - use useMemo to prevent recreation
  const defaultFilters = useMemo(() => ({
    timeRange: 'month',
    chartType: 'line',
    currency: 'USD',
    language: 'en' // Mặc định tiếng Anh
  }), []);

  const { filters, updateFilter, resetFilters } = useFilterParams(defaultFilters);
  const { t, currentLanguage } = useLanguage();

  // Use filters from URL params
  const currentTimeRange = filters.timeRange || timeRange;
  const currentChartType = filters.chartType || chartType;
  const currentCurrency = filters.currency || currency;

  // Handle time range change
  const handleTimeRangeChange = async (newTimeRange) => {
    console.log('Dashboard - handleTimeRangeChange called with:', newTimeRange);
    // Only update if value actually changed
    if (currentTimeRange !== newTimeRange) {
      updateFilter('timeRange', newTimeRange);
      setTimeRange(newTimeRange);
      // Auto reload data
      refreshAllData(newTimeRange);
    }
  };

  // Handle chart type change
  const handleChartTypeChange = (newChartType) => {
    // Only update if value actually changed
    if (currentChartType !== newChartType) {
      updateFilter('chartType', newChartType);
      setChartType(newChartType);
      // Auto reload data
      refreshAllData(currentTimeRange);
    }
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency) => {
    console.log('Dashboard - handleCurrencyChange called with:', newCurrency);
    // Only update if value actually changed
    if (currentCurrency !== newCurrency) {
      updateFilter('currency', newCurrency);
      setCurrency(newCurrency);
      // Auto reload data
      refreshAllData(currentTimeRange);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    console.log('Dashboard - handleLanguageChange called with:', newLanguage);
    console.log('Dashboard - currentTimeRange:', currentTimeRange);
    console.log('Dashboard - refreshAllData function:', refreshAllData);
    
    // Reload entire browser page when language changes
    console.log('Dashboard - Reloading entire page for language change');
    setTimeout(() => {
      window.location.reload();
    }, 100); // Small delay to ensure language is saved
  };

  // Format current date
  const formatCurrentDate = () => {
    const now = new Date();
    const locale = currentLanguage === 'en' ? 'en-US' : 'vi-VN';
    return now.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboardRoot">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">{t('dashboard.title')}</h1>
            <p className="dashboard-subtitle">
              {t('dashboard.subtitle')} {formatCurrentDate()}
            </p>
          </div>
          <div className="header-right">
            <button
              className="refresh-btn"
              onClick={() => refreshAllData(currentTimeRange)}
              disabled={Object.values(loading).some(Boolean)}
            >
              {t('dashboard.refreshData')}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filter Controls */}
      <AdvancedFilter
        timeRange={currentTimeRange}
        onTimeRangeChange={handleTimeRangeChange}
        chartType={currentChartType}
        onChartTypeChange={handleChartTypeChange}
        currency={currentCurrency}
        onCurrencyChange={handleCurrencyChange}
        onLanguageChange={handleLanguageChange}
      />

      {/* Filter Summary */}
      <FilterSummary
        filters={filters}
        onReset={resetFilters}
      />

      {/* Loading State for All Data */}
      {Object.values(loading).every(Boolean) && (
        <div className="global-loading">
          <div className="loading-spinner">📊</div>
          <div className="loading-text">{t('dashboard.loadingData')}</div>
        </div>
      )}

      {/* Error State for All Data */}
      {Object.values(error).some(Boolean) && (
        <div className="global-error">
          <div className="error-icon">❌</div>
          <div className="error-text">
            {t('dashboard.errorMessage')}
          </div>
          <button
            className="retry-btn"
            onClick={() => refreshAllData(currentTimeRange)}
          >
            {t('dashboard.retryButton')}
          </button>
        </div>
      )}

      {/* Dashboard Content */}
      {!Object.values(loading).every(Boolean) && !Object.values(error).some(Boolean) && (
        <div className="dashboard-content">
            {/* Revenue Analytics Section */}
            <div className="dashboard-section">
              <h2 className="section-title">{t('revenue.title')}</h2>
              <RevenueAnalytics
                data={data.revenue}
                loading={loading.revenue}
                error={error.revenue}
                chartType={currentChartType}
                currency={currentCurrency}
              />
            </div>

            {/* Customer Statistics Section */}
            <div className="dashboard-section">
              <h2 className="section-title">{t('customers.title')}</h2>
              <CustomerStatistics
                customersData={data.customers}
                vipCustomersData={data.vipCustomers}
                loading={loading.customers || loading.vipCustomers}
                error={error.customers || error.vipCustomers}
                currency={currentCurrency}
              />
            </div>
        </div>
      )}
    </div>
  );
}
