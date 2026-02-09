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
import { documentHandlers } from './documents.handlers';
import { documentCategoriesHandlers } from './documentCategories.handlers';
import { votingHandlers } from './voting.handlers';
import { minutesHandlers } from './minutes.handlers';
import { minutesTemplatesHandlers } from './minutesTemplates.handlers';
import { actionItemsHandlers } from './actionItems.handlers';
import { resolutionsHandlers } from './resolutions.handlers';

export const handlers = [
  ...usersHandlers,
  ...rolesHandlers,
  ...authHandlers,
  ...boardsHandlers,
  ...meetingsHandlers,
  ...agendaHandlers,
  ...userSessionsHandlers,
  ...documentCategoriesHandlers, // Must come before documentHandlers to avoid path conflicts
  ...documentHandlers,
  ...votingHandlers,
  ...minutesHandlers,
  ...minutesTemplatesHandlers,
  ...actionItemsHandlers,
  ...resolutionsHandlers,
];

export default handlers;
