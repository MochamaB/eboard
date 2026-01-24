/**
 * Auth API Handlers (Refactored)
 * MSW handlers using the new database-like structure
 */

import { http, HttpResponse, delay } from 'msw';
import { getUserByEmail, toAuthUser } from '../db/queries/userQueries';

// Store for MFA pending users
let mfaPendingUser: { id: number; email: string } | null = null;

export const authHandlers = [
  // POST /api/auth/login - Login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(300);
    
    const body = await request.json() as { email: string; password: string };
    const { email, password } = body;
    
    // Find user by email
    const user = getUserByEmail(email);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Mock password check - all users use "password123"
    if (password !== 'password123') {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Skip MFA for demo purposes
    // In production, this would check user.mfaEnabled && user.mfaSetupComplete
    
    // Check if first-time login (pending status)
    const mustChangePassword = user.status === 'pending';
    
    // Generate mock tokens
    const accessToken = `mock-jwt-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;
    
    // Convert to AuthUser (includes permissions)
    const authUser = toAuthUser(user, 'ktda-ms');
    
    return HttpResponse.json({
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        ...authUser,
        mfaRequired: false,
        mustChangePassword,
      },
    });
  }),

  // POST /api/auth/logout - Logout
  http.post('/api/auth/logout', async () => {
    await delay(200);
    mfaPendingUser = null;
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/auth/refresh - Refresh token
  http.post('/api/auth/refresh', async ({ request }) => {
    await delay(200);
    
    const body = await request.json() as { refreshToken: string };
    
    if (!body.refreshToken || !body.refreshToken.startsWith('mock-refresh-token')) {
      return HttpResponse.json(
        { message: 'Invalid refresh token' },
        { status: 401 }
      );
    }
    
    // Extract user ID from token
    const tokenParts = body.refreshToken.split('-');
    const userId = parseInt(tokenParts[3]);
    
    // For demo, just return new tokens
    return HttpResponse.json({
      accessToken: `mock-jwt-token-${userId}-${Date.now()}`,
      refreshToken: `mock-refresh-token-${userId}-${Date.now()}`,
      expiresIn: 3600,
    });
  }),

  // GET /api/auth/me - Get current user
  http.get('/api/auth/me', async ({ request }) => {
    await delay(200);
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Extract user ID from mock token
    if (!token.startsWith('mock-jwt-token-')) {
      return HttpResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const tokenParts = token.split('-');
    const userId = parseInt(tokenParts[3]);
    
    // Find user (simplified - in real app would validate token properly)
    const { usersTable } = await import('../db/tables/users');
    const user = usersTable.find(u => u.id === userId);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      data: toAuthUser(user),
    });
  }),

  // POST /api/auth/mfa/verify - Verify MFA code
  http.post('/api/auth/mfa/verify', async ({ request }) => {
    await delay(300);
    
    const body = await request.json() as { code: string };
    
    if (!mfaPendingUser) {
      return HttpResponse.json(
        { message: 'No MFA verification pending' },
        { status: 400 }
      );
    }
    
    // Accept any 6-digit code for demo
    if (!/^\d{6}$/.test(body.code)) {
      return HttpResponse.json(
        { message: 'Invalid MFA code format' },
        { status: 400 }
      );
    }
    
    const { usersTable } = await import('../db/tables/users');
    const user = usersTable.find(u => u.id === mfaPendingUser!.id);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Clear pending MFA
    mfaPendingUser = null;
    
    // Generate tokens
    const accessToken = `mock-jwt-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;
    
    // Convert to AuthUser (includes permissions)
    const authUser = toAuthUser(user, 'ktda-ms');
    
    return HttpResponse.json({
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        ...authUser,
        mfaRequired: false,
      },
    });
  }),

  // POST /api/auth/password/change - Change password
  http.post('/api/auth/password/change', async () => {
    await delay(300);
    return HttpResponse.json({ message: 'Password changed successfully' });
  }),

  // POST /api/auth/password/forgot - Request password reset
  http.post('/api/auth/password/forgot', async () => {
    await delay(300);
    return HttpResponse.json({ message: 'Password reset email sent' });
  }),

  // POST /api/auth/password/reset - Reset password with token
  http.post('/api/auth/password/reset', async () => {
    await delay(300);
    return HttpResponse.json({ message: 'Password reset successfully' });
  }),
];
