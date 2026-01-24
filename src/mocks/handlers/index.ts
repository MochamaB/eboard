/**
 * MSW Handlers Index
 * Combine all handlers
 */

import { usersHandlers } from './users.handlers.new';
import { rolesHandlers } from './roles.handlers.new';
import { authHandlers } from './auth.handlers.new';
import { boardsHandlers } from './boards.handlers.new';
import { meetingsHandlers } from './meetings.handlers';

export const handlers = [
  ...usersHandlers,
  ...rolesHandlers,
  ...authHandlers,
  ...boardsHandlers,
  ...meetingsHandlers,
];

export default handlers;
