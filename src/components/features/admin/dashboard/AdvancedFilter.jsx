import React, { useState } from 'react';
import TimeRangeFilter from './TimeRangeFilter';
import ChartTypeSelector from './ChartTypeSelector';
import CurrencyToggle from './CurrencyToggle';
import LanguageSelector from './LanguageSelector';
import useLanguage from '../../../../hooks/useLanguage';
import './AdvancedFilter.css';

const AdvancedFilter = ({ 
  timeRange, 
  onTimeRangeChange, 
  chartType, 
  onChartTypeChange,
  currency,
  onCurrencyChange,
  onLanguageChange,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  // Debug logging
  console.log('AdvancedFilter - onLanguageChange prop:', onLanguageChange);
  console.log('AdvancedFilter - typeof onLanguageChange:', typeof onLanguageChange);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`advanced-filter ${className}`}>
      <div className="filter-header">
        <button 
          className="expand-button"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
        >
          <span className="expand-icon">
            {isExpanded ? '▼' : '▶'}
          </span>
          <span className="expand-text">
            {isExpanded ? t('filters.resetFilters') : t('filters.applyFilters')}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-section">
            <h4 className="section-title">{t('filters.timeRange')}</h4>
            <div className="filter-row">
              <TimeRangeFilter
                timeRange={timeRange}
                onTimeRangeChange={onTimeRangeChange}
              />
              <CurrencyToggle
                currency={currency}
                onCurrencyChange={onCurrencyChange}
              />
              <LanguageSelector onLanguageChange={onLanguageChange} />
            </div>
          </div>

          <div className="filter-section">
            <h4 className="section-title">{t('filters.chartType')}</h4>
            <div className="filter-row">
              <ChartTypeSelector
                chartType={chartType}
                onChartTypeChange={onChartTypeChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter; 