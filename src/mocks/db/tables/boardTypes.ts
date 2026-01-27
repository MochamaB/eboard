/**
 * Board Types Table
 * Defines the different types of boards in the system
 */

export interface BoardTypeRow {
  id: string;
  code: 'main' | 'subsidiary' | 'committee' | 'factory';
  label: string;
  description: string;
  icon: string; // Icon name for UI
  sortOrder: number;
}

export const boardTypesTable: BoardTypeRow[] = [
  {
    id: 'bt-1',
    code: 'main',
    label: 'Main Board',
    description: 'Primary organization board',
    icon: 'BankOutlined',
    sortOrder: 1,
  },
  {
    id: 'bt-2',
    code: 'subsidiary',
    label: 'Subsidiary Board',
    description: 'Subsidiary company boards',
    icon: 'BankOutlined',
    sortOrder: 2,
  },
  {
    id: 'bt-3',
    code: 'factory',
    label: 'Factory Board',
    description: 'Factory-level boards',
    icon: 'BankOutlined',
    sortOrder: 3,
  },
  {
    id: 'bt-4',
    code: 'committee',
    label: 'Committee',
    description: 'Board committees',
    icon: 'ApartmentOutlined',
    sortOrder: 4,
  },
];

// Helper function to get board type by code
export const getBoardTypeByCode = (code: string): BoardTypeRow | undefined => {
  return boardTypesTable.find(bt => bt.code === code);
};

// Helper function to get all active board types
export const getActiveBoardTypes = (): BoardTypeRow[] => {
  return boardTypesTable.sort((a, b) => a.sortOrder - b.sortOrder);
};
