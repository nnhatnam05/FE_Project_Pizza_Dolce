import React from 'react';

// Utility to suppress ResizeObserver errors
export const suppressResizeObserverErrors = () => {
  // Store the original console.error
  const originalError = console.error;
  
  // Override console.error to filter out ResizeObserver errors
  console.error = (...args) => {
    const errorMessage = args[0];
    
    // Check if it's a ResizeObserver error
    if (
      typeof errorMessage === 'string' &&
      errorMessage.includes('ResizeObserver loop')
    ) {
      // Suppress this error
      return;
    }
    
    // Call the original console.error for other errors
    originalError.apply(console, args);
  };
  
  // Also handle window errors
  const handleWindowError = (event) => {
    if (
      event.message &&
      event.message.includes('ResizeObserver loop')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  };
  
  window.addEventListener('error', handleWindowError);
  
  // Return cleanup function
  return () => {
    console.error = originalError;
    window.removeEventListener('error', handleWindowError);
  };
};

// Hook to use in React components
export const useResizeObserverErrorSuppression = () => {
  React.useEffect(() => {
    const cleanup = suppressResizeObserverErrors();
    return cleanup;
  }, []);
}; 