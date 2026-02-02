/**
 * Agenda Hierarchy Utilities
 * Functions for managing hierarchical agenda item structures
 */

import type { AgendaItem } from '../types/agenda.types';

interface Theme {
  backgroundSecondary: string;
  primaryColor: string;
  primaryLight: string;
  secondaryColor: string;
  sidebarBg: string;
  depthLevel1Bg: string;
  depthLevel2Bg: string;
  depthLevel3Bg: string;
  borderColor: string;
}

interface DepthStyles {
  backgroundColor: string;
  paddingLeft: string;
  borderLeft: string;
}

/**
 * Generate hierarchical number for an agenda item (e.g., "1", "1.1", "1.2", "2", "2.1")
 */
export function generateHierarchicalNumber(
  item: AgendaItem,
  allItems: AgendaItem[]
): string {
  // Root level item
  if (!item.parentItemId) {
    const rootItems = allItems
      .filter(i => !i.parentItemId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const index = rootItems.findIndex(i => i.id === item.id);
    return String(index + 1);
  }
  
  // Child item - get parent number and append position
  const parent = allItems.find(i => i.id === item.parentItemId);
  if (!parent) return '?';
  
  const parentNumber = generateHierarchicalNumber(parent, allItems);
  const siblings = allItems
    .filter(i => i.parentItemId === item.parentItemId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const index = siblings.findIndex(i => i.id === item.id);
  
  return `${parentNumber}.${index + 1}`;
}

/**
 * Get all direct children of an item
 */
export function getChildItems(
  parentId: string,
  allItems: AgendaItem[]
): AgendaItem[] {
  return allItems
    .filter(item => item.parentItemId === parentId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * Get all descendants of an item (recursive)
 */
export function getDescendants(
  parentId: string,
  allItems: AgendaItem[]
): AgendaItem[] {
  const children = getChildItems(parentId, allItems);
  const descendants: AgendaItem[] = [...children];
  
  children.forEach(child => {
    descendants.push(...getDescendants(child.id, allItems));
  });
  
  return descendants;
}

/**
 * Calculate depth level of an item (0 = root, 1 = first level child, etc.)
 */
export function getItemDepth(
  item: AgendaItem,
  allItems: AgendaItem[]
): number {
  if (!item.parentItemId) return 0;
  
  const parent = allItems.find(i => i.id === item.parentItemId);
  if (!parent) return 0;
  
  return 1 + getItemDepth(parent, allItems);
}

/**
 * Check if an item has children
 */
export function hasChildren(
  itemId: string,
  allItems: AgendaItem[]
): boolean {
  return allItems.some(item => item.parentItemId === itemId);
}

/**
 * Check if moving an item would create a circular reference
 */
export function canMoveItem(
  itemId: string,
  newParentId: string | null,
  allItems: AgendaItem[]
): boolean {
  // Moving to root is always OK
  if (!newParentId) return true;
  
  // Can't move item to itself
  if (itemId === newParentId) return false;
  
  // Check if newParent is a descendant of item (would create circular reference)
  const descendants = getDescendants(itemId, allItems);
  return !descendants.some(d => d.id === newParentId);
}

/**
 * Get background color based on depth level
 */
export function getDepthBackgroundColor(
  depth: number,
  theme: any
): string {
  const colors = [
    '#ffffff',                    // Level 0 (root)
    theme.backgroundSecondary,    // Level 1
    theme.backgroundTertiary,     // Level 2
    '#f5f5f5',                    // Level 3+
  ];
  return colors[Math.min(depth, colors.length - 1)];
}

/**
 * Get indentation padding based on depth
 */
export function getDepthIndentation(depth: number): number {
  return depth * 40; // 40px per level
}

/**
 * Build a tree structure from flat array of items
 */
export interface TreeNode {
  item: AgendaItem;
  children: TreeNode[];
  depth: number;
  hierarchicalNumber: string;
}

export function buildItemTree(
  items: AgendaItem[],
  parentId: string | null = null,
  depth: number = 0
): TreeNode[] {
  const children = items
    .filter(item => item.parentItemId === parentId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  
  return children.map(item => ({
    item,
    children: buildItemTree(items, item.id, depth + 1),
    depth,
    hierarchicalNumber: generateHierarchicalNumber(item, items),
  }));
}

/**
 * Flatten tree structure back to array with updated orderIndex
 */
export function flattenItemTree(tree: TreeNode[]): AgendaItem[] {
  const flattened: AgendaItem[] = [];
  let orderIndex = 0;
  
  function traverse(nodes: TreeNode[]) {
    nodes.forEach(node => {
      flattened.push({
        ...node.item,
        orderIndex: orderIndex++,
      });
      traverse(node.children);
    });
  }
  
  traverse(tree);
  return flattened;
}

/**
 * Get parent item
 */
export function getParentItem(
  item: AgendaItem,
  allItems: AgendaItem[]
): AgendaItem | null {
  if (!item.parentItemId) return null;
  return allItems.find(i => i.id === item.parentItemId) || null;
}

/**
 * Get breadcrumb path for an item (e.g., ["1", "1.2", "1.2.3"])
 */
export function getItemBreadcrumb(
  item: AgendaItem,
  allItems: AgendaItem[]
): string[] {
  const breadcrumb: string[] = [];
  let current: AgendaItem | null = item;
  
  while (current) {
    breadcrumb.unshift(generateHierarchicalNumber(current, allItems));
    current = getParentItem(current, allItems);
  }
  
  return breadcrumb;
}

/**
 * Calculate total duration including all descendants
 */
export function getTotalDurationWithChildren(
  itemId: string,
  allItems: AgendaItem[]
): number {
  const item = allItems.find(i => i.id === itemId);
  if (!item) return 0;
  
  const descendants = getDescendants(itemId, allItems);
  const childrenDuration = descendants.reduce(
    (sum, child) => sum + child.estimatedDuration,
    0
  );
  
  return item.estimatedDuration + childrenDuration;
}

/**
 * Get all root items (items without parent)
 */
export function getRootItems(allItems: AgendaItem[]): AgendaItem[] {
  return allItems
    .filter(item => !item.parentItemId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * Get siblings of an item (items with same parent)
 */
export function getSiblings(
  item: AgendaItem,
  allItems: AgendaItem[]
): AgendaItem[] {
  return allItems
    .filter(i => i.parentItemId === item.parentItemId && i.id !== item.id)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * Check if item is first child
 */
export function isFirstChild(
  item: AgendaItem,
  allItems: AgendaItem[]
): boolean {
  const siblings = allItems
    .filter(i => i.parentItemId === item.parentItemId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  return siblings[0]?.id === item.id;
}

/**
 * Get depth-based styling for nested agenda items
 * Uses theme colors to create visual hierarchy
 */
export function getDepthStyles(depth: number, theme: Theme): DepthStyles {
  const baseIndent = 16;
  const indentPerLevel = 24;
  
  const depthConfig = {
    0: {
      background: theme.primaryLight, // Subtle primary color for root items
      border: theme.primaryColor,
      borderWidth: 4,
    },
    1: {
      background: 'rgba(255, 175, 0, 0.12)', // Secondary color (yellow) with transparency
      border: theme.secondaryColor,
      borderWidth: 3,
    },
    2: {
      background: theme.depthLevel2Bg, // Lighter shade
      border: theme.primaryColor,
      borderWidth: 2,
    },
    3: {
      // Fallback for deeper levels
      background: theme.depthLevel3Bg,
      border: theme.borderColor,
      borderWidth: 1,
    },
  };
  
  const config = depthConfig[Math.min(depth, 3) as keyof typeof depthConfig];
  
  return {
    backgroundColor: config.background,
    paddingLeft: `${baseIndent + (depth * indentPerLevel)}px`,
    borderLeft: config.borderWidth > 0 
      ? `${config.borderWidth}px solid ${config.border}` 
      : 'none',
  };
}

/**
 * Check if item is last child
 */
export function isLastChild(
  item: AgendaItem,
  allItems: AgendaItem[]
): boolean {
  const siblings = allItems
    .filter(i => i.parentItemId === item.parentItemId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  return siblings[siblings.length - 1]?.id === item.id;
}
