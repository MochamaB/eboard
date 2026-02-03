/**
 * Document Categories API Client
 * Handles CRUD operations for document categories
 */

const API_BASE = '/api/documents/categories';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DocumentCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  isSystem: boolean;
  isActive: boolean;
  displayOrder: number;
  boardId: string | null;
  createdAt: string;
  createdBy: number | null;
  updatedAt: string;
  updatedBy: number | null;
}

export interface CreateDocumentCategoryPayload {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  displayOrder?: number;
  boardId?: string;
}

export interface UpdateDocumentCategoryPayload {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface DocumentCategoryFilter {
  boardId?: string;
  isActive?: boolean;
  includeGlobal?: boolean; // Include global categories (boardId = null)
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all document categories
 */
export async function getDocumentCategories(
  filter?: DocumentCategoryFilter
): Promise<DocumentCategory[]> {
  const params = new URLSearchParams();
  
  if (filter?.boardId) {
    params.append('boardId', filter.boardId);
  }
  if (filter?.isActive !== undefined) {
    params.append('isActive', filter.isActive.toString());
  }
  if (filter?.includeGlobal !== undefined) {
    params.append('includeGlobal', filter.includeGlobal.toString());
  }

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch document categories: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a single document category by ID
 */
export async function getDocumentCategory(id: string): Promise<DocumentCategory> {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch document category: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new document category (admin only)
 */
export async function createDocumentCategory(
  payload: CreateDocumentCategoryPayload
): Promise<DocumentCategory> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create document category: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update a document category (admin only)
 */
export async function updateDocumentCategory(
  id: string,
  payload: UpdateDocumentCategoryPayload
): Promise<DocumentCategory> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update document category: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a document category (admin only, non-system only)
 */
export async function deleteDocumentCategory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete document category: ${response.statusText}`);
  }
}

// Export as default object for consistency
export const documentCategoriesApi = {
  getDocumentCategories,
  getDocumentCategory,
  createDocumentCategory,
  updateDocumentCategory,
  deleteDocumentCategory,
};

export default documentCategoriesApi;
