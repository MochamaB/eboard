/**
 * Document Management Types
 * Comprehensive types for document/media management with polymorphic relationships
 * Based on docs/MODULES/Module05_DocumentManagement/05_OVERVIEW.md
 */

import { z } from 'zod';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Entity types that can have documents attached (polymorphic relationship)
 * This enables documents to be linked to any entity in the system
 */
export const DocumentEntityTypeSchema = z.enum([
  'meeting',        // Meeting-level documents (board packs, notices)
  'agenda_item',    // Documents attached to specific agenda items
  'board',          // Board-level documents (policies, governance)
  'committee',      // Committee-specific documents
  'user',           // User documents (profile, certificates)
  'minutes',        // Supporting documents for minutes
  'vote',           // Vote-related documents
  'resolution',     // Resolution documents
  'action_item',    // Action item attachments
]);

/**
 * Document categories for organization and filtering
 * Now dynamic - fetched from API instead of hardcoded enum
 * Kept as z.string() for validation, actual categories managed in database
 */
export const DocumentCategorySchema = z.string();

/**
 * Supported file types
 */
export const FileTypeSchema = z.enum([
  // Documents
  'pdf',
  'docx',
  'doc',
  'xlsx',
  'xls',
  'pptx',
  'ppt',
  'txt',
  'rtf',
  'csv',
  // Images
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'webp',
  'svg',
  'tiff',
  // Media
  'mp4',
  'mp3',
  'wav',
  'avi',
  'mov',
  // Archives
  'zip',
  'rar',
  '7z',
]);

/**
 * Document status for workflow management
 */
export const DocumentStatusSchema = z.enum([
  'uploading',        // Upload in progress
  'processing',       // Being processed (virus scan, thumbnail generation)
  'draft',            // Uploaded but not finalized
  'pending_review',   // Awaiting review/approval
  'approved',         // Approved for distribution
  'published',        // Published and visible to authorized users
  'archived',         // Archived (still accessible but not active)
  'deleted',          // Soft deleted
]);

/**
 * Access level for document security
 */
export const DocumentAccessLevelSchema = z.enum([
  'public',           // Anyone with link can access
  'board_members',    // Only board members can access
  'participants',     // Only meeting participants can access
  'restricted',       // Only specific users can access
  'confidential',     // Highly restricted, requires additional auth
]);

/**
 * Document source - how the document was created
 */
export const DocumentSourceSchema = z.enum([
  'upload',           // Manually uploaded
  'generated',        // System generated (e.g., agenda PDF)
  'imported',         // Imported from external system
  'scanned',          // Scanned document
  'signed',           // Digitally signed version
]);

// ============================================================================
// MIME TYPE MAPPING
// ============================================================================

