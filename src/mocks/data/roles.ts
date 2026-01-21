/**
 * Mock Roles Data
 * Based on documented system roles from 02_REQUIREMENTS_DOCUMENT.md
 */

import type { Role, Permission } from '../../types';

// System permissions (based on documented module access)
export const mockPermissions: Permission[] = [
  // Users
  { id: 1, code: 'users.view', name: 'View Users', description: 'Can view user list and profiles', category: 'users' },
  { id: 2, code: 'users.create', name: 'Create Users', description: 'Can create new users', category: 'users' },
  { id: 3, code: 'users.edit', name: 'Edit Users', description: 'Can edit user profiles', category: 'users' },
  { id: 4, code: 'users.delete', name: 'Delete Users', description: 'Can deactivate users', category: 'users' },
  { id: 5, code: 'users.bulk', name: 'Bulk User Actions', description: 'Can perform bulk actions on users', category: 'users' },
  
  // Boards
  { id: 10, code: 'boards.view', name: 'View Boards', description: 'Can view board list', category: 'boards' },
  { id: 11, code: 'boards.create', name: 'Create Boards', description: 'Can create new boards', category: 'boards' },
  { id: 12, code: 'boards.edit', name: 'Edit Boards', description: 'Can edit board settings', category: 'boards' },
  { id: 13, code: 'boards.members', name: 'Manage Board Members', description: 'Can add/remove board members', category: 'boards' },
  
  // Meetings
  { id: 20, code: 'meetings.view', name: 'View Meetings', description: 'Can view meeting list', category: 'meetings' },
  { id: 21, code: 'meetings.create', name: 'Create Meetings', description: 'Can schedule meetings', category: 'meetings' },
  { id: 22, code: 'meetings.edit', name: 'Edit Meetings', description: 'Can edit meeting details', category: 'meetings' },
  { id: 23, code: 'meetings.cancel', name: 'Cancel Meetings', description: 'Can cancel meetings', category: 'meetings' },
  { id: 24, code: 'meetings.control', name: 'Control Meetings', description: 'Can start/end meetings', category: 'meetings' },
  
  // Documents
  { id: 30, code: 'documents.view', name: 'View Documents', description: 'Can view documents', category: 'documents' },
  { id: 31, code: 'documents.upload', name: 'Upload Documents', description: 'Can upload documents', category: 'documents' },
  { id: 32, code: 'documents.delete', name: 'Delete Documents', description: 'Can delete documents', category: 'documents' },
  { id: 33, code: 'documents.download', name: 'Download Documents', description: 'Can download documents', category: 'documents' },
  
  // Voting
  { id: 40, code: 'voting.view', name: 'View Votes', description: 'Can view voting results', category: 'voting' },
  { id: 41, code: 'voting.create', name: 'Create Votes', description: 'Can create voting items', category: 'voting' },
  { id: 42, code: 'voting.cast', name: 'Cast Vote', description: 'Can cast votes', category: 'voting' },
  { id: 43, code: 'voting.start', name: 'Start Voting', description: 'Can start/stop voting', category: 'voting' },
  
  // Minutes
  { id: 50, code: 'minutes.view', name: 'View Minutes', description: 'Can view meeting minutes', category: 'minutes' },
  { id: 51, code: 'minutes.create', name: 'Create Minutes', description: 'Can create minutes', category: 'minutes' },
  { id: 52, code: 'minutes.approve', name: 'Approve Minutes', description: 'Can approve minutes', category: 'minutes' },
  { id: 53, code: 'minutes.sign', name: 'Sign Minutes', description: 'Can digitally sign minutes', category: 'minutes' },
  
  // Reports
  { id: 60, code: 'reports.view', name: 'View Reports', description: 'Can view reports', category: 'reports' },
  { id: 61, code: 'reports.export', name: 'Export Reports', description: 'Can export reports', category: 'reports' },
  { id: 62, code: 'reports.all', name: 'View All Reports', description: 'Can view cross-board reports', category: 'reports' },
  
  // Settings
  { id: 70, code: 'settings.view', name: 'View Settings', description: 'Can view settings', category: 'settings' },
  { id: 71, code: 'settings.edit', name: 'Edit Settings', description: 'Can edit settings', category: 'settings' },
  
  // Admin
  { id: 80, code: 'admin.access', name: 'Admin Access', description: 'Can access admin panel', category: 'admin' },
  { id: 81, code: 'admin.audit', name: 'View Audit Logs', description: 'Can view audit logs', category: 'admin' },
  { id: 82, code: 'admin.system', name: 'System Settings', description: 'Can modify system settings', category: 'admin' },
];

