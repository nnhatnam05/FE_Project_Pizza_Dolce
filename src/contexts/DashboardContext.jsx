import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import useDashboardData from '../hooks/useDashboardData';

// Action types
const DASHBOARD_ACTIONS = {
  SET_TIME_RANGE: 'SET_TIME_RANGE',
  SET_CHART_TYPE: 'SET_CHART_TYPE',
  SET_FILTER_OPTIONS: 'SET_FILTER_OPTIONS',
  UPDATE_DATA: 'UPDATE_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  REFRESH_DATA: 'REFRESH_DATA',
  CLEAR_CACHE: 'CLEAR_CACHE',
  SET_CURRENCY: 'SET_CURRENCY',
  SET_REAL_TIME: 'SET_REAL_TIME',
  SET_REFRESHING: 'SET_REFRESHING',
  UPDATE_REAL_TIME_DATA: 'UPDATE_REAL_TIME_DATA'
};

// Initial state
const initialState = {
  timeRange: 'month',
  chartType: 'line',
  showPercentages: true,
  showAbsoluteValues: true,
  compareWithPrevious: false,
  lastUpdate: null,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  isAutoRefresh: true,
  currency: 'USD',
  realTimeEnabled: true,
  isRefreshing: false
};

// Reducer function
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_TIME_RANGE:
      return {
        ...state,
        timeRange: action.payload,
        lastUpdate: new Date()
      };
    
    case DASHBOARD_ACTIONS.SET_CHART_TYPE:
      return {
        ...state,
        chartType: action.payload,
        lastUpdate: new Date()
      };
    
    case DASHBOARD_ACTIONS.SET_FILTER_OPTIONS:
      return {
        ...state,
        ...action.payload,
        lastUpdate: new Date()
      };
    
    case DASHBOARD_ACTIONS.UPDATE_DATA:
      return {
        ...state,
        lastUpdate: new Date()
      };
    
    case DASHBOARD_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case DASHBOARD_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    
    case DASHBOARD_ACTIONS.REFRESH_DATA:
      return {
        ...state,
        lastUpdate: new Date()
      };
    
    case DASHBOARD_ACTIONS.SET_REAL_TIME:
      return {
        ...state,
        realTimeEnabled: action.payload
      };

    case DASHBOARD_ACTIONS.SET_REFRESHING:
      return {
        ...state,
        isRefreshing: action.payload
      };

    case DASHBOARD_ACTIONS.UPDATE_REAL_TIME_DATA:
      return {
        ...state,
        lastUpdate: new Date()
      };

    case DASHBOARD_ACTIONS.CLEAR_CACHE:
      return {
        ...state,
        lastUpdate: new Date()
      };

    case DASHBOARD_ACTIONS.SET_CURRENCY:
      return {
        ...state,
        currency: action.payload,
        lastUpdate: new Date()
      };

    default:
      return state;
  }
};

// Create context
const DashboardContext = createContext();

