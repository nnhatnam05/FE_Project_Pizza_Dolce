import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosConfig';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const useDashboardData = () => {
  const [data, setData] = useState({
    revenue: null,
    customers: null,
    vipCustomers: null,
    analytics: null
  });
  
  const [loading, setLoading] = useState({
    revenue: false,
    customers: false,
    vipCustomers: false,
    analytics: false
  });
  
  const [error, setError] = useState({
    revenue: null,
    customers: null,
    vipCustomers: null,
    analytics: null
  });

  const [timeRange, setTimeRange] = useState('month'); // today, week, month, year, all
  const abortControllersRef = useRef(new Map()); // Store abort controllers for each request type
  const fetchAllDataRef = useRef(null);
  const timeRangeRef = useRef(timeRange);
  const isInitializedRef = useRef(false); // Flag to prevent multiple initial fetches

  // Memoize state setters to prevent unnecessary re-renders
  const setDataMemo = useCallback((updater) => {
    setData(updater);
  }, []);

  const setLoadingMemo = useCallback((updater) => {
    setLoading(updater);
  }, []);

  const setErrorMemo = useCallback((updater) => {
    setError(updater);
  }, []);

  // Update timeRange ref when timeRange changes
  useEffect(() => {
    timeRangeRef.current = timeRange;
  }, [timeRange]);

  // Helper function to check if cache is valid
  const isCacheValid = (key) => {
    const cached = cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
  };

  // Helper function to get cached data
  const getCachedData = (key) => {
    const cached = cache.get(key);
    return cached ? cached.data : null;
  };

  // Helper function to set cached data
  const setCachedData = (key, data) => {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  };

  // Generic fetch function with caching
  const fetchData = useCallback(async (endpoint, cacheKey, setDataKey, setLoadingKey, setErrorKey) => {
    if (isCacheValid(cacheKey)) {
      const cachedData = getCachedData(cacheKey);
      setDataMemo(prev => ({ ...prev, [setDataKey]: cachedData }));
      return;
    }

    setLoadingMemo(prev => ({ ...prev, [setLoadingKey]: true }));
    setErrorMemo(prev => ({ ...prev, [setErrorKey]: null }));

    try {
      // Cancel previous request for this specific data type if exists
      const existingController = abortControllersRef.current.get(setDataKey);
      if (existingController) {
        existingController.abort();
      }
      
      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllersRef.current.set(setDataKey, abortController);
      
      const response = await api.get(endpoint, {
        signal: abortController.signal
      });

      const responseData = response.data;
      setDataMemo(prev => ({ ...prev, [setDataKey]: responseData }));
      setCachedData(cacheKey, responseData);
      
      // Remove the abort controller after successful request
      abortControllersRef.current.delete(setDataKey);
    } catch (err) {
      // Remove the abort controller on error
      abortControllersRef.current.delete(setDataKey);
      
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return; // Request was cancelled
      }
      
      // Only log non-cancellation errors
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        console.error(`Error fetching ${endpoint}:`, err);
        setErrorMemo(prev => ({ 
          ...prev, 
          [setErrorKey]: err.response?.data?.message || err.message || 'An error occurred'
        }));
      }
    } finally {
      setLoadingMemo(prev => ({ ...prev, [setLoadingKey]: false }));
    }
  }, [setDataMemo, setLoadingMemo, setErrorMemo]);

  // Fetch revenue analytics
  const fetchRevenue = useCallback(async (range = timeRangeRef.current) => {
    const cacheKey = `revenue_${range}`;
    await fetchData(
      `/admin/dashboard/revenue?timeRange=${range}`,
      cacheKey,
      'revenue',
      'revenue',
      'revenue'
    );
  }, [fetchData]);

  // Fetch customer statistics
  const fetchCustomers = useCallback(async () => {
    await fetchData(
      '/admin/dashboard/customers',
      'customers',
      'customers',
      'customers',
      'customers'
    );
  }, [fetchData]);

  // Fetch VIP customers
  const fetchVIPCustomers = useCallback(async (limit = 10) => {
    const cacheKey = `vip_customers_${limit}`;
    await fetchData(
      `/admin/dashboard/vip-customers?limit=${limit}`,
      cacheKey,
      'vipCustomers',
      'vipCustomers',
      'vipCustomers'
    );
  }, [fetchData]);

  // Fetch overall analytics
  const fetchAnalytics = useCallback(async () => {
    await fetchData(
      '/admin/dashboard/analytics',
      'analytics',
      'analytics',
      'analytics',
      'analytics'
    );
  }, [fetchData]);

  // Fetch all dashboard data
  const fetchAllData = useCallback(async (range = timeRangeRef.current) => {
    // Only update timeRange if it's different to prevent infinite loop
    if (timeRangeRef.current !== range) {
      setTimeRange(range);
    }

    // Add a small delay to prevent rapid API calls
    await new Promise(resolve => setTimeout(resolve, 100));

    // Fetch data in parallel
    await Promise.all([
      fetchRevenue(range),
      fetchCustomers(),
      fetchVIPCustomers(),
      fetchAnalytics()
    ]);
  }, [fetchRevenue, fetchCustomers, fetchVIPCustomers, fetchAnalytics]);

  // Store fetchAllData in ref to avoid dependency issues
  fetchAllDataRef.current = fetchAllData;

  // Refresh specific data
  const refreshData = useCallback(async (dataType, range = timeRangeRef.current) => {
    // Clear cache for specific data type
    const cacheKeys = Array.from(cache.keys()).filter(key => key.includes(dataType));
    cacheKeys.forEach(key => cache.delete(key));

    switch (dataType) {
      case 'revenue':
        await fetchRevenue(range);
        break;
      case 'customers':
        await fetchCustomers();
        break;
      case 'vipCustomers':
        await fetchVIPCustomers();
        break;
      case 'analytics':
        await fetchAnalytics();
        break;
      default:
        // For default case, fetch all data without using fetchAllData to avoid circular dependency
        await Promise.all([
          fetchRevenue(range),
          fetchCustomers(),
          fetchVIPCustomers(),
          fetchAnalytics()
        ]);
    }
  }, [fetchRevenue, fetchCustomers, fetchVIPCustomers, fetchAnalytics]);

  // Clear all cache
  const clearCache = useCallback(() => {
    cache.clear();
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      fetchAllDataRef.current?.();
    }
    
    // Cleanup function to abort ongoing requests
    return () => {
      // Abort all ongoing requests
      abortControllersRef.current.forEach(controller => {
        controller.abort();
      });
      abortControllersRef.current.clear();
    };
  }, []); // Only run once on mount

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if not currently loading
      const isLoading = Object.values(loading).some(Boolean);
      if (!isLoading) {
        fetchAllDataRef.current?.();
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []); // Remove loading dependency to prevent infinite loop

  return {
    data,
    loading,
    error,
    timeRange,
    setTimeRange,
    fetchRevenue,
    fetchCustomers,
    fetchVIPCustomers,
    fetchAnalytics,
    fetchAllData,
    refreshData,
    clearCache
  };
};

export default useDashboardData;