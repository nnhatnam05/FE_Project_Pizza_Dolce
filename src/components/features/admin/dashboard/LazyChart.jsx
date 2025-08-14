import React, { useState, useEffect, useRef } from 'react';
import './LazyChart.css';

const LazyChart = ({ 
  children, 
  height = 300, 
  placeholder = '📊', 
  threshold = 0.1,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  useEffect(() => {
    if (isVisible) {
      // Simulate loading delay for better UX
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div 
      ref={chartRef}
      className={`lazy-chart ${className}`}
      style={{ height }}
    >
      {!isVisible && (
        <div className="chart-placeholder">
          <div className="placeholder-icon">{placeholder}</div>
          <div className="placeholder-text">Đang tải biểu đồ...</div>
        </div>
      )}
      
      {isVisible && !isLoaded && (
        <div className="chart-loading">
          <div className="loading-spinner">🔄</div>
          <div className="loading-text">Đang tải dữ liệu...</div>
        </div>
      )}
      
      {isLoaded && (
        <div className="chart-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default LazyChart; 