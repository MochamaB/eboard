/**
 * Document Constants
 * Centralized lookup tables for document-related UI elements
 * 
 * @deprecated DOCUMENT_CATEGORIES - Categories are now dynamic and fetched from API
 * Use useActiveDocumentCategories() hook instead
 * This constant is kept for backward compatibility only
 */

import type {
  DocumentStatus,
  DocumentEntityType,
  DocumentAccessLevel,
} from '../types/document.types';

// ============================================================================
// DOCUMENT CATEGORY CONFIGURATION (DEPRECATED - Use API)
// ============================================================================

/**
 * @deprecated Use useActiveDocumentCategories() hook to fetch categories from API
 * Categories are now dynamic and managed in the database
 */
export interface CategoryConfig {
  value: string;
  label: string;
  color: string;
  description?: string;
}

/**
 * @deprecated Use useActiveDocumentCategories() hook instead
 * Kept for backward compatibility only
 */
export const DOCUMENT_CATEGORIES: Record<string, CategoryConfig> = {
  agenda: {
    value: 'agenda',
    label: 'Agenda',
    color: '#1890ff',
    description: 'Meeting agenda documents',
  },
  minutes: {
    value: 'minutes',
    label: 'Minutes',
    color: '#52c41a',
    description: 'Meeting minutes and records',
  },
  board_pack: {
    value: 'board_pack',
    label: 'Board Pack',
    color: '#722ed1',
    description: 'Compiled board meeting documents',
  },
  presentation: {
    value: 'presentation',
    label: 'Presentation',
    color: '#eb2f96',
    description: 'Slide decks and presentations',
  },
  report: {
    value: 'report',
    label: 'Report',
    color: '#fa8c16',
    description: 'Committee and operational reports',
  },
  policy: {
    value: 'policy',
    label: 'Policy',
    color: '#13c2c2',
    description: 'Policy documents and bylaws',
  },
  contract: {
    value: 'contract',
    label: 'Contract',
    color: '#f5222d',
    description: 'Legal contracts and agreements',
  },
  correspondence: {
    value: 'correspondence',
    label: 'Correspondence',
    color: '#2f54eb',
    description: 'Letters, memos, communications',
  },
  attachment: {
    value: 'attachment',
    label: 'Attachment',
    color: '#8c8c8c',
    description: 'General attachments',
  },
  notice: {
    value: 'notice',
    label: 'Notice',
    color: '#fadb14',
    description: 'Meeting notices and announcements',
  },
  resolution: {
    value: 'resolution',
    label: 'Resolution',
    color: '#a0d911',
    description: 'Board resolutions',
  },
  certificate: {
    value: 'certificate',
    label: 'Certificate',
    color: '#gold',
    description: 'Certificates and awards',
  },
  financial: {
    value: 'financial',
    label: 'Financial',
    color: '#13c2c2',
    description: 'Financial statements and budgets',
  },
  audit: {
    value: 'audit',
    label: 'Audit',
    color: '#eb2f96',
    description: 'Audit reports',
  },
  compliance: {
    value: 'compliance',
    label: 'Compliance',
    color: '#fa541c',
    description: 'Compliance documents',
  },
  other: {
    value: 'other',
    label: 'Other',
    color: '#d9d9d9',
    description: 'Uncategorized documents',
  },
};

// Helper arrays for dropdowns
export const DOCUMENT_CATEGORY_OPTIONS = Object.values(DOCUMENT_CATEGORIES).map(
  ({ value, label }) => ({ value, label })
);

// ============================================================================
// DOCUMENT STATUS CONFIGURATION
// ============================================================================

export interface StatusConfig {
  value: DocumentStatus;
  label: string;
  color: string;
  description?: string;
}

