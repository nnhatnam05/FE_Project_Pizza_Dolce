import React, { useState, useEffect, useRef } from 'react';
import './PerformanceMonitor.css';

const PerformanceMonitor = ({ data, loading, error }) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    apiResponseTime: 0,
    cacheHitRate: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.round(renderTime)
    }));
    renderStartTime.current = performance.now();
  }, [data]);

  useEffect(() => {
    // Monitor memory usage if available
    if ('memory' in performance) {
      const memory = performance.memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
      }));
    }
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const getPerformanceStatus = (renderTime) => {
    if (renderTime < 100) return { status: 'excellent', color: '#10b981', icon: '🟢' };
    if (renderTime < 300) return { status: 'good', color: '#f59e0b', icon: '🟡' };
    return { status: 'poor', color: '#ef4444', icon: '🔴' };
  };

  const performanceStatus = getPerformanceStatus(metrics.renderTime);

  if (!isVisible) {
    return (
      <div className="performance-monitor-toggle">
        <button onClick={toggleVisibility} className="toggle-btn">
          📊 Performance
        </button>
      </div>
    );
  }

  return (
    <div className="performance-monitor">
      <div className="monitor-header">
        <h3 className="monitor-title">📊 Performance Monitor</h3>
        <button onClick={toggleVisibility} className="close-btn">×</button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <div className="metric-label">Render Time</div>
            <div className="metric-value" style={{ color: performanceStatus.color }}>
              {metrics.renderTime}ms
            </div>
            <div className="metric-status">
              {performanceStatus.icon} {performanceStatus.status}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🧠</div>
          <div className="metric-content">
            <div className="metric-label">Memory Usage</div>
            <div className="metric-value">
              {metrics.memoryUsage}MB
            </div>
            <div className="metric-status">
              {metrics.memoryUsage < 50 ? '🟢 Low' : metrics.memoryUsage < 100 ? '🟡 Medium' : '🔴 High'}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🌐</div>
          <div className="metric-content">
            <div className="metric-label">API Status</div>
            <div className="metric-value">
              {Object.values(loading).some(Boolean) ? 'Loading...' : 'Ready'}
            </div>
            <div className="metric-status">
              {Object.values(error).some(Boolean) ? '🔴 Error' : '🟢 OK'}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💾</div>
          <div className="metric-content">
            <div className="metric-label">Cache Status</div>
            <div className="metric-value">
              {metrics.cacheHitRate}%
            </div>
            <div className="metric-status">
              {metrics.cacheHitRate > 80 ? '🟢 Excellent' : metrics.cacheHitRate > 50 ? '🟡 Good' : '🔴 Poor'}
            </div>
          </div>
        </div>
      </div>

      <div className="performance-tips">
        <h4>💡 Performance Tips:</h4>
        <ul>
          <li>Keep render time under 300ms for optimal UX</li>
          <li>Monitor memory usage to prevent leaks</li>
          <li>Use lazy loading for better initial load time</li>
          <li>Enable caching for frequently accessed data</li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceMonitor; 