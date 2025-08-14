import React from 'react';
import useLanguage from '../../../../hooks/useLanguage';
import './TimeRangeFilter.css';

const TimeRangeFilter = ({ timeRange, onTimeRangeChange, className = '' }) => {
  const { t } = useLanguage();
  
  // Debug logging
  console.log('TimeRangeFilter - timeRange:', timeRange);
  console.log('TimeRangeFilter - onTimeRangeChange:', onTimeRangeChange);
  
  // Validation
  if (!onTimeRangeChange || typeof onTimeRangeChange !== 'function') {
    console.error('TimeRangeFilter - Invalid onTimeRangeChange prop:', onTimeRangeChange);
    return (
      <div className={`time-range-filter ${className} error`}>
        <div className="filter-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{t('common.error')}: {t('filters.timeRange')}</span>
        </div>
      </div>
    );
  }
  
  const timeRangeOptions = [
    { value: 'today', label: t('filters.timeRanges.today'), icon: '📅' },
    { value: 'week', label: t('filters.timeRanges.week'), icon: '📊' },
    { value: 'month', label: t('filters.timeRanges.month'), icon: '📈' },
    { value: 'year', label: t('filters.timeRanges.year'), icon: '🎯' },
    { value: 'all', label: t('filters.timeRanges.all'), icon: '🌐' }
  ];

  return (
    <div className={`time-range-filter ${className}`}>
      <div className="filter-label">
        <span className="filter-icon">⏰</span>
        <span className="filter-text">{t('filters.timeRange')}:</span>
      </div>
      
      <div className="filter-options">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            className={`filter-option ${timeRange === option.value ? 'active' : ''}`}
            onClick={() => {
              console.log('TimeRangeFilter - Clicked:', option.value);
              if (onTimeRangeChange && typeof onTimeRangeChange === 'function') {
                onTimeRangeChange(option.value);
              } else {
                console.error('TimeRangeFilter - onTimeRangeChange is not a function:', onTimeRangeChange);
              }
            }}
            title={option.label}
          >
            <span className="option-icon">{option.icon}</span>
            <span className="option-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeFilter; 