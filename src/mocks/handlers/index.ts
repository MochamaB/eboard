/**
 * MSW Handlers Index
 * Combine all handlers
 */

import { usersHandlers } from './users.handlers.new';
import { rolesHandlers } from './roles.handlers.new';
import { authHandlers } from './auth.handlers.new';
import { boardsHandlers } from './boards.handlers.new';
import { meetingsHandlers } from './meetings.handlers';
import { agendaHandlers } from './agenda.handlers';
import { userSessionsHandlers } from './userSessions.handlers';

export const handlers = [
  ...usersHandlers,
  ...rolesHandlers,
  ...authHandlers,
  ...boardsHandlers,
  ...meetingsHandlers,
  ...agendaHandlers,
  ...userSessionsHandlers,
];

export default handlers;
