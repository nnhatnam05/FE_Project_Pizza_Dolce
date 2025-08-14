import React from 'react';
import useLanguage from '../../../../hooks/useLanguage';
import './FilterSummary.css';

const FilterSummary = ({ filters, onReset, className = '' }) => {
  const { t } = useLanguage();
  
  const getFilterLabel = (key, value) => {
    switch (key) {
      case 'timeRange':
        const timeRangeLabels = {
          'today': t('filters.timeRanges.today'),
          'week': t('filters.timeRanges.week'),
          'month': t('filters.timeRanges.month'),
          'year': t('filters.timeRanges.year'),
          'all': t('filters.timeRanges.all')
        };
        return `${t('filters.timeRange')}: ${timeRangeLabels[value] || value}`;
      
      case 'chartType':
        const chartTypeLabels = {
          'line': t('filters.chartTypes.line'),
          'bar': t('filters.chartTypes.bar'),
          'area': t('filters.chartTypes.area')
        };
        return `${t('filters.chartType')}: ${chartTypeLabels[value] || value}`;
      
      case 'currency':
        const currencyLabels = {
          'USD': t('filters.currencies.USD'),
          'VND': t('filters.currencies.VND')
        };
        return `${t('filters.currency')}: ${currencyLabels[value] || value}`;
      
      default:
        return `${key}: ${value}`;
    }
  };

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    // Show only non-default values
    const defaults = {
      timeRange: 'month',
      chartType: 'line',
      currency: 'USD',
      showPercentages: 'true',
      showAbsoluteValues: 'true',
      compareWithPrevious: 'false'
    };
    return value !== defaults[key];
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={`filter-summary ${className}`}>
      <div className="summary-header">
        <span className="summary-icon">🔍</span>
        <span className="summary-text">{t('filters.applyFilters')}:</span>
      </div>
      
      <div className="active-filters">
        {activeFilters.map(([key, value]) => (
          <span key={key} className="filter-tag">
            {getFilterLabel(key, value)}
          </span>
        ))}
      </div>
      
      <button 
        className="reset-button"
        onClick={onReset}
        title={t('filters.resetFilters')}
      >
        <span className="reset-icon">🔄</span>
        <span className="reset-text">{t('filters.resetFilters')}</span>
      </button>
    </div>
  );
};

export default FilterSummary; 