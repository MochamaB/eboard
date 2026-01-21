export interface BreadcrumbItem {
  title: string;
  path?: string;
}

const ROUTE_NAMES: Record<string, string> = {
  dashboard: 'Dashboard',
  meetings: 'Meetings',
  documents: 'Documents',
  users: 'Users',
  boards: 'Boards',
  notifications: 'Notifications',
  reports: 'Reports',
  settings: 'Settings',
  admin: 'Administration',
};

export const generateBreadcrumbs = (
  pathname: string
): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  
  // segments[0] = orgId, segments[1+] = actual routes
  const routeSegments = segments.slice(1);
  
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Add each route segment
  routeSegments.forEach((segment, index) => {
    // Check if it's a UUID/ID (skip in breadcrumb display)
    const isId = /^[a-f0-9-]{36}$/i.test(segment) || segment.length > 20;
    
    if (!isId) {
      breadcrumbs.push({
        title: ROUTE_NAMES[segment] || formatSegment(segment),
        path: `/${segments[0]}/${routeSegments.slice(0, index + 1).join('/')}`,
      });
    } else {
      // For detail pages, show generic name
      breadcrumbs.push({
        title: getDetailTitle(routeSegments[index - 1]),
        // No path for detail pages (not clickable)
      });
    }
  });
  
  return breadcrumbs;
};

const formatSegment = (segment: string): string => {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getDetailTitle = (parentSegment?: string): string => {
  const detailTitles: Record<string, string> = {
    meetings: 'Meeting Details',
    documents: 'Document Details',
    users: 'User Profile',
    boards: 'Board Details',
  };
  
  return detailTitles[parentSegment || ''] || 'Details';
};
