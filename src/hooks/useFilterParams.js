import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const useFilterParams = (defaultFilters) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(defaultFilters);

  // Memoize default filters to prevent infinite loops
  const memoizedDefaultFilters = useCallback(() => defaultFilters, [defaultFilters]);

  // Initialize filters from URL params or defaults
  useEffect(() => {
    const urlFilters = {};
    const currentDefaults = memoizedDefaultFilters();
    
    // Get all current search params
    for (const [key, value] of searchParams.entries()) {
      if (currentDefaults.hasOwnProperty(key)) {
        urlFilters[key] = value;
      }
    }

    // Merge with defaults, prioritizing URL params
    const mergedFilters = { ...currentDefaults, ...urlFilters };
    
    // Only update filters if they're different to prevent infinite loop
    setFilters(prevFilters => {
      const filtersChanged = JSON.stringify(prevFilters) !== JSON.stringify(mergedFilters);
      return filtersChanged ? mergedFilters : prevFilters;
    });
    
    // Don't update URL here to prevent infinite loop
    // URL will be updated only when user explicitly changes filters
  }, [searchParams, memoizedDefaultFilters]);

  // Update a specific filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      // Only update if value actually changed
      if (prev[key] === value) {
        return prev;
      }
      
      const newFilters = { ...prev, [key]: value };
      
      // Update URL params
      const newSearchParams = new URLSearchParams(searchParams);
      if (value === memoizedDefaultFilters()[key]) {
        newSearchParams.delete(key); // Remove if it's the default value
      } else {
        newSearchParams.set(key, value);
      }
      
      setSearchParams(newSearchParams, { replace: true });
      return newFilters;
    });
  }, [searchParams, setSearchParams, memoizedDefaultFilters]);

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    const defaults = memoizedDefaultFilters();
    setFilters(defaults);
    setSearchParams({}, { replace: true });
  }, [setSearchParams, memoizedDefaultFilters]);

  return {
    filters,
    updateFilter,
    resetFilters
  };
};

export default useFilterParams; 