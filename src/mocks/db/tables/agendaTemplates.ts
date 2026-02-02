/**
 * Agenda Templates Table - Database-like structure
 * Stores reusable agenda templates for different board types
 */

export type BoardType = 'main' | 'subsidiary' | 'factory' | 'committee' | 'all';
export type AgendaItemType = 'discussion' | 'decision' | 'information' | 'committee_report';

export interface AgendaTemplateItemData {
  orderIndex: number;
  parentItemId: string | null;
  title: string;
  description?: string;
  itemType: AgendaItemType;
  estimatedDuration: number;
}

export interface AgendaTemplateRow {
  id: string;
  name: string;
  description: string | null;
  boardType: BoardType;
  items: string; // JSON array of AgendaTemplateItemData
  createdBy: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  isGlobal: boolean;
}

// ============================================================================
// AGENDA TEMPLATES TABLE DATA
// ============================================================================

export const agendaTemplatesTable: AgendaTemplateRow[] = [
  // ========================================================================
  // GLOBAL TEMPLATES
  // ========================================================================
  {
    id: 'template-standard-board',
    name: 'Standard Board Meeting',
    description: 'Default agenda template for regular board meetings',
    boardType: 'all',
    items: JSON.stringify([
      {
        orderIndex: 1,
        parentItemId: null,
        title: 'Call to Order',
        description: 'Meeting formally opened by the Chairman',
        itemType: 'information',
        estimatedDuration: 5,
      },
      {
        orderIndex: 2,
        parentItemId: null,
        title: 'Approval of Previous Minutes',
        description: 'Review and approval of minutes from the last meeting',
        itemType: 'decision',
        estimatedDuration: 10,
      },
      {
        orderIndex: 3,
        parentItemId: null,
        title: 'Financial Report',
        description: 'Financial performance and budget review',
        itemType: 'committee_report',
        estimatedDuration: 20,
      },
      {
        orderIndex: 4,
        parentItemId: null,
        title: 'CEO Update',
        description: 'Executive report on operations and strategic initiatives',
        itemType: 'information',
        estimatedDuration: 15,
      },
      {
        orderIndex: 5,
        parentItemId: null,
        title: 'New Business',
        description: 'Discussion of new business items',
        itemType: 'discussion',
        estimatedDuration: 30,
      },
      {
        orderIndex: 6,
        parentItemId: null,
        title: 'Any Other Business',
        description: 'Other matters arising',
        itemType: 'discussion',
        estimatedDuration: 15,
      },
      {
        orderIndex: 7,
        parentItemId: null,
        title: 'Adjournment',
        description: 'Formal closure of the meeting',
        itemType: 'information',
        estimatedDuration: 5,
      },
    ] as AgendaTemplateItemData[]),
    createdBy: 1,
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGlobal: true,
  },

  {
    id: 'template-quarterly-board',
    name: 'Quarterly Board Meeting',
    description: 'Template for quarterly board meetings with performance reviews',
    boardType: 'main',
    items: JSON.stringify([
      {
        orderIndex: 1,
        parentItemId: null,
        title: 'Call to Order',
        itemType: 'information',
        estimatedDuration: 5,
      },
      {
        orderIndex: 2,
        parentItemId: null,
        title: 'Approval of Previous Minutes',
        itemType: 'decision',
        estimatedDuration: 10,
      },
      {
        orderIndex: 3,
        parentItemId: null,
        title: 'Quarterly Performance Review',
        description: 'Comprehensive review of quarterly performance metrics',
        itemType: 'information',
        estimatedDuration: 30,
      },
      {
        orderIndex: 4,
        parentItemId: null,
        title: 'Financial Report',
        description: 'Quarterly financial statements and analysis',
        itemType: 'committee_report',
        estimatedDuration: 25,
      },
      {
        orderIndex: 5,
        parentItemId: null,
        title: 'Strategic Initiatives Update',
        description: 'Progress on strategic initiatives and key projects',
        itemType: 'discussion',
        estimatedDuration: 40,
      },
      {
        orderIndex: 6,
        parentItemId: null,
        title: 'Budget Review and Forecast',
        description: 'Budget vs actual review and forecast adjustments',
        itemType: 'decision',
        estimatedDuration: 30,
      },
      {
        orderIndex: 7,
        parentItemId: null,
        title: 'Risk Management Report',
        description: 'Review of key risks and mitigation strategies',
        itemType: 'information',
        estimatedDuration: 20,
      },
      {
        orderIndex: 8,
        parentItemId: null,
        title: 'Any Other Business',
        itemType: 'discussion',
        estimatedDuration: 15,
      },
      {
        orderIndex: 9,
        parentItemId: null,
        title: 'Adjournment',
        itemType: 'information',
        estimatedDuration: 5,
      },
    ] as AgendaTemplateItemData[]),
    createdBy: 1,
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGlobal: true,
  },

  {
    id: 'template-audit-committee',
    name: 'Audit Committee Standard',
    description: 'Standard agenda for audit committee meetings',
    boardType: 'committee',
    items: JSON.stringify([
      {
        orderIndex: 1,
        parentItemId: null,
        title: 'Call to Order',
        itemType: 'information',
        estimatedDuration: 5,
      },
      {
        orderIndex: 2,
        parentItemId: null,
        title: 'Review of Audit Findings',
        description: 'Review of internal and external audit findings',
        itemType: 'information',
        estimatedDuration: 30,
      },
      {
        orderIndex: 3,
        parentItemId: null,
        title: 'Management Response',
        description: 'Management response to audit recommendations',
        itemType: 'discussion',
        estimatedDuration: 20,
      },
      {
        orderIndex: 4,
        parentItemId: null,
        title: 'Compliance Report',
        description: 'Regulatory compliance status update',
        itemType: 'information',
        estimatedDuration: 15,
      },
      {
        orderIndex: 5,
        parentItemId: null,
        title: 'Approval of Audit Plan',
        description: 'Review and approval of upcoming audit plan',
        itemType: 'decision',
        estimatedDuration: 20,
      },
      {
        orderIndex: 6,
        parentItemId: null,
        title: 'Any Other Business',
        itemType: 'discussion',
        estimatedDuration: 15,
      },
      {
        orderIndex: 7,
        parentItemId: null,
        title: 'Adjournment',
        itemType: 'information',
        estimatedDuration: 5,
      },
    ] as AgendaTemplateItemData[]),
    createdBy: 1,
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGlobal: true,
  },

  {
    id: 'template-factory-board',
    name: 'Factory Board Meeting',
    description: 'Template for factory board meetings',
    boardType: 'factory',
    items: JSON.stringify([
      {
        orderIndex: 1,
        parentItemId: null,
        title: 'Call to Order',
        itemType: 'information',
        estimatedDuration: 5,
      },
      {
        orderIndex: 2,
        parentItemId: null,
        title: 'Approval of Previous Minutes',
        itemType: 'decision',
        estimatedDuration: 10,
      },
      {
        orderIndex: 3,
        parentItemId: null,
        title: 'Production Report',
        description: 'Monthly production statistics and quality metrics',
        itemType: 'information',
        estimatedDuration: 20,
      },
      {
        orderIndex: 4,
        parentItemId: null,
        title: 'Financial Performance',
        description: 'Factory financial results and farmer payments',
        itemType: 'information',
        estimatedDuration: 15,
      },
      {
        orderIndex: 5,
        parentItemId: null,
        title: 'Operations Update',
        description: 'Equipment status, maintenance, and operational issues',
        itemType: 'discussion',
        estimatedDuration: 20,
      },
      {
        orderIndex: 6,
        parentItemId: null,
        title: 'Farmer Relations',
        description: 'Updates on farmer engagement and leaf supply',
        itemType: 'discussion',
        estimatedDuration: 15,
      },
      {
        orderIndex: 7,
        parentItemId: null,
        title: 'Any Other Business',
        itemType: 'discussion',
        estimatedDuration: 10,
      },
      {
        orderIndex: 8,
        parentItemId: null,
        title: 'Adjournment',
        itemType: 'information',
        estimatedDuration: 5,
      },
    ] as AgendaTemplateItemData[]),
    createdBy: 17,
    createdByName: 'Kenneth Muhia',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    isGlobal: false,
  },

  {
    id: 'template-emergency',
    name: 'Emergency Meeting',
    description: 'Streamlined template for emergency board meetings',
    boardType: 'all',
    items: JSON.stringify([
      {
        orderIndex: 1,
        parentItemId: null,
        title: 'Call to Order - Emergency Declaration',
        description: 'Emergency meeting convened',
        itemType: 'information',
        estimatedDuration: 5,
      },
      {
        orderIndex: 2,
        parentItemId: null,
        title: 'Situation Analysis',
        description: 'Presentation of the emergency situation',
        itemType: 'information',
        estimatedDuration: 20,
      },
      {
        orderIndex: 3,
        parentItemId: null,
        title: 'Discussion of Response Options',
        description: 'Discussion of possible responses and actions',
        itemType: 'discussion',
        estimatedDuration: 40,
      },
      {
        orderIndex: 4,
        parentItemId: null,
        title: 'Approval of Immediate Actions',
        description: 'Vote on emergency response plan',
        itemType: 'decision',
        estimatedDuration: 20,
      },
      {
        orderIndex: 5,
        parentItemId: null,
        title: 'Adjournment',
        itemType: 'information',
        estimatedDuration: 5,
      },
    ] as AgendaTemplateItemData[]),
    createdBy: 1,
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isGlobal: true,
  },
];