export const DOCUMENT_STATUSES: Record<DocumentStatus, StatusConfig> = {
  uploading: {
    value: 'uploading',
    label: 'Uploading',
    color: '#1890ff',
    description: 'Upload in progress',
  },
  processing: {
    value: 'processing',
    label: 'Processing',
    color: '#faad14',
    description: 'Being processed',
  },
  draft: {
    value: 'draft',
    label: 'Draft',
    color: '#8c8c8c',
    description: 'Uploaded but not finalized',
  },
  pending_review: {
    value: 'pending_review',
    label: 'Pending Review',
    color: '#faad14',
    description: 'Awaiting review/approval',
  },
  approved: {
    value: 'approved',
    label: 'Approved',
    color: '#52c41a',
    description: 'Approved for distribution',
  },
  published: {
    value: 'published',
    label: 'Published',
    color: '#52c41a',
    description: 'Published and visible',
  },
  archived: {
    value: 'archived',
    label: 'Archived',
    color: '#d9d9d9',
    description: 'Archived but accessible',
  },
  deleted: {
    value: 'deleted',
    label: 'Deleted',
    color: '#f5222d',
    description: 'Soft deleted',
  },
};

export const DOCUMENT_STATUS_OPTIONS = Object.values(DOCUMENT_STATUSES)
  .filter((s) => !['uploading', 'processing', 'deleted'].includes(s.value))
  .map(({ value, label }) => ({ value, label }));

// ============================================================================
// DOCUMENT ENTITY TYPE CONFIGURATION
// ============================================================================

export interface EntityTypeConfig {
  value: DocumentEntityType;
  label: string;
  description?: string;
}

export const DOCUMENT_ENTITY_TYPES: Record<DocumentEntityType, EntityTypeConfig> = {
  meeting: {
    value: 'meeting',
    label: 'Meeting',
    description: 'Meeting-level documents',
  },
  agenda_item: {
    value: 'agenda_item',
    label: 'Agenda Item',
    description: 'Documents attached to agenda items',
  },
  board: {
    value: 'board',
    label: 'Board',
    description: 'Board-level documents',
  },
  committee: {
    value: 'committee',
    label: 'Committee',
    description: 'Committee-specific documents',
  },
  user: {
    value: 'user',
    label: 'User',
    description: 'User documents',
  },
  minutes: {
    value: 'minutes',
    label: 'Minutes',
    description: 'Supporting documents for minutes',
  },
  vote: {
    value: 'vote',
    label: 'Vote',
    description: 'Vote-related documents',
  },
  resolution: {
    value: 'resolution',
    label: 'Resolution',
    description: 'Resolution documents',
  },
  action_item: {
    value: 'action_item',
    label: 'Action Item',
    description: 'Action item attachments',
  },
};

export const DOCUMENT_ENTITY_TYPE_OPTIONS = Object.values(DOCUMENT_ENTITY_TYPES).map(
  ({ value, label }) => ({ value, label })
);

// ============================================================================
// DOCUMENT ACCESS LEVEL CONFIGURATION
// ============================================================================

export interface AccessLevelConfig {
  value: DocumentAccessLevel;
  label: string;
  description?: string;
}

export const DOCUMENT_ACCESS_LEVELS: Record<DocumentAccessLevel, AccessLevelConfig> = {
  public: {
    value: 'public',
    label: 'Public',
    description: 'Anyone with link can access',
  },
  board_members: {
    value: 'board_members',
    label: 'Board Members Only',
    description: 'Only board members can access',
  },
  participants: {
    value: 'participants',
    label: 'Meeting Participants',
    description: 'Only meeting participants can access',
  },
  restricted: {
    value: 'restricted',
    label: 'Restricted',
    description: 'Only specific users can access',
  },
  confidential: {
    value: 'confidential',
    label: 'Confidential',
    description: 'Highly restricted access',
  },
};

export const DOCUMENT_ACCESS_LEVEL_OPTIONS = Object.values(DOCUMENT_ACCESS_LEVELS).map(
  ({ value, label }) => ({ value, label })
);

// ============================================================================
// FILE TYPE CONFIGURATION
// ============================================================================

export interface FileTypeConfig {
  value: string;
  label: string;
  color: string;
  category: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'media' | 'archive' | 'other';
}

