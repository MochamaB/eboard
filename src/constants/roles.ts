/**
 * Role Constants
 * System role definitions with labels, colors, and descriptions
 */

export const SYSTEM_ROLE_INFO = {
  system_admin: {
    label: 'System Administrator',
    description: 'Full system access, manages all organizations and users',
    color: '#722ed1',
  },
  board_secretary: {
    label: 'Board Secretary',
    description: 'Manages board meetings, minutes, and documentation',
    color: '#1890ff',
  },
  chairman: {
    label: 'Chairman',
    description: 'Leads board meetings and decision-making',
    color: '#fa8c16',
  },
  vice_chairman: {
    label: 'Vice Chairman',
    description: 'Supports chairman and acts in their absence',
    color: '#faad14',
  },
  board_member: {
    label: 'Board Member',
    description: 'Participates in board decisions and votes',
    color: '#13c2c2',
  },
  committee_member: {
    label: 'Committee Member',
    description: 'Member of board committees',
    color: '#52c41a',
  },
  executive_member: {
    label: 'Executive Member',
    description: 'Executive management team member',
    color: '#2f54eb',
  },
  observer: {
    label: 'Observer',
    description: 'Can view meetings but cannot vote',
    color: '#8c8c8c',
  },
  guest: {
    label: 'Guest',
    description: 'Limited access, invited to specific meetings',
    color: '#d9d9d9',
  },
} as const;

export const BOARD_ROLE_INFO = {
  chairman: {
    label: 'Chairman',
    description: 'Leads the board',
    color: '#fa8c16',
  },
  vice_chairman: {
    label: 'Vice Chairman',
    description: 'Deputy to chairman',
    color: '#faad14',
  },
  secretary: {
    label: 'Secretary',
    description: 'Records and manages documentation',
    color: '#1890ff',
  },
  member: {
    label: 'Member',
    description: 'Board member with voting rights',
    color: '#13c2c2',
  },
  observer: {
    label: 'Observer',
    description: 'Non-voting participant',
    color: '#8c8c8c',
  },
} as const;