// System roles (from docs - these cannot be deleted)
export const mockRoles: Role[] = [
  {
    id: 1,
    code: 'system_admin',
    name: 'System Administrator',
    description: 'Full system access across all boards and committees',
    isSystem: true,
    permissions: mockPermissions, // All permissions
    userCount: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    code: 'board_secretary',
    name: 'Board Secretary',
    description: 'Can create meetings, upload documents, manage participants for their board(s)/committee(s)',
    isSystem: true,
    permissions: mockPermissions.filter(p => 
      ['users.view', 'boards.view', 'boards.members', 'meetings.view', 'meetings.create', 'meetings.edit', 
       'documents.view', 'documents.upload', 'documents.delete', 'documents.download',
       'voting.view', 'voting.create', 'minutes.view', 'minutes.create', 'reports.view', 'reports.export',
       'settings.view'].includes(p.code)
    ),
    userCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    code: 'chairman',
    name: 'Chairman',
    description: 'Can control meetings, start votes, approve minutes (Main Board Chairman sees all boards)',
    isSystem: true,
    permissions: mockPermissions.filter(p => 
      ['users.view', 'boards.view', 'meetings.view', 'meetings.control',
       'documents.view', 'documents.download', 'voting.view', 'voting.cast', 'voting.start',
       'minutes.view', 'minutes.approve', 'minutes.sign', 'reports.view', 'reports.export', 'reports.all',
       'settings.view'].includes(p.code)
    ),
    userCount: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    code: 'vice_chairman',
    name: 'Vice Chairman',
    description: 'Similar to Chairman but for specific board/committee',
    isSystem: true,
    permissions: mockPermissions.filter(p => 
      ['users.view', 'boards.view', 'meetings.view', 'meetings.control',
       'documents.view', 'documents.download', 'voting.view', 'voting.cast', 'voting.start',
       'minutes.view', 'minutes.approve', 'reports.view', 'reports.export',
       'settings.view'].includes(p.code)
    ),
    userCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 5,
    code: 'board_member',
    name: 'Board Member',
    description: 'Can join meetings, vote, view documents for their board(s)',
    isSystem: true,
    permissions: mockPermissions.filter(p => 
      ['meetings.view', 'documents.view', 'documents.download', 
       'voting.view', 'voting.cast', 'minutes.view', 'reports.view',
       'settings.view'].includes(p.code)
    ),
    userCount: 150,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 6,
    code: 'committee_member',
    name: 'Committee Member',
    description: 'Can join committee meetings, vote, view committee documents',
    isSystem: true,
    permissions: mockPermissions.filter(p => 
      ['meetings.view', 'documents.view', 'documents.download', 
       'voting.view', 'voting.cast', 'minutes.view',
       'settings.view'].includes(p.code)
    ),
    userCount: 45,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 7,
    code: 'executive_member',
    name: 'Executive Member',
    description: 'CEO, Company Secretary, Group Finance Director - special status',
    isSystem: true,
    permissions: mockPermissions.filter(p => 
      ['users.view', 'boards.view', 'meetings.view', 'meetings.control',
       'documents.view', 'documents.upload', 'documents.download',
       'voting.view', 'voting.cast', 'minutes.view', 'minutes.create', 'minutes.approve', 'minutes.sign',
       'reports.view', 'reports.export', 'reports.all', 'settings.view'].includes(p.code)
    ),
    userCount: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 8,
    code: 'observer',
    name: 'Observer',
    description: 'Can view meetings but cannot vote',
    isSystem: true,
    permissions: mockPermissions.filter(p => 
      ['meetings.view', 'documents.view', 'voting.view', 'minutes.view',
       'settings.view'].includes(p.code)
    ),
    userCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 9,
    code: 'guest',
    name: 'Guest/Presenter',
    description: 'Temporary access to specific meeting only',
    isSystem: true,
    permissions: mockPermissions.filter(p => 
      ['meetings.view', 'documents.view'].includes(p.code)
    ),
    userCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export default mockRoles;
