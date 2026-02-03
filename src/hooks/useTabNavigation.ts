/**
 * useTabNavigation Hook
 * Manages tab state synchronized with URL query parameters
 * Enables deep linking, browser navigation, and state persistence
 */

import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook for managing tab navigation with URL synchronization
 * @param defaultTab - The default tab to show if no tab query parameter exists
 * @returns [activeTab, setActiveTab] - Current active tab and function to change it
 * 
 * @example
 * const [activeTab, setActiveTab] = useTabNavigation('overview');
 * 
 * // URL: /board/123?tab=members
 * // activeTab will be 'members'
 * 
 * // URL: /board/123
 * // activeTab will be 'overview' (default)
 */
export const useTabNavigation = (defaultTab: string): [string, (tab: string) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL or use default
  const activeTab = searchParams.get('tab') || defaultTab;

  // Set active tab and update URL
  const setActiveTab = useCallback((tab: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true }); // Use replace to avoid cluttering history
  }, [searchParams, setSearchParams]);

  return [activeTab, setActiveTab];
};

export default useTabNavigation;
