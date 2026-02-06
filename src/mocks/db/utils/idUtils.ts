/**
 * ID Utilities for Mock Data
 * Provides case-insensitive ID comparison for mock data consistency
 */

/**
 * Normalize ID to lowercase for case-insensitive comparison
 * This handles the inconsistency between uppercase (MTG-001) and lowercase (mtg-001) IDs in mock data
 *
 * Note: This is only needed for mock data. Real backend IDs will be:
 * - Integers: 1, 2, 3
 * - UUIDs: 550e8400-e29b-41d4-a716-446655440000
 * - ObjectIds: 507f1f77bcf86cd799439011
 */
export const normalizeId = (id: string | number): string => {
  return String(id).toLowerCase();
};

/**
 * Case-insensitive ID comparison
 */
export const idsMatch = (id1: string | number, id2: string | number): boolean => {
  return normalizeId(id1) === normalizeId(id2);
};

/**
 * Filter array by case-insensitive ID match
 */
export const filterByIdMatch = <T extends { id?: string | number }>(
  items: T[],
  targetId: string | number,
  idField: keyof T = 'id' as keyof T
): T[] => {
  const normalized = normalizeId(targetId);
  return items.filter(item => {
    const itemId = item[idField];
    return itemId && normalizeId(itemId as string | number) === normalized;
  });
};

/**
 * Find item by case-insensitive ID match
 */
export const findByIdMatch = <T extends { id?: string | number }>(
  items: T[],
  targetId: string | number,
  idField: keyof T = 'id' as keyof T
): T | undefined => {
  const normalized = normalizeId(targetId);
  return items.find(item => {
    const itemId = item[idField];
    return itemId && normalizeId(itemId as string | number) === normalized;
  });
};
