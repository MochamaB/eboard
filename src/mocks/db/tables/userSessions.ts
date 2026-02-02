/**
 * User Sessions Table - Database-like structure
 * Stores active and historical user sessions for device tracking and security monitoring
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export interface UserSessionRow {
  id: string;
  userId: number;

  // Device Information
  deviceType: DeviceType;
  deviceName: string;
  browser: string;
  browserVersion: string;
  operatingSystem: string;

  // Network Information
  ipAddress: string;
  location: string | null;

  // Session Tracking
  userAgent: string;
  sessionToken: string;
  isActive: boolean;
  lastAccessedAt: string;
  firstAccessedAt: string;
  expiresAt: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// USER SESSIONS TABLE DATA
// ============================================================================

export const userSessionsTable: UserSessionRow[] = [
  // ========================================================================
  // GROUP CHAIRMAN - KEN LUSAKA (Active Sessions)
  // ========================================================================
  {
    id: 'session-001',
    userId: 1,
    deviceType: 'desktop',
    deviceName: 'Windows 11 PC',
    browser: 'Chrome',
    browserVersion: '120.0.6099.109',
    operatingSystem: 'Windows 11',
    ipAddress: '197.232.61.245',
    location: 'Nairobi, Kenya',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    sessionToken: 'token-001-desktop',
    isActive: true,
    lastAccessedAt: '2026-02-02T10:30:00Z',
    firstAccessedAt: '2026-02-02T08:00:00Z',
    expiresAt: '2026-02-02T11:00:00Z',
    createdAt: '2026-02-02T08:00:00Z',
    updatedAt: '2026-02-02T10:30:00Z',
  },
  {
    id: 'session-002',
    userId: 1,
    deviceType: 'mobile',
    deviceName: 'iPhone 14 Pro',
    browser: 'Safari',
    browserVersion: '17.2',
    operatingSystem: 'iOS 17.2',
    ipAddress: '197.232.61.246',
    location: 'Nairobi, Kenya',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    sessionToken: 'token-002-mobile',
    isActive: true,
    lastAccessedAt: '2026-02-02T09:45:00Z',
    firstAccessedAt: '2026-02-01T20:00:00Z',
    expiresAt: '2026-02-02T10:15:00Z',
    createdAt: '2026-02-01T20:00:00Z',
    updatedAt: '2026-02-02T09:45:00Z',
  },

  // ========================================================================
  // BOARD SECRETARY - KENNETH MUHIA (Active Sessions)
  // ========================================================================
  {
    id: 'session-003',
    userId: 17,
    deviceType: 'desktop',
    deviceName: 'MacBook Pro M2',
    browser: 'Safari',
    browserVersion: '17.2',
    operatingSystem: 'macOS Sonoma 14.2',
    ipAddress: '197.232.62.10',
    location: 'Nairobi, Kenya',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    sessionToken: 'token-003-desktop',
    isActive: true,
    lastAccessedAt: '2026-02-02T10:25:00Z',
    firstAccessedAt: '2026-02-02T07:30:00Z',
    expiresAt: '2026-02-02T10:55:00Z',
    createdAt: '2026-02-02T07:30:00Z',
    updatedAt: '2026-02-02T10:25:00Z',
  },
  {
    id: 'session-004',
    userId: 17,
    deviceType: 'tablet',
    deviceName: 'iPad Air',
    browser: 'Safari',
    browserVersion: '17.2',
    operatingSystem: 'iPadOS 17.2',
    ipAddress: '197.232.62.11',
    location: 'Nairobi, Kenya',
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    sessionToken: 'token-004-tablet',
    isActive: true,
    lastAccessedAt: '2026-02-02T08:15:00Z',
    firstAccessedAt: '2026-02-01T18:00:00Z',
    expiresAt: '2026-02-02T08:45:00Z',
    createdAt: '2026-02-01T18:00:00Z',
    updatedAt: '2026-02-02T08:15:00Z',
  },

  // ========================================================================
  // COMPANY SECRETARY - ISAAC CHEGE (Active Session)
  // ========================================================================
  {
    id: 'session-005',
    userId: 18,
    deviceType: 'desktop',
    deviceName: 'Windows 10 PC',
    browser: 'Edge',
    browserVersion: '120.0.2210.91',
    operatingSystem: 'Windows 10',
    ipAddress: '197.232.63.20',
    location: 'Nairobi, Kenya',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91',
    sessionToken: 'token-005-desktop',
    isActive: true,
    lastAccessedAt: '2026-02-02T10:20:00Z',
    firstAccessedAt: '2026-02-02T08:30:00Z',
    expiresAt: '2026-02-02T10:50:00Z',
    createdAt: '2026-02-02T08:30:00Z',
    updatedAt: '2026-02-02T10:20:00Z',
  },

  // ========================================================================
  // SYSTEM ADMIN - ADMIN USER (Multiple Active Sessions)
  // ========================================================================
  {
    id: 'session-006',
    userId: 19,
    deviceType: 'desktop',
    deviceName: 'Ubuntu 22.04 PC',
    browser: 'Firefox',
    browserVersion: '121.0',
    operatingSystem: 'Ubuntu 22.04',
    ipAddress: '197.232.64.30',
    location: 'Nairobi, Kenya',
    userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
    sessionToken: 'token-006-desktop',
    isActive: true,
    lastAccessedAt: '2026-02-02T10:35:00Z',
    firstAccessedAt: '2026-02-02T06:00:00Z',
    expiresAt: '2026-02-02T11:05:00Z',
    createdAt: '2026-02-02T06:00:00Z',
    updatedAt: '2026-02-02T10:35:00Z',
  },
  {
    id: 'session-007',
    userId: 19,
    deviceType: 'mobile',
    deviceName: 'Samsung Galaxy S23',
    browser: 'Chrome',
    browserVersion: '120.0.6099.144',
    operatingSystem: 'Android 14',
    ipAddress: '197.232.64.31',
    location: 'Nairobi, Kenya',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
    sessionToken: 'token-007-mobile',
    isActive: true,
    lastAccessedAt: '2026-02-02T09:50:00Z',
    firstAccessedAt: '2026-02-02T07:00:00Z',
    expiresAt: '2026-02-02T10:20:00Z',
    createdAt: '2026-02-02T07:00:00Z',
    updatedAt: '2026-02-02T09:50:00Z',
  },

  // ========================================================================
  // EXPIRED/INACTIVE SESSIONS (Historical Data)
  // ========================================================================
  {
    id: 'session-008',
    userId: 1,
    deviceType: 'desktop',
    deviceName: 'Windows 11 PC',
    browser: 'Chrome',
    browserVersion: '119.0.6045.199',
    operatingSystem: 'Windows 11',
    ipAddress: '197.232.61.245',
    location: 'Nairobi, Kenya',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    sessionToken: 'token-008-expired',
    isActive: false,
    lastAccessedAt: '2026-02-01T16:00:00Z',
    firstAccessedAt: '2026-02-01T08:00:00Z',
    expiresAt: '2026-02-01T16:30:00Z',
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-01T16:00:00Z',
  },
  {
    id: 'session-009',
    userId: 17,
    deviceType: 'mobile',
    deviceName: 'iPhone 14 Pro',
    browser: 'Safari',
    browserVersion: '17.1',
    operatingSystem: 'iOS 17.1',
    ipAddress: '197.232.62.12',
    location: 'Nairobi, Kenya',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    sessionToken: 'token-009-expired',
    isActive: false,
    lastAccessedAt: '2026-01-31T22:00:00Z',
    firstAccessedAt: '2026-01-31T09:00:00Z',
    expiresAt: '2026-01-31T22:30:00Z',
    createdAt: '2026-01-31T09:00:00Z',
    updatedAt: '2026-01-31T22:00:00Z',
  },
  {
    id: 'session-010',
    userId: 18,
    deviceType: 'desktop',
    deviceName: 'Windows 10 PC',
    browser: 'Edge',
    browserVersion: '119.0.2151.97',
    operatingSystem: 'Windows 10',
    ipAddress: '197.232.63.21',
    location: 'Mombasa, Kenya',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.2151.97',
    sessionToken: 'token-010-expired',
    isActive: false,
    lastAccessedAt: '2026-01-30T17:30:00Z',
    firstAccessedAt: '2026-01-30T08:00:00Z',
    expiresAt: '2026-01-30T18:00:00Z',
    createdAt: '2026-01-30T08:00:00Z',
    updatedAt: '2026-01-30T17:30:00Z',
  },
];
