import React from 'react';
import useLanguage from '../../../../hooks/useLanguage';
import './ChartTypeSelector.css';

const ChartTypeSelector = ({ chartType, onChartTypeChange, className = '' }) => {
  const { t } = useLanguage();
  
  const chartTypeOptions = [
    { value: 'line', label: t('filters.chartTypes.line'), icon: '📈', description: t('filters.chartTypes.line') },
    { value: 'bar', label: t('filters.chartTypes.bar'), icon: '📊', description: t('filters.chartTypes.bar') },
    { value: 'pie', label: t('filters.chartTypes.pie'), icon: '🥧', description: t('filters.chartTypes.pie') },
    { value: 'area', label: t('filters.chartTypes.area'), icon: '🏔️', description: t('filters.chartTypes.area') }
  ];

  return (
    <div className={`chart-type-selector ${className}`}>
      <div className="selector-label">
        <span className="selector-icon">📊</span>
        <span className="selector-text">{t('filters.chartType')}:</span>
      </div>
      
      <div className="selector-options">
        {chartTypeOptions.map((option) => (
          <button
            key={option.value}
            className={`selector-option ${chartType === option.value ? 'active' : ''}`}
            onClick={() => onChartTypeChange(option.value)}
            title={option.description}
          >
            <span className="option-icon">{option.icon}</span>
            <span className="option-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartTypeSelector; 