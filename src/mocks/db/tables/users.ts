/**
 * Users Table - Flat database-like structure
 * Based on KTDA Board of Directors structure
 */

export interface UserRow {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  employeeId: string | null;
  avatar: string | null;
  timezone: string;
  zone: string | null;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  mfaEnabled: boolean;
  mfaSetupComplete: boolean;
  hasCertificate: boolean;
  certificateExpiry: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

// ============================================================================
// USERS TABLE DATA
// ============================================================================

export const usersTable: UserRow[] = [
  // ============================================================================
  // 1. GROUP CHAIRMAN
  // ============================================================================
  {
    id: 1,
    email: 'chege.kirundi@ktda.co.ke',
    firstName: 'Chege',
    lastName: 'Kirundi',
    fullName: 'Chege Kirundi',
    phone: '+254 722 100 001',
    employeeId: 'DIR-001',
    avatar: null,
    timezone: 'Africa/Nairobi',
    zone: 'Zone 3',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-20T08:30:00Z',
  },

  // ============================================================================
  // 2. VICE CHAIRMAN
  // ============================================================================
  {
    id: 2,
    email: 'james.ombasa@ktdateas.com',
    firstName: 'James',
    lastName: 'Ombasa Omweno',
    fullName: 'James Ombasa Omweno',
    phone: '+254 722 100 002',
    employeeId: 'DIR-002',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Vice Chairman',
    zone: 'Zone 11',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-19T10:15:00Z',
  },

  // ============================================================================
  // 3. GROUP COMPANY SECRETARY
  // ============================================================================
  {
    id: 3,
    email: 'mathew.odero@ktdateas.com',
    firstName: 'Mathews',
    lastName: 'Odiero',
    fullName: 'Mathews Odiero',
    phone: '+254 722 100 003',
    employeeId: 'SEC-001',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Group Company Secretary',
    zone: null,
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-06-30',
    createdAt: '2019-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-21T09:15:00Z',
  },

  // ============================================================================
  // 4-13. BOARD MEMBERS (Zone Directors) - 10 Members
  // ============================================================================
  
  // 4. Board Member - Zone 1
  {
    id: 4,
    email: 'gg.kagombe@ktdateas.com',
    firstName: 'G.G',
    lastName: 'Kagombe',
    fullName: 'Hon G.G Kagombe',
    phone: '+254 722 100 004',
    employeeId: 'DIR-003',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: 'Zone 1',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-18T14:30:00Z',
  },

  // 5. Board Member - Zone 2
  {
    id: 5,
    email: 'james.githinji@ktdateas.com',
    firstName: 'James',
    lastName: 'Githinji Mwangi',
    fullName: 'James Githinji Mwangi',
    phone: '+254 722 100 005',
    employeeId: 'DIR-004',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: 'Zone 2',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-17T11:00:00Z',
  },

  // 6. Board Member - Zone 4
  {
    id: 6,
    email: 'david.ndungu@ktdateas.com',
    firstName: 'David',
    lastName: "Ndung'u",
    fullName: "David Ndung'u",
    phone: '+254 722 100 006',
    employeeId: 'DIR-005',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: 'Zone 4',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-16T09:45:00Z',
  },

  // 7. Board Member - Zone 5
  {
    id: 7,
    email: 'john.wasusana@ktdateas.com',
    firstName: 'John',
    lastName: 'Mthamo Wasusana',
    fullName: 'John Mthamo Wasusana',
    phone: '+254 722 100 007',
    employeeId: 'DIR-006',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: 'Zone 5',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-15T16:20:00Z',
  },

  // 8. Board Member - Zone 6
  {
    id: 8,
    email: 'enos.njeru@ktdateas.com',
    firstName: 'Enos',
    lastName: 'Njeru',
    fullName: 'Enos Njeru',
    phone: '+254 722 100 008',
    employeeId: 'DIR-007',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: 'Zone 6',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-14T10:30:00Z',
  },

  // 9. Board Member - Zone 7
  {
    id: 9,
    email: 'baptista.kanyaru@ktdateas.com',
    firstName: 'Baptista',
    lastName: 'Kanyaru',
    fullName: 'Baptista Kanyaru',
    phone: '+254 722 100 009',
    employeeId: 'DIR-008',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: 'Zone 7',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-13T11:00:00Z',
  },

  // 10. Board Member - Zone 8
  {
    id: 10,
    email: 'philip.langat@ktdateas.com',
    firstName: 'Philip',
    lastName: 'Langat',
    fullName: 'Philip Langat',
    phone: '+254 722 100 010',
    employeeId: 'DIR-009',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: 'Zone 8',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-12T09:30:00Z',
  },

  // 11. Board Member - Zone 9
  {
    id: 11,
    email: 'samson.menjo@ktdateas.com',
    firstName: 'Samson Mosonik',
    lastName: 'Kipkoech Menjo',
    fullName: 'Eng. Samson Mosonik Kipkoech Menjo',
    phone: '+254 722 100 011',
    employeeId: 'DIR-010',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: 'Zone 9',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-11T14:00:00Z',
  },

  // 12. Board Member - Zone 10
  {
    id: 12,
    email: 'vincent.ansi@ktdateas.com',
    firstName: 'Vincent',
    lastName: 'Ansi',
    fullName: 'Vincent Ansi',
    phone: '+254 722 100 012',
    employeeId: 'DIR-011',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: 'Zone 10',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-10T10:15:00Z',
  },

  // 13. Board Member - Zone 12
  {
    id: 13,
    email: 'francis.kimotho@ktdateas.com',
    firstName: 'Francis',
    lastName: 'Wanjau Kimotho',
    fullName: 'Francis Wanjau Kimotho',
    phone: '+254 722 100 013',
    employeeId: 'DIR-012',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: 'Zone 12',
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-09T11:30:00Z',
  },

  // 14. Board Member (Independent Director)
  {
    id: 14,
    email: 'catherine.mankura@ktdateas.com',
    firstName: 'Catherine',
    lastName: 'Mankura',
    fullName: 'Catherine Mankura',
    phone: '+254 722 100 014',
    employeeId: 'DIR-013',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Member',
    zone: null,
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-08T09:00:00Z',
  },

  // ============================================================================
  // 15. EXECUTIVE MEMBER - CEO
  // ============================================================================
  {
    id: 15,
    email: 'francis.miano@ktdateas.com',
    firstName: 'Francis',
    lastName: 'Miano',
    fullName: 'Eng. Francis Miano',
    phone: '+254 722 100 015',
    employeeId: 'EXE-001',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'CEO',
    zone: null,
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-21T09:45:00Z',
  },

  // ============================================================================
  // 16. EXECUTIVE MEMBER - GFSD (Group Finance & Strategy Director)
  // ============================================================================
  {
    id: 16,
    email: 'simeon.rugutt@ktdateas.com',
    firstName: 'Simeon',
    lastName: 'Rugutt',
    fullName: 'Simeon Rugutt',
    phone: '+254 722 100 016',
    employeeId: 'EXE-002',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'GFSD',
    zone: null,
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-21T08:00:00Z',
  },

  // ============================================================================
  // 17-19. BOARD SECRETARIES
  // ============================================================================
  {
    id: 17,
    email: 'kmuhia@ktdateas.com',
    firstName: 'Kenneth',
    lastName: 'Muhia',
    fullName: 'Kenneth Mwangi Muhia',
    phone: '+254 722 300 001',
    employeeId: 'CS-001',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Secretary',
    zone: null,
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-21T07:30:00Z',
  },
  {
    id: 18,
    email: 'isaac.chege@ktdateas.com',
    firstName: 'Isaac',
    lastName: 'Chege',
    fullName: 'Isaac Mungai Chege',
    phone: '+254 722 300 002',
    employeeId: 'CS-002',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Secretary',
    zone: null,
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-20T08:00:00Z',
  },
  {
    id: 19,
    email: 'jane.njeri@ktdateas.com',
    firstName: 'Jane',
    lastName: 'Njeri',
    fullName: 'Jane Njeri Njeri',
    phone: '+254 722 300 003',
    employeeId: 'CS-003',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Board Secretary',
    zone: null,
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: true,
    certificateExpiry: '2027-12-31',
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-19T09:00:00Z',
  },

  // ============================================================================
  // 20-21. SYSTEM ADMINISTRATORS
  // ============================================================================
  {
    id: 20,
    email: 'brian.mochama@ktdateas.com',
    firstName: 'Brian',
    lastName: 'Mochama',
    fullName: 'Brian Mochama',
    phone: '+254 722 200 001',
    employeeId: 'IT-001',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'System Administrator',
    zone: null,
    status: 'active',
    mfaEnabled: false,
    mfaSetupComplete: false,
    hasCertificate: false,
    certificateExpiry: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-21T08:00:00Z',
  },
  {
    id: 21,
    email: 'winfred.kabuuri@ktdateas.com',
    firstName: 'Winfred',
    lastName: 'Kabuuri',
    fullName: 'Winfred Kabuuri',
    phone: '+254 722 200 002',
    employeeId: 'IT-002',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'System Administrator',
    zone: null,
    status: 'active',
    mfaEnabled: false,
    mfaSetupComplete: false,
    hasCertificate: false,
    certificateExpiry: null,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-20T09:00:00Z',
  },

  // ============================================================================
  // 22. SAMPLE PRESENTER (Head of ICT)
  // ============================================================================
  {
    id: 22,
    email: 'headofict@ktdateas.com',
    firstName: 'Martin',
    lastName: 'Mwarangu',
    fullName: 'Martin Mwarangu',
    phone: '+254 722 400 001',
    employeeId: 'ICT-001',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Director',
    zone: null,
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: false,
    certificateExpiry: null,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-17T10:00:00Z',
  },
   {
    id: 23,
    email: 'headofhr@ktdateas.com',
    firstName: 'Charles',
    lastName: 'Kireru',
    fullName: 'Charles Kireru',
    phone: '+254 722 400 001',
    employeeId: 'HR-001',
    avatar: null,
    timezone: 'Africa/Nairobi',
    // Role name derived from userBoardRoles default assignment
    // jobTitle: 'Director',
    zone: null,
    status: 'active',
    mfaEnabled: true,
    mfaSetupComplete: true,
    hasCertificate: false,
    certificateExpiry: null,
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-12-17T10:00:00Z',
  },
];