export const MIME_TYPE_MAP: Record<string, string> = {
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

// File extension to category suggestions
export const FILE_CATEGORY_SUGGESTIONS: Record<string, z.infer<typeof DocumentCategorySchema>> = {
  pdf: 'attachment',
  docx: 'attachment',
  doc: 'attachment',
  xlsx: 'financial',
  xls: 'financial',
  pptx: 'presentation',
  ppt: 'presentation',
};

// ============================================================================
// DOCUMENT SCHEMA (LEAN)
// ============================================================================

/**
 * Main Document schema - LEAN version
 * 
 * This schema contains ONLY core document metadata.
 * Related data is stored in separate schemas/tables:
 * - DocumentAttachmentSchema - Links documents to entities
 * - DocumentVersionSchema - Version history
 * - DocumentSignatureSchema - Digital signatures
 * - DocumentAccessLogSchema - View/download tracking
 * - DocumentPermissionSchema - Access control
 * - DocumentTagSchema - Tags
 */
export const DocumentSchema = z.object({
  id: z.string(),

  // ---- Identity ----
  name: z.string().min(1).max(255),           // Display name
  description: z.string().max(1000).nullable().optional(),

  // ---- File Metadata (immutable after upload) ----
  fileName: z.string(),                        // Original filename with extension
  fileExtension: z.string(),                   // e.g., 'pdf', 'docx'
  fileType: FileTypeSchema,
  mimeType: z.string(),
  fileSize: z.number(),                        // Size in bytes
  pageCount: z.number().nullable().optional(), // For PDFs and documents

  // ---- Storage (immutable) ----
  storageProvider: z.enum(['local', 'azure', 's3', 'gcs']).default('local'),
  storageKey: z.string(),                      // Cloud storage key/path
  storageBucket: z.string().nullable().optional(),
  url: z.string(),                             // Download/view URL
  thumbnailUrl: z.string().nullable().optional(), // Preview thumbnail

  // ---- Organization ----
  categoryId: z.string(),                      // FK to document_categories
  boardId: z.string().nullable().optional(),   // Which board owns this document

  // ---- Upload Information ----
  uploadedBy: z.number(),                      // User ID
  uploadedByName: z.string(),
  uploadedAt: z.string(),                      // ISO datetime
  source: DocumentSourceSchema.default('upload'),

  // ---- Status ----
  status: DocumentStatusSchema.default('published'),

  // ---- Security Features ----
  watermarkEnabled: z.boolean().default(false),

  // ---- Timestamps ----
  createdAt: z.string(),
  updatedAt: z.string(),

  // ---- Computed/Virtual Fields (populated by API joins) ----
  // These are computed from related tables, not stored in documents table
  boardName: z.string().nullable().optional(), // Computed from boards table
  isSigned: z.boolean().optional(),            // Computed from document_signatures
  isConfidential: z.boolean().optional(),      // Computed from document_permissions
  signatureCount: z.number().optional(),       // Computed from document_signatures
  versionCount: z.number().optional(),         // Computed from document_versions
  attachmentCount: z.number().optional(),      // Computed from document_attachments
  viewCount: z.number().optional(),            // Computed from document_access_logs
  downloadCount: z.number().optional(),        // Computed from document_access_logs
  category: DocumentCategorySchema.optional(), // Joined from document_categories
});

// ============================================================================
// DOCUMENT ATTACHMENT SCHEMA (Polymorphic Junction)
// ============================================================================

/**
 * Document Attachment - Links documents to any entity (polymorphic)
 * This is the junction table that enables many-to-many relationships
 * between documents and various entity types
 */
export const DocumentAttachmentSchema = z.object({
  id: z.string(),
  documentId: z.string(),

  // ---- Polymorphic Reference ----
  entityType: DocumentEntityTypeSchema,
  entityId: z.string(),

  // ---- Attachment Metadata ----
  attachedBy: z.number(),                      // User ID who attached
  attachedByName: z.string(),
  attachedAt: z.string(),                      // ISO datetime

  // ---- Context ----
  isPrimary: z.boolean().default(false),       // Is this the main document for the entity?
  displayOrder: z.number().default(0),         // Ordering when multiple docs attached
  notes: z.string().optional(),                // Why this doc was attached

  // ---- Visibility Override ----
  visibleToGuests: z.boolean().default(false), // Override for guest visibility
});

// ============================================================================
// DOCUMENT VERSION SCHEMA
// ============================================================================

/**
 * Document Version - Tracks version history
 */
export const DocumentVersionSchema = z.object({
  id: z.string(),
  documentId: z.string(),                      // Parent document ID
  version: z.number(),

  // ---- File Info for this Version ----
  fileName: z.string(),
  fileSize: z.number(),
  storageKey: z.string(),
  url: z.string(),

  // ---- Version Metadata ----
  uploadedBy: z.number(),
  uploadedByName: z.string(),
  uploadedAt: z.string(),
  changeNotes: z.string().optional(),          // What changed in this version

  // ---- Status ----
  isLatest: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

// ============================================================================
// DOCUMENT TAG SCHEMA
// ============================================================================

/**
 * Document Tag - For categorization and search
 */
export const DocumentTagSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  slug: z.string(),                            // URL-friendly version
  color: z.string().nullable().optional(),     // Hex color for UI
  description: z.string().nullable().optional(),

  // ---- Scope ----
  boardId: z.string().nullable().optional(),   // Board-specific tag (null = global)
  isSystem: z.boolean().default(false),        // System-defined vs user-created

  // ---- Metadata ----
  createdAt: z.string(),
  createdBy: z.number().nullable().optional(),
});

// ============================================================================
// DOCUMENT SIGNATURE SCHEMA
// ============================================================================

/**
 * Document Signature - Digital signatures on documents
 */
export const DocumentSignatureSchema = z.object({
  id: z.string(),
  documentId: z.string(),

  // ---- Signer Information ----
  signedBy: z.number(),
  signedByName: z.string(),
  signedAt: z.string(),

  // ---- Signature Details ----
  signatureMethod: z.enum(['digital', 'electronic', 'wet']),
  signatureData: z.string().nullable().optional(),  // Hash or certificate reference
  certificateId: z.string().nullable().optional(),

  // ---- Validation ----
  isValid: z.boolean().default(true),
  validatedAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

// ============================================================================
// DOCUMENT ACCESS LOG SCHEMA
// ============================================================================

/**
 * Document Access Log - Tracks document views, downloads, prints, shares
 */
export const DocumentAccessLogSchema = z.object({
  id: z.string(),
  documentId: z.string(),

  // ---- User Information ----
  userId: z.number(),
  userName: z.string(),

  // ---- Action ----
  action: z.enum(['view', 'download', 'print', 'share']),

  // ---- Context ----
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  accessedAt: z.string(),
});

// ============================================================================
// DOCUMENT PERMISSION SCHEMA
// ============================================================================

/**
 * Document Permission - Access control for documents
 * Used for meeting execution and granular access control
 */
export const DocumentPermissionSchema = z.object({
  id: z.string(),
  documentId: z.string(),

  // ---- Grantee ----
  granteeType: z.enum(['user', 'role', 'board', 'committee', 'meeting']),
  granteeId: z.string(),

  // ---- Permissions ----
  canView: z.boolean().default(true),
  canDownload: z.boolean().default(true),
  canPrint: z.boolean().default(true),
  canShare: z.boolean().default(false),
  canPresent: z.boolean().default(false),  // For meeting execution - can cast to screen

  // ---- Time-bound Access ----
  expiresAt: z.string().nullable().optional(),

  // ---- Metadata ----
  grantedBy: z.number(),
  grantedByName: z.string(),
  grantedAt: z.string(),
});

// ============================================================================
// DOCUMENT ACTIVITY/AUDIT LOG SCHEMA
// ============================================================================

/**
 * Document Activity - Audit trail for document actions
 */
export const DocumentActivitySchema = z.object({
  id: z.string(),
  documentId: z.string(),

  // ---- Action ----
  action: z.enum([
    'created',
    'uploaded',
    'viewed',
    'downloaded',
    'updated',
    'version_added',
    'attached',
    'detached',
    'shared',
    'signed',
    'archived',
    'restored',
    'deleted',
    'access_changed',
  ]),

  // ---- Actor ----
  performedBy: z.number(),
  performedByName: z.string(),
  performedAt: z.string(),

  // ---- Details ----
  details: z.record(z.string(), z.unknown()).optional(),   // Action-specific details
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),

  // ---- Related Entity (if action involves attachment) ----
  entityType: DocumentEntityTypeSchema.optional(),
  entityId: z.string().optional(),
});

// ============================================================================
// API PAYLOAD SCHEMAS
// ============================================================================

/**
 * Upload Document Payload
 */
export const UploadDocumentPayloadSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  category: DocumentCategorySchema,
  boardId: z.string().nullable().optional(), // Nullable for non-board documents

  // File will be sent as FormData, these are metadata
  tags: z.array(z.string()).optional(),
  accessLevel: DocumentAccessLevelSchema.optional(),
  isConfidential: z.boolean().optional(),
  watermarkEnabled: z.boolean().optional(),
});

