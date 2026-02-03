/**
 * Document Categories API Handlers - MSW Request Handlers
 * Mock API endpoints for document category management
 */

import { http, HttpResponse } from 'msw';
import { documentCategoriesTable, type DocumentCategoryRow } from '../db/tables/documentCategories';

const API_BASE = '/api/documents/categories';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transform DocumentCategoryRow to API format
 */
const transformCategory = (row: DocumentCategoryRow) => ({
  ...row,
});

/**
 * Filter categories based on query parameters
 */
const filterCategories = (
  categories: DocumentCategoryRow[],
  params: URLSearchParams
): DocumentCategoryRow[] => {
  let filtered = [...categories];

  // Filter by boardId
  const boardId = params.get('boardId');
  const includeGlobal = params.get('includeGlobal') !== 'false'; // Default true

  if (boardId) {
    // If boardId is specified, return board-specific + global (if includeGlobal)
    filtered = filtered.filter(cat => {
      if (includeGlobal) {
        return cat.boardId === boardId || cat.boardId === null;
      }
      return cat.boardId === boardId;
    });
  } else if (includeGlobal) {
    // If no boardId specified but includeGlobal is true, return only global categories
    filtered = filtered.filter(cat => cat.boardId === null);
  }

  // Filter by isActive
  const isActive = params.get('isActive');
  if (isActive !== null) {
    filtered = filtered.filter(cat => cat.isActive === (isActive === 'true'));
  }

  // Sort by displayOrder
  filtered.sort((a, b) => a.displayOrder - b.displayOrder);

  return filtered;
};

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * GET /api/documents/categories
 * Get all document categories with optional filtering
 */
const getDocumentCategories = http.get(`${API_BASE}`, ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;

  console.log('[MSW] GET /api/documents/categories called with params:', {
    boardId: params.get('boardId'),
    isActive: params.get('isActive'),
    includeGlobal: params.get('includeGlobal'),
  });

  const filtered = filterCategories(documentCategoriesTable, params);
  console.log('[MSW] Returning', filtered.length, 'categories');
  const transformed = filtered.map(transformCategory);

  return HttpResponse.json(transformed);
});

/**
 * GET /api/documents/categories/:id
 * Get a single document category by ID
 */
const getDocumentCategory = http.get(`${API_BASE}/:id`, ({ params }) => {
  const { id } = params;
  const category = documentCategoriesTable.find(cat => cat.id === id);

  if (!category) {
    return HttpResponse.json(
      { error: 'Document category not found' },
      { status: 404 }
    );
  }

  return HttpResponse.json(transformCategory(category));
});

/**
 * POST /api/documents/categories
 * Create a new document category (admin only)
 */
const createDocumentCategory = http.post(`${API_BASE}`, async ({ request }) => {
  const body = await request.json() as any;

  // Validate required fields
  if (!body.id || !body.name || !body.color) {
    return HttpResponse.json(
      { error: 'Missing required fields: id, name, color' },
      { status: 400 }
    );
  }

  // Check if ID already exists
  if (documentCategoriesTable.find(cat => cat.id === body.id)) {
    return HttpResponse.json(
      { error: 'Category with this ID already exists' },
      { status: 409 }
    );
  }

  // Create new category
  const newCategory: DocumentCategoryRow = {
    id: body.id,
    name: body.name,
    description: body.description || null,
    color: body.color,
    icon: body.icon || null,
    isSystem: false, // User-created categories are not system categories
    isActive: true,
    displayOrder: body.displayOrder || documentCategoriesTable.length + 1,
    boardId: body.boardId || null,
    createdAt: new Date().toISOString(),
    createdBy: 1, // TODO: Get from auth context
    updatedAt: new Date().toISOString(),
    updatedBy: 1,
  };

  documentCategoriesTable.push(newCategory);

  return HttpResponse.json(transformCategory(newCategory), { status: 201 });
});

/**
 * PUT /api/documents/categories/:id
 * Update a document category (admin only)
 */
const updateDocumentCategory = http.put(`${API_BASE}/:id`, async ({ params, request }) => {
  const { id } = params;
  const body = await request.json() as any;

  const categoryIndex = documentCategoriesTable.findIndex(cat => cat.id === id);

  if (categoryIndex === -1) {
    return HttpResponse.json(
      { error: 'Document category not found' },
      { status: 404 }
    );
  }

  const category = documentCategoriesTable[categoryIndex];

  // Prevent updating system categories (except isActive)
  if (category.isSystem && Object.keys(body).some(key => key !== 'isActive')) {
    return HttpResponse.json(
      { error: 'Cannot modify system categories' },
      { status: 403 }
    );
  }

  // Update category
  const updatedCategory: DocumentCategoryRow = {
    ...category,
    name: body.name !== undefined ? body.name : category.name,
    description: body.description !== undefined ? body.description : category.description,
    color: body.color !== undefined ? body.color : category.color,
    icon: body.icon !== undefined ? body.icon : category.icon,
    displayOrder: body.displayOrder !== undefined ? body.displayOrder : category.displayOrder,
    isActive: body.isActive !== undefined ? body.isActive : category.isActive,
    updatedAt: new Date().toISOString(),
    updatedBy: 1, // TODO: Get from auth context
  };

  documentCategoriesTable[categoryIndex] = updatedCategory;

  return HttpResponse.json(transformCategory(updatedCategory));
});

/**
 * DELETE /api/documents/categories/:id
 * Delete a document category (admin only, non-system only)
 */
const deleteDocumentCategory = http.delete(`${API_BASE}/:id`, ({ params }) => {
  const { id } = params;

  const categoryIndex = documentCategoriesTable.findIndex(cat => cat.id === id);

  if (categoryIndex === -1) {
    return HttpResponse.json(
      { error: 'Document category not found' },
      { status: 404 }
    );
  }

  const category = documentCategoriesTable[categoryIndex];

  // Prevent deleting system categories
  if (category.isSystem) {
    return HttpResponse.json(
      { error: 'Cannot delete system categories' },
      { status: 403 }
    );
  }

  // Remove category
  documentCategoriesTable.splice(categoryIndex, 1);

  return HttpResponse.json({ success: true }, { status: 200 });
});

// ============================================================================
// EXPORT HANDLERS
// ============================================================================

export const documentCategoriesHandlers = [
  getDocumentCategories,
  getDocumentCategory,
  createDocumentCategory,
  updateDocumentCategory,
  deleteDocumentCategory,
];
