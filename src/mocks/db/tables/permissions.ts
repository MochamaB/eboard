/**
 * Permissions Table - Granular permission definitions
 * 
 * Permissions are grouped by category (module) and define what actions
 * users can perform within the system.
 */

export interface PermissionRow {
  id: number;
  code: string;           // e.g., 'meetings.create', 'documents.upload'
  name: string;
  description: string;
  category: string;       // e.g., 'meetings', 'documents', 'voting'
}

// ============================================================================
// PERMISSIONS TABLE
// ============================================================================

export const permissionsTable: PermissionRow[] = [
  // USERS
  { id: 1, code: 'users.view', name: 'View Users', description: 'Can view user list and profiles', category: 'users' },
  { id: 2, code: 'users.create', name: 'Create Users', description: 'Can create new users', category: 'users' },
  { id: 3, code: 'users.edit', name: 'Edit Users', description: 'Can edit user profiles', category: 'users' },
  { id: 4, code: 'users.delete', name: 'Delete Users', description: 'Can deactivate users', category: 'users' },
  { id: 5, code: 'users.bulk', name: 'Bulk User Actions', description: 'Can perform bulk actions on users', category: 'users' },

  // BOARDS
  { id: 10, code: 'boards.view', name: 'View Boards', description: 'Can view board list', category: 'boards' },
  { id: 11, code: 'boards.create', name: 'Create Boards', description: 'Can create new boards', category: 'boards' },
  { id: 12, code: 'boards.edit', name: 'Edit Boards', description: 'Can edit board settings', category: 'boards' },
  { id: 13, code: 'boards.members', name: 'Manage Board Members', description: 'Can add/remove board members', category: 'boards' },
  { id: 14, code: 'boards.view_all', name: 'View All Boards', description: 'Can view all boards globally', category: 'boards' },

  // MEETINGS
  { id: 20, code: 'meetings.view', name: 'View Meetings', description: 'Can view meeting list', category: 'meetings' },
  { id: 21, code: 'meetings.create', name: 'Create Meetings', description: 'Can schedule meetings', category: 'meetings' },
  { id: 22, code: 'meetings.edit', name: 'Edit Meetings', description: 'Can edit meeting details', category: 'meetings' },
  { id: 23, code: 'meetings.cancel', name: 'Cancel Meetings', description: 'Can cancel meetings', category: 'meetings' },
  { id: 24, code: 'meetings.control', name: 'Control Meetings', description: 'Can start/end meetings', category: 'meetings' },
  { id: 25, code: 'meetings.present', name: 'Present in Meetings', description: 'Can present during meetings', category: 'meetings' },

  // DOCUMENTS
  { id: 30, code: 'documents.view', name: 'View Documents', description: 'Can view documents', category: 'documents' },
  { id: 31, code: 'documents.upload', name: 'Upload Documents', description: 'Can upload documents', category: 'documents' },
  { id: 32, code: 'documents.delete', name: 'Delete Documents', description: 'Can delete documents', category: 'documents' },
  { id: 33, code: 'documents.download', name: 'Download Documents', description: 'Can download documents', category: 'documents' },

  // VOTING
  { id: 40, code: 'voting.view', name: 'View Votes', description: 'Can view voting results', category: 'voting' },
  { id: 41, code: 'voting.create', name: 'Create Votes', description: 'Can create voting items', category: 'voting' },
  { id: 42, code: 'voting.cast', name: 'Cast Vote', description: 'Can cast votes', category: 'voting' },
  { id: 43, code: 'voting.start', name: 'Start Voting', description: 'Can start/stop voting', category: 'voting' },

  // MINUTES
  { id: 50, code: 'minutes.view', name: 'View Minutes', description: 'Can view meeting minutes', category: 'minutes' },
  { id: 51, code: 'minutes.create', name: 'Create Minutes', description: 'Can create minutes', category: 'minutes' },
  { id: 52, code: 'minutes.approve', name: 'Approve Minutes', description: 'Can approve minutes', category: 'minutes' },
  { id: 53, code: 'minutes.sign', name: 'Sign Minutes', description: 'Can digitally sign minutes', category: 'minutes' },

  // REPORTS
  { id: 60, code: 'reports.view', name: 'View Reports', description: 'Can view reports', category: 'reports' },
  { id: 61, code: 'reports.export', name: 'Export Reports', description: 'Can export reports', category: 'reports' },
  { id: 62, code: 'reports.all', name: 'View All Reports', description: 'Can view cross-board reports', category: 'reports' },

  // SETTINGS
  { id: 70, code: 'settings.view', name: 'View Settings', description: 'Can view settings', category: 'settings' },
  { id: 71, code: 'settings.edit', name: 'Edit Settings', description: 'Can edit settings', category: 'settings' },

  // ADMIN
  { id: 80, code: 'admin.access', name: 'Admin Access', description: 'Can access admin panel', category: 'admin' },
  { id: 81, code: 'admin.audit', name: 'View Audit Logs', description: 'Can view audit logs', category: 'admin' },
  { id: 82, code: 'admin.system', name: 'System Settings', description: 'Can modify system settings', category: 'admin' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get permission by code
 */
export const getPermissionByCode = (code: string): PermissionRow | undefined => {
  return permissionsTable.find(p => p.code === code);
};

/**
 * Get permission by ID
 */
export const getPermissionById = (id: number): PermissionRow | undefined => {
  return permissionsTable.find(p => p.id === id);
};

/**
 * Get all permissions for a category
 */
export const getPermissionsByCategory = (category: string): PermissionRow[] => {
  return permissionsTable.filter(p => p.category === category);
};

/**
 * Get all permission categories
 */
export const getPermissionCategories = (): string[] => {
  return [...new Set(permissionsTable.map(p => p.category))];
};
