/**
 * User Sessions API Handlers
 * MSW handlers for user session management and device tracking endpoints
 */

import { http, HttpResponse, delay } from 'msw';
import {
  getUserSessions,
  getUserActiveSessions,
  getSessionById,
  deactivateSession,
  deactivateAllUserSessions,
} from '../db/queries/userSessionQueries';

export const userSessionsHandlers = [
  // GET /api/users/:userId/sessions - Get all sessions for a user
  http.get('/api/users/:userId/sessions', async ({ params, request }) => {
    await delay(200);

    const userId = parseInt(params.userId as string);
    const url = new URL(request.url);
    const activeOnly = url.searchParams.get('activeOnly') === 'true';

    const sessions = activeOnly
      ? getUserActiveSessions(userId)
      : getUserSessions(userId);

    return HttpResponse.json({
      data: sessions,
      total: sessions.length,
    });
  }),

  // GET /api/sessions/:sessionId - Get single session by ID
  http.get('/api/sessions/:sessionId', async ({ params }) => {
    await delay(150);

    const sessionId = params.sessionId as string;
    const session = getSessionById(sessionId);

    if (!session) {
      return HttpResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(session);
  }),

  // DELETE /api/sessions/:sessionId - Terminate a specific session (logout single device)
  http.delete('/api/sessions/:sessionId', async ({ params }) => {
    await delay(300);

    const sessionId = params.sessionId as string;
    const success = deactivateSession(sessionId);

    if (!success) {
      return HttpResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // DELETE /api/users/:userId/sessions - Terminate all sessions for a user (force logout all devices)
  http.delete('/api/users/:userId/sessions', async ({ params }) => {
    await delay(400);

    const userId = parseInt(params.userId as string);
    const count = deactivateAllUserSessions(userId);

    return HttpResponse.json({
      count,
      message: `Terminated ${count} active session(s)`,
    });
  }),
];

export default userSessionsHandlers;