/**
 * Update Document Payload
 */
export const UpdateDocumentPayloadSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  category: DocumentCategorySchema.optional(),
  tags: z.array(z.string()).optional(),
  accessLevel: DocumentAccessLevelSchema.optional(),
  isConfidential: z.boolean().optional(),
  status: DocumentStatusSchema.optional(),
});

/**
 * Attach Document Payload
 */
export const AttachDocumentPayloadSchema = z.object({
  documentId: z.string(),
  entityType: DocumentEntityTypeSchema,
  entityId: z.string(),
  isPrimary: z.boolean().optional(),
  displayOrder: z.number().optional(),
  notes: z.string().optional(),
  visibleToGuests: z.boolean().optional(),
});

/**
 * Document Filter/Query Parameters
 */
export const DocumentFilterSchema = z.object({
  boardId: z.string().optional(),
  category: DocumentCategorySchema.optional(),
  categories: z.array(DocumentCategorySchema).optional(),
  status: z.union([DocumentStatusSchema, z.array(DocumentStatusSchema)]).optional(),
  accessLevel: DocumentAccessLevelSchema.optional(),
  tags: z.array(z.string()).optional(),
  uploadedBy: z.number().optional(),
  search: z.string().optional(),               // Full-text search
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  entityType: DocumentEntityTypeSchema.optional(),
  entityId: z.string().optional(),

  // Pagination
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'fileSize', 'category']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type DocumentEntityType = z.infer<typeof DocumentEntityTypeSchema>;
export type DocumentCategory = z.infer<typeof DocumentCategorySchema>;
export type FileType = z.infer<typeof FileTypeSchema>;
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;
export type DocumentAccessLevel = z.infer<typeof DocumentAccessLevelSchema>;
export type DocumentSource = z.infer<typeof DocumentSourceSchema>;

export type Document = z.infer<typeof DocumentSchema>;
export type DocumentAttachment = z.infer<typeof DocumentAttachmentSchema>;
export type DocumentVersion = z.infer<typeof DocumentVersionSchema>;
export type DocumentTag = z.infer<typeof DocumentTagSchema>;
export type DocumentSignature = z.infer<typeof DocumentSignatureSchema>;
export type DocumentAccessLog = z.infer<typeof DocumentAccessLogSchema>;
export type DocumentPermission = z.infer<typeof DocumentPermissionSchema>;
export type DocumentActivity = z.infer<typeof DocumentActivitySchema>;

export type UploadDocumentPayload = z.infer<typeof UploadDocumentPayloadSchema>;
export type UpdateDocumentPayload = z.infer<typeof UpdateDocumentPayloadSchema>;
export type AttachDocumentPayload = z.infer<typeof AttachDocumentPayloadSchema>;
export type DocumentFilter = z.infer<typeof DocumentFilterSchema>;

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Document with its attachments populated
 */
export type DocumentWithAttachments = Document & {
  attachments: DocumentAttachment[];
};

/**
 * Document with version history
 */
export type DocumentWithVersions = Document & {
  versions: DocumentVersion[];
};

/**
 * Document with signatures
 */
export type DocumentWithSignatures = Document & {
  signatures: DocumentSignature[];
};

/**
 * Full document with all relations
 */
export type DocumentFull = Document & {
  attachments: DocumentAttachment[];
  versions: DocumentVersion[];
  signatures: DocumentSignature[];
  tags: DocumentTag[];
  permissions: DocumentPermission[];
  recentActivity: DocumentActivity[];
};

/**
 * Lightweight document for lists - includes essential display fields
 */
export type DocumentSummary = Pick<
  Document,
  | 'id'
  | 'name'
  | 'categoryId'
  | 'category'
  | 'fileType'
  | 'fileExtension'
  | 'fileSize'
  | 'url'
  | 'thumbnailUrl'
  | 'uploadedByName'
  | 'uploadedAt'
  | 'status'
  | 'isSigned'
  | 'isConfidential'
  | 'watermarkEnabled'
>;

/**
 * Document attachment with document details populated
 */
export type AttachmentWithDocument = DocumentAttachment & {
  document: DocumentSummary;
};
