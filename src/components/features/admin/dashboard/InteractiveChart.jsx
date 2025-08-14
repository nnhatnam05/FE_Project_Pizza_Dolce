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
import './InteractiveChart.css';

const InteractiveChart = ({ 
  data, 
  chartType = 'line', 
  title, 
  onDataPointClick,
  className = '' 
}) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [drillDownData, setDrillDownData] = useState(null);

  const handleDataPointClick = (data, index) => {
    setSelectedDataPoint(data);
    
    // Generate drill-down data based on the clicked point
    if (data && onDataPointClick) {
      const drillData = onDataPointClick(data, index);
      setDrillDownData(drillData);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-label">{label}</span>
          </div>
          <div className="tooltip-content">
            {payload.map((entry, index) => (
              <div key={index} className="tooltip-item">
                <span 
                  className="tooltip-color" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="tooltip-name">{entry.name}:</span>
                <span className="tooltip-value">{entry.value}</span>
              </div>
            ))}
          </div>
          <div className="tooltip-footer">
            <button 
              className="drill-down-btn"
              onClick={() => handleDataPointClick(payload[0]?.payload, payload[0]?.index)}
            >
              🔍 Xem chi tiết
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const chartData = drillDownData || data;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={Object.keys(chartData[0] || {}).find(key => key !== 'value' && key !== 'name')} 
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              activeDot={{ r: 8, onClick: handleDataPointClick }}
            />
          </LineChart>
        ) : chartType === 'bar' ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={Object.keys(chartData[0] || {}).find(key => key !== 'value' && key !== 'name')} 
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#3b82f6"
              onClick={handleDataPointClick}
            />
          </BarChart>
        ) : chartType === 'pie' ? (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              onClick={handleDataPointClick}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        ) : chartType === 'area' ? (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={Object.keys(chartData[0] || {}).find(key => key !== 'value' && key !== 'name')} 
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.3}
              activeDot={{ r: 8, onClick: handleDataPointClick }}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={Object.keys(chartData[0] || {}).find(key => key !== 'value' && key !== 'name')} 
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              activeDot={{ r: 8, onClick: handleDataPointClick }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className={`interactive-chart ${className}`}>
      {/* Chart Header */}
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {drillDownData && (
          <button 
            className="back-btn"
            onClick={() => {
              setDrillDownData(null);
              setSelectedDataPoint(null);
            }}
          >
            ← Quay lại
          </button>
        )}
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        {renderChart()}
      </div>

      {/* Selected Data Point Info */}
      {selectedDataPoint && (
        <div className="data-point-info">
          <h4>Thông tin chi tiết</h4>
          <div className="info-content">
            {Object.entries(selectedDataPoint).map(([key, value]) => (
              <div key={key} className="info-item">
                <span className="info-label">{key}:</span>
                <span className="info-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveChart; 