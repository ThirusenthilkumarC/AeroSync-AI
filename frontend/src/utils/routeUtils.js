/**
 * Centralized Route Active Utility for AeroSync AI
 *
 * Prevents prefix-collision bugs where '/recovery-sandbox' incorrectly activates '/recovery'.
 * Only matches:
 * 1. Exact path equality (e.g. '/recovery' === '/recovery')
 * 2. Explicit child segments separated by '/' (e.g. '/flights/FL-123' matches parent '/flights')
 */
export const isRouteActive = (currentPath, itemPath) => {
  if (!currentPath || !itemPath) return false;
  
  // Exact match
  if (currentPath === itemPath) return true;
  
  // Root path should never prefix-match sub-routes
  if (itemPath === '/') return false;
  
  // Child segment match only (e.g. '/flights/123' matches '/flights', but '/recovery-sandbox' DOES NOT match '/recovery')
  return currentPath.startsWith(itemPath + '/');
};
