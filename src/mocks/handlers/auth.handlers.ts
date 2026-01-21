/**
 * Auth API Handlers
 * MSW handlers for authentication endpoints
 */

import { http, HttpResponse, delay } from 'msw';
import { getUserByEmail } from '../data/users';

// Mock session state
let mfaPendingUser: { id: number; email: string } | null = null;

export const authHandlers = [
  // POST /api/auth/login - Login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(500);
    
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
    
    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return HttpResponse.json(
        { message: 'Account is locked. Please try again later.' },
        { status: 423 }
      );
    }
    
    // Check if account is inactive
    if (user.status === 'inactive') {
      return HttpResponse.json(
        { message: 'Account is deactivated. Please contact administrator.' },
        { status: 403 }
      );
    }
    
    // Mock password check (in real app, this would be hashed comparison)
    // For demo: password is "password123" for all users
    if (password !== 'password123') {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if MFA is required
    if (user.mfaEnabled && user.mfaSetupComplete) {
      mfaPendingUser = { id: user.id, email: user.email };
      return HttpResponse.json({
        accessToken: '',
        expiresIn: 0,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          avatar: user.avatar,
          primaryRole: user.primaryRole,
          permissions: [],
          mfaEnabled: true,
          mfaRequired: true,
          mustChangePassword: false,
          defaultOrgId: 'ktda-main',
        },
      });
    }
    
    // Check if first-time login (pending status)
    const mustChangePassword = user.status === 'pending';
    
    // Generate mock tokens
    const accessToken = `mock-jwt-token-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;
    
    return HttpResponse.json({
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        primaryRole: user.primaryRole,
        permissions: ['users.view', 'meetings.view', 'documents.view'], // Simplified
        mfaEnabled: user.mfaEnabled,
        mfaRequired: false,
        mustChangePassword,
        defaultOrgId: 'ktda-main',
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
    
    const newAccessToken = `mock-jwt-token-refreshed-${Date.now()}`;
    
    return HttpResponse.json({
      accessToken: newAccessToken,
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
    
    // Mock code verification (accept any 6-digit code for demo)
    if (!/^\d{6}$/.test(body.code)) {
      return HttpResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }
    
    const user = getUserByEmail(mfaPendingUser.email);
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    mfaPendingUser = null;
    
    const accessToken = `mock-jwt-token-mfa-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-token-mfa-${user.id}-${Date.now()}`;
    
    return HttpResponse.json({
      accessToken,
      refreshToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        primaryRole: user.primaryRole,
        permissions: ['users.view', 'meetings.view', 'documents.view'],
        mfaEnabled: true,
        mfaRequired: false,
        mustChangePassword: false,
        defaultOrgId: 'ktda-main',
      },
    });
  }),

  // POST /api/auth/mfa/setup - Setup MFA
  http.post('/api/auth/mfa/setup', async () => {
    await delay(300);
    
    // Generate mock QR code URL and backup codes
    const secret = 'JBSWY3DPEHPK3PXP'; // Mock secret
    const qrCodeUrl = `otpauth://totp/eBoard:user@ktda.co.ke?secret=${secret}&issuer=eBoard`;
    const backupCodes = [
      'ABCD-1234-EFGH',
      'IJKL-5678-MNOP',
      'QRST-9012-UVWX',
      'YZAB-3456-CDEF',
      'GHIJ-7890-KLMN',
    ];
    
    return HttpResponse.json({
      secret,
      qrCodeUrl,
      backupCodes,
    });
  }),

  // POST /api/auth/mfa/confirm - Confirm MFA setup
  http.post('/api/auth/mfa/confirm', async ({ request }) => {
    await delay(300);
    
    const body = await request.json() as { code: string };
    
    if (!/^\d{6}$/.test(body.code)) {
      return HttpResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      backupCodes: [
        'ABCD-1234-EFGH',
        'IJKL-5678-MNOP',
        'QRST-9012-UVWX',
        'YZAB-3456-CDEF',
        'GHIJ-7890-KLMN',
      ],
    });
  }),

  // POST /api/auth/change-password - Change password
  http.post('/api/auth/change-password', async ({ request }) => {
    await delay(300);
    
    const body = await request.json() as { currentPassword: string; newPassword: string };
    
    // Mock current password check
    if (body.currentPassword !== 'password123') {
      return HttpResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({ success: true, message: 'Password changed successfully' });
  }),

  // POST /api/auth/forgot-password - Request password reset
  http.post('/api/auth/forgot-password', async ({ request }) => {
    await delay(500);
    
    const body = await request.json() as { email: string };
    
    // Always return success to prevent email enumeration
    return HttpResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  }),

  // POST /api/auth/reset-password - Reset password with token
  http.post('/api/auth/reset-password', async ({ request }) => {
    await delay(300);
    
    const body = await request.json() as { token: string; newPassword: string };
    
    // Mock token validation
    if (!body.token || body.token.length < 10) {
      return HttpResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({ success: true, message: 'Password reset successfully' });
  }),

  // GET /api/auth/me - Get current user
  http.get('/api/auth/me', async ({ request }) => {
    await delay(200);
    
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-token')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Return admin user for demo
    const user = getUserByEmail('admin@ktda.co.ke');
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      avatar: user.avatar,
      primaryRole: user.primaryRole,
      permissions: ['users.view', 'users.create', 'users.edit', 'meetings.view', 'documents.view'],
      mfaEnabled: user.mfaEnabled,
      mfaRequired: false,
      mustChangePassword: false,
      defaultOrgId: 'ktda-main',
    });
  }),
];

export default authHandlers;
