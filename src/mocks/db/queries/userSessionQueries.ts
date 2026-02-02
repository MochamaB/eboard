/**
 * User Session Queries
 * Functions for querying and manipulating user session data
 */

import { userSessionsTable, type UserSessionRow } from '../tables/userSessions';
import type { UserSession } from '../../../types/user.types';

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all sessions for a user
 */
export function getUserSessions(userId: number): UserSession[] {
  const sessions = userSessionsTable
    .filter(session => session.userId === userId)
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());

  return sessions.map(toUserSession);
}

/**
 * Get active sessions for a user
 */
export function getUserActiveSessions(userId: number): UserSession[] {
  const sessions = userSessionsTable
    .filter(session => session.userId === userId && session.isActive)
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());

  return sessions.map(toUserSession);
}

/**
 * Get session by ID
 */
export function getSessionById(sessionId: string): UserSession | null {
  const session = userSessionsTable.find(s => s.id === sessionId);
  return session ? toUserSession(session) : null;
}

/**
 * Get session by token
 */
export function getSessionByToken(sessionToken: string): UserSession | null {
  const session = userSessionsTable.find(s => s.sessionToken === sessionToken);
  return session ? toUserSession(session) : null;
}

/**
 * Get all active sessions across all users (admin view)
 */
export function getAllActiveSessions(): UserSession[] {
  return userSessionsTable
    .filter(session => session.isActive)
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .map(toUserSession);
}

/**
 * Count active sessions for a user
 */
export function countUserActiveSessions(userId: number): number {
  return userSessionsTable.filter(s => s.userId === userId && s.isActive).length;
}

// ============================================================================
// MUTATION FUNCTIONS (for mock API handlers)
// ============================================================================

/**
 * Create a new session
 */
export function createSession(sessionData: Omit<UserSessionRow, 'id' | 'createdAt' | 'updatedAt'>): UserSession {
  const now = new Date().toISOString();
  const newSession: UserSessionRow = {
    ...sessionData,
    id: `session-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  userSessionsTable.push(newSession);
  return toUserSession(newSession);
}

/**
 * Update session last accessed time
 */
export function updateSessionAccess(sessionId: string): UserSession | null {
  const session = userSessionsTable.find(s => s.id === sessionId);
  if (!session) return null;

  session.lastAccessedAt = new Date().toISOString();
  session.updatedAt = new Date().toISOString();

  return toUserSession(session);
}

/**
 * Deactivate a session (logout)
 */
export function deactivateSession(sessionId: string): boolean {
  const session = userSessionsTable.find(s => s.id === sessionId);
  if (!session) return false;

  session.isActive = false;
  session.updatedAt = new Date().toISOString();

  return true;
}

/**
 * Deactivate all sessions for a user (force logout all devices)
 */
export function deactivateAllUserSessions(userId: number): number {
  const userSessions = userSessionsTable.filter(s => s.userId === userId && s.isActive);
  const now = new Date().toISOString();

  userSessions.forEach(session => {
    session.isActive = false;
    session.updatedAt = now;
  });

  return userSessions.length;
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): number {
  const now = new Date();
  let count = 0;

  userSessionsTable.forEach(session => {
    if (session.isActive && new Date(session.expiresAt) < now) {
      session.isActive = false;
      session.updatedAt = now.toISOString();
      count++;
    }
  });

  return count;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert UserSessionRow to UserSession type
 */
function toUserSession(row: UserSessionRow): UserSession {
  return {
    id: row.id,
    userId: row.userId,
    deviceType: row.deviceType,
    deviceName: row.deviceName,
    browser: row.browser,
    browserVersion: row.browserVersion,
    operatingSystem: row.operatingSystem,
    ipAddress: row.ipAddress,
    location: row.location,
    userAgent: row.userAgent,
    sessionToken: row.sessionToken,
    isActive: row.isActive,
    lastAccessedAt: row.lastAccessedAt,
    firstAccessedAt: row.firstAccessedAt,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