export const FILE_TYPES: Record<string, FileTypeConfig> = {
  // Documents
  pdf: { value: 'pdf', label: 'PDF', color: '#f40f02', category: 'document' },
  docx: { value: 'docx', label: 'Word', color: '#2b579a', category: 'document' },
  doc: { value: 'doc', label: 'Word', color: '#2b579a', category: 'document' },
  txt: { value: 'txt', label: 'Text', color: '#666666', category: 'document' },
  rtf: { value: 'rtf', label: 'RTF', color: '#666666', category: 'document' },
  // Spreadsheets
  xlsx: { value: 'xlsx', label: 'Excel', color: '#217346', category: 'spreadsheet' },
  xls: { value: 'xls', label: 'Excel', color: '#217346', category: 'spreadsheet' },
  csv: { value: 'csv', label: 'CSV', color: '#217346', category: 'spreadsheet' },
  // Presentations
  pptx: { value: 'pptx', label: 'PowerPoint', color: '#d24726', category: 'presentation' },
  ppt: { value: 'ppt', label: 'PowerPoint', color: '#d24726', category: 'presentation' },
  // Images
  jpg: { value: 'jpg', label: 'JPEG', color: '#1890ff', category: 'image' },
  jpeg: { value: 'jpeg', label: 'JPEG', color: '#1890ff', category: 'image' },
  png: { value: 'png', label: 'PNG', color: '#1890ff', category: 'image' },
  gif: { value: 'gif', label: 'GIF', color: '#1890ff', category: 'image' },
  bmp: { value: 'bmp', label: 'BMP', color: '#1890ff', category: 'image' },
  webp: { value: 'webp', label: 'WebP', color: '#1890ff', category: 'image' },
  svg: { value: 'svg', label: 'SVG', color: '#1890ff', category: 'image' },
  tiff: { value: 'tiff', label: 'TIFF', color: '#1890ff', category: 'image' },
  // Media
  mp4: { value: 'mp4', label: 'MP4', color: '#722ed1', category: 'media' },
  mp3: { value: 'mp3', label: 'MP3', color: '#722ed1', category: 'media' },
  wav: { value: 'wav', label: 'WAV', color: '#722ed1', category: 'media' },
  avi: { value: 'avi', label: 'AVI', color: '#722ed1', category: 'media' },
  mov: { value: 'mov', label: 'MOV', color: '#722ed1', category: 'media' },
  // Archives
  zip: { value: 'zip', label: 'ZIP', color: '#faad14', category: 'archive' },
  rar: { value: 'rar', label: 'RAR', color: '#faad14', category: 'archive' },
  '7z': { value: '7z', label: '7-Zip', color: '#faad14', category: 'archive' },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get category configuration by value
 * @deprecated Use useActiveDocumentCategories() hook and find category by ID
 */
export const getCategoryConfig = (category: string): CategoryConfig => {
  return DOCUMENT_CATEGORIES[category] || DOCUMENT_CATEGORIES.other;
};

/**
 * Get status configuration by value
 */
export const getStatusConfig = (status: DocumentStatus): StatusConfig => {
  return DOCUMENT_STATUSES[status] || DOCUMENT_STATUSES.draft;
};

/**
 * Get file type configuration by extension
 */
export const getFileTypeConfig = (fileType: string): FileTypeConfig => {
  return FILE_TYPES[fileType.toLowerCase()] || {
    value: fileType,
    label: fileType.toUpperCase(),
    color: '#8c8c8c',
    category: 'other',
  };
};

/**
 * Get entity type configuration by value
 */
export const getEntityTypeConfig = (entityType: DocumentEntityType): EntityTypeConfig => {
  return DOCUMENT_ENTITY_TYPES[entityType] || DOCUMENT_ENTITY_TYPES.meeting;
};

/**
 * Get access level configuration by value
 */
export const getAccessLevelConfig = (accessLevel: DocumentAccessLevel): AccessLevelConfig => {
  return DOCUMENT_ACCESS_LEVELS[accessLevel] || DOCUMENT_ACCESS_LEVELS.board_members;
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Get MIME type from file extension
 */
export const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    // Documents
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    txt: 'text/plain',
    rtf: 'application/rtf',
    csv: 'text/csv',
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    tiff: 'image/tiff',
    // Media
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    // Archives
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};
