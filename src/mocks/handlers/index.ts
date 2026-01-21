/**
 * MSW Handlers Index
 * Combine all handlers
 */

import { usersHandlers } from './users.handlers';
import { rolesHandlers } from './roles.handlers';
import { authHandlers } from './auth.handlers';
import { boardsHandlers } from './boards.handlers';

export const handlers = [
  ...usersHandlers,
  ...rolesHandlers,
  ...authHandlers,
  ...boardsHandlers,
];

export default handlers;
