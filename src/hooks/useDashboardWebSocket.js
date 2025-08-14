import { useEffect, useRef, useCallback } from 'react';
import useWebSocket from './useWebSocket';

const useDashboardWebSocket = (onDataUpdate) => {
  const { connected, subscribe, unsubscribe } = useWebSocket();
  const subscriptionsRef = useRef([]);

  // Subscribe to dashboard real-time updates
  const subscribeToDashboardUpdates = useCallback(() => {
    if (!connected) return;

    // Subscribe to revenue updates
    const revenueSub = subscribe('/topic/dashboard/revenue', (data) => {
      onDataUpdate('revenue', data);
    });

    // Subscribe to customer updates
    const customerSub = subscribe('/topic/dashboard/customers', (data) => {
      onDataUpdate('customers', data);
    });

    // Subscribe to order updates
    const orderSub = subscribe('/topic/dashboard/orders', (data) => {
      onDataUpdate('orders', data);
    });

    // Subscribe to analytics updates
    const analyticsSub = subscribe('/topic/dashboard/analytics', (data) => {
      onDataUpdate('analytics', data);
    });

    // Subscribe to traffic updates
    const trafficSub = subscribe('/topic/dashboard/traffic', (data) => {
      onDataUpdate('traffic', data);
    });

    // Store subscriptions for cleanup
    if (revenueSub) subscriptionsRef.current.push(revenueSub);
    if (customerSub) subscriptionsRef.current.push(customerSub);
    if (orderSub) subscriptionsRef.current.push(orderSub);
    if (analyticsSub) subscriptionsRef.current.push(analyticsSub);
    if (trafficSub) subscriptionsRef.current.push(trafficSub);
  }, [connected, subscribe, onDataUpdate]);

  // Cleanup subscriptions
  const cleanupSubscriptions = useCallback(() => {
    subscriptionsRef.current.forEach(subscription => {
      unsubscribe(subscription);
    });
    subscriptionsRef.current = [];
  }, [unsubscribe]);

  // Subscribe when connected
  useEffect(() => {
    if (connected) {
      subscribeToDashboardUpdates();
    }

    return () => {
      cleanupSubscriptions();
    };
  }, [connected, subscribeToDashboardUpdates, cleanupSubscriptions]);

  return {
    connected,
    subscribeToDashboardUpdates,
    cleanupSubscriptions
  };
};

export default useDashboardWebSocket; 