// Provider component
export const DashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const dashboardData = useDashboardData();

  // Sync timeRange between context and hook - only sync from hook to context
  useEffect(() => {
    if (dashboardData.timeRange && dashboardData.timeRange !== state.timeRange) {
      dispatch({ type: DASHBOARD_ACTIONS.SET_TIME_RANGE, payload: dashboardData.timeRange });
    }
  }, [dashboardData.timeRange]); // Remove state.timeRange from dependencies

  // Update context when data changes
  useEffect(() => {
    if (dashboardData.data) {
      dispatch({ type: DASHBOARD_ACTIONS.UPDATE_DATA });
    }
  }, [dashboardData.data]);

  // Update loading state
  useEffect(() => {
    dispatch({ type: DASHBOARD_ACTIONS.SET_LOADING, payload: dashboardData.loading });
  }, [dashboardData.loading]);

  // Update error state
  useEffect(() => {
    dispatch({ type: DASHBOARD_ACTIONS.SET_ERROR, payload: dashboardData.error });
  }, [dashboardData.error]);

  // Memoized actions
  const setTimeRange = useCallback((range) => {
    console.log('DashboardContext - setTimeRange called with:', range);
    dashboardData.setTimeRange(range);
    dispatch({ type: DASHBOARD_ACTIONS.SET_TIME_RANGE, payload: range });
  }, [dashboardData.setTimeRange, dispatch]);

  const setChartType = useCallback((type) => {
    dispatch({ type: DASHBOARD_ACTIONS.SET_CHART_TYPE, payload: type });
  }, [dispatch]);

  const setFilterOptions = useCallback((options) => {
    dispatch({ type: DASHBOARD_ACTIONS.SET_FILTER_OPTIONS, payload: options });
  }, [dispatch]);

  const refreshData = useCallback(async (dataType, range) => {
    await dashboardData.refreshData(dataType, range);
    dispatch({ type: DASHBOARD_ACTIONS.REFRESH_DATA });
  }, [dashboardData.refreshData, dispatch]);

  const refreshAllData = useCallback(async (range) => {
    await dashboardData.fetchAllData(range);
    dispatch({ type: DASHBOARD_ACTIONS.REFRESH_DATA });
  }, [dashboardData.fetchAllData, dispatch]);

  const clearCache = useCallback(() => {
    dashboardData.clearCache();
    dispatch({ type: DASHBOARD_ACTIONS.CLEAR_CACHE });
  }, [dashboardData.clearCache, dispatch]);

  const setCurrency = useCallback((currency) => {
    dispatch({ type: DASHBOARD_ACTIONS.SET_CURRENCY, payload: currency });
  }, [dispatch]);

  const setRealTime = useCallback((enabled) => {
    dispatch({ type: DASHBOARD_ACTIONS.SET_REAL_TIME, payload: enabled });
  }, [dispatch]);

  // Context value
  const contextValue = useMemo(() => ({
    // State
    timeRange: state.timeRange,
    chartType: state.chartType,
    showPercentages: state.showPercentages,
    showAbsoluteValues: state.showAbsoluteValues,
    compareWithPrevious: state.compareWithPrevious,
    lastUpdate: state.lastUpdate,
    refreshInterval: state.refreshInterval,
    isAutoRefresh: state.isAutoRefresh,
    currency: state.currency,
    realTimeEnabled: state.realTimeEnabled,
    isRefreshing: state.isRefreshing,
    
    // Data from hook
    data: dashboardData.data,
    loading: dashboardData.loading,
    error: dashboardData.error,
    
    // Actions
    setTimeRange,
    setChartType,
    setFilterOptions,
    refreshData,
    refreshAllData,
    clearCache,
    setCurrency,
    setRealTime,
    
    // Individual fetch methods
    fetchRevenue: dashboardData.fetchRevenue,
    fetchCustomers: dashboardData.fetchCustomers,
    fetchVIPCustomers: dashboardData.fetchVIPCustomers,
    fetchAnalytics: dashboardData.fetchAnalytics
  }), [
    state.timeRange,
    state.chartType,
    state.showPercentages,
    state.showAbsoluteValues,
    state.compareWithPrevious,
    state.lastUpdate,
    state.refreshInterval,
    state.isAutoRefresh,
    state.currency,
    state.realTimeEnabled,
    state.isRefreshing,
    dashboardData.data,
    dashboardData.loading,
    dashboardData.error,
    setTimeRange,
    setChartType,
    setFilterOptions,
    refreshData,
    refreshAllData,
    clearCache,
    setCurrency,
    setRealTime,
    dashboardData.fetchRevenue,
    dashboardData.fetchCustomers,
    dashboardData.fetchVIPCustomers,
    dashboardData.fetchAnalytics
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use dashboard context
export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};

// Export action types for external use
export { DASHBOARD_ACTIONS };