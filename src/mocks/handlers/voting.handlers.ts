/**
 * MSW Handlers for Voting API
 * Mock API endpoints for voting and polling
 */

import { http, HttpResponse } from 'msw';
import type {
  VoteDetail,
  CreateVotePayload,
  ConfigureVotePayload,
  CastVotePayload,
  CloseVotePayload,
  ReopenVotePayload,
} from '../../types/voting.types';
import {
  getVoteById,
  getVotesByEntity,
  getVotesByMeeting,
  calculateResults,
  isUserEligible,
  hasUserVoted,
  canConfigure,
  canOpen,
  canVote,
  canClose,
  canReopen,
  createVote,
  updateVoteStatus,
  insertVoteConfiguration,
  insertVoteOption,
  castVote as insertVoteCast,
  insertVoteAction,
} from '../db/queries/votingQueries';
import { votesTable } from '../db/tables/votes';
import type { VoteRow } from '../db/tables/votes';
import { voteOptionsTable } from '../db/tables/voteOptions';

// Helper to get current user (mocked as user ID 1 for now)
const getCurrentUserId = () => 1;

// ============================================================================
// VOTE MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/votes - Create new vote (draft)
 */
export const createVoteHandler = http.post('/api/votes', async ({ request }) => {
  try {
    const payload = await request.json() as CreateVotePayload;
    const currentUserId = getCurrentUserId();
    const currentUserName = 'System User'; // TODO: Get from auth context

    // Create vote
    const newVote = createVote({
      entityType: payload.entityType,
      entityId: payload.entityId,
      meetingId: payload.meetingId,
      boardId: payload.boardId,
      title: payload.title,
      description: payload.description,
      status: 'draft',
      createdBy: currentUserId,
      createdByName: currentUserName,
      createdAt: new Date().toISOString(),
    });

    // Insert created action
    insertVoteAction(
      newVote.id,
      'created',
      currentUserId,
      currentUserName,
      {
        entityType: payload.entityType,
        entityId: payload.entityId,
      }
    );

    return HttpResponse.json(newVote, { status: 201 });
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to create vote', details: error },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/votes/:voteId/configure - Configure vote rules
 */
export const configureVoteHandler = http.put('/api/votes/:voteId/configure', async ({ params, request }) => {
  try {
    const { voteId } = params as { voteId: string };
    const payload = await request.json() as ConfigureVotePayload;
    const currentUserId = getCurrentUserId();
    const currentUserName = 'System User';

    // Validate vote exists
    const vote = votesTable.find((v) => v.id === voteId);
    if (!vote) {
      return HttpResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    // Check if configuration is allowed
    if (!canConfigure(voteId)) {
      return HttpResponse.json(
        { error: 'Cannot configure vote after it has been opened' },
        { status: 400 }
      );
    }

    // Insert configuration
    insertVoteConfiguration({
      voteId,
      votingMethod: payload.votingMethod,
      quorumRequired: payload.quorumRequired,
      quorumPercentage: payload.quorumPercentage,
      passThresholdPercentage: payload.passThresholdPercentage,
      passingRule: payload.passingRule,
      anonymous: payload.anonymous,
      allowAbstain: payload.allowAbstain,
      allowChangeVote: payload.allowChangeVote,
      timeLimit: payload.timeLimit,
      autoCloseWhenAllVoted: payload.autoCloseWhenAllVoted,
      createdAt: new Date().toISOString(),
    });

    // Create vote options
    if (payload.votingMethod === 'yes_no_abstain') {
      insertVoteOption({ voteId, label: 'Yes', displayOrder: 1 });
      insertVoteOption({ voteId, label: 'No', displayOrder: 2 });
      if (payload.allowAbstain) {
        insertVoteOption({ voteId, label: 'Abstain', displayOrder: 3 });
      }
    } else if (payload.votingMethod === 'yes_no') {
      insertVoteOption({ voteId, label: 'Yes', displayOrder: 1 });
      insertVoteOption({ voteId, label: 'No', displayOrder: 2 });
    } else if (payload.votingMethod === 'multiple_choice' && payload.customOptions) {
      payload.customOptions.forEach((option, index) => {
        insertVoteOption({ voteId, label: option, displayOrder: index + 1 });
      });
    }

    // Update vote status
    updateVoteStatus(voteId, 'configured');

    // Insert configured action
    insertVoteAction(
      voteId,
      'configured',
      currentUserId,
      currentUserName,
      {
        votingMethod: payload.votingMethod,
        quorumRequired: payload.quorumRequired,
        passingRule: payload.passingRule,
      }
    );

    // Return full vote detail
    const voteDetail = getVoteById(voteId);
    return HttpResponse.json(voteDetail);
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to configure vote', details: error },
      { status: 500 }
    );
  }
});

/**
 * POST /api/votes/:voteId/open - Open voting
 */
export const openVoteHandler = http.post('/api/votes/:voteId/open', async ({ params }) => {
  try {
    const { voteId } = params as { voteId: string };
    const currentUserId = getCurrentUserId();
    const currentUserName = 'System User';

    // Validate vote exists
    const vote = votesTable.find((v) => v.id === voteId);
    if (!vote) {
      return HttpResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    // Check if opening is allowed
    if (!canOpen(voteId)) {
      return HttpResponse.json(
        { error: 'Cannot open vote. Must be configured first.' },
        { status: 400 }
      );
    }

    // Update vote status
    updateVoteStatus(voteId, 'open');

    // Insert opened action
    const eligibility = getVoteById(voteId)?.eligibility || [];
    insertVoteAction(
      voteId,
      'opened',
      currentUserId,
      currentUserName,
      {
        totalEligible: eligibility.length,
      }
    );

    // Return full vote detail
    const voteDetail = getVoteById(voteId);
    return HttpResponse.json(voteDetail);
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to open vote', details: error },
      { status: 500 }
    );
  }
});

/**
 * POST /api/votes/:voteId/cast - Cast a vote
 */
export const castVoteHandler = http.post('/api/votes/:voteId/cast', async ({ params, request }) => {
  try {
    const { voteId } = params as { voteId: string };
    const payload = await request.json() as CastVotePayload;
    const currentUserId = getCurrentUserId();
    const currentUserName = 'System User';

    // Validate vote exists
    const vote = votesTable.find((v) => v.id === voteId);
    if (!vote) {
      return HttpResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    // Check if user can vote
    if (!canVote(voteId, currentUserId)) {
      return HttpResponse.json(
        { error: 'You are not eligible to vote or vote is not open' },
        { status: 403 }
      );
    }

    // Validate option exists
    const option = voteOptionsTable.find((o) => o.id === payload.optionId && o.voteId === voteId);
    if (!option) {
      return HttpResponse.json(
        { error: 'Invalid vote option' },
        { status: 400 }
      );
    }

    // Get configuration for anonymous setting
    const voteDetail = getVoteById(voteId);
    const isAnonymous = voteDetail?.configuration?.anonymous || false;

    // Insert vote cast
    insertVoteCast({
      voteId,
      optionId: payload.optionId,
      userId: isAnonymous ? null : currentUserId,
      userName: isAnonymous ? undefined : currentUserName,
      weightApplied: 1.0,
      castAt: new Date().toISOString(),
      ipAddress: '192.168.1.1', // Mock IP
      userAgent: 'Mock User Agent',
    });

    // Insert vote_cast action
    insertVoteAction(
      voteId,
      'vote_cast',
      currentUserId,
      currentUserName,
      {
        optionId: payload.optionId,
        weight: 1.0,
      }
    );

    // Return full vote detail
    const updatedVoteDetail = getVoteById(voteId);
    return HttpResponse.json(updatedVoteDetail);
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to cast vote', details: error },
      { status: 500 }
    );
  }
});

/**
 * POST /api/votes/:voteId/close - Close voting
 */
export const closeVoteHandler = http.post('/api/votes/:voteId/close', async ({ params, request }) => {
  try {
    const { voteId } = params as { voteId: string };
    const payload = await request.json() as CloseVotePayload | undefined;
    const currentUserId = getCurrentUserId();
    const currentUserName = 'System User';

    // Validate vote exists
    const vote = votesTable.find((v) => v.id === voteId);
    if (!vote) {
      return HttpResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    // Check if closing is allowed
    if (!canClose(voteId)) {
      return HttpResponse.json(
        { error: 'Cannot close vote. Vote is not open.' },
        { status: 400 }
      );
    }

    // Calculate results
    const results = calculateResults(voteId);

    // Update vote status with outcome
    updateVoteStatus(voteId, 'closed', results.outcome);

    // Insert closed action
    insertVoteAction(
      voteId,
      'closed',
      currentUserId,
      currentUserName,
      {
        reason: payload?.force ? 'Force closed by user' : 'Voting period ended',
      }
    );

    // Insert results_generated action
    insertVoteAction(
      voteId,
      'results_generated',
      currentUserId,
      currentUserName,
      {
        outcome: results.outcome,
        totalVoted: results.totalVoted,
        quorumMet: results.quorumMet,
      }
    );

    // Return full vote detail
    const voteDetail = getVoteById(voteId);
    return HttpResponse.json(voteDetail);
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to close vote', details: error },
      { status: 500 }
    );
  }
});

/**
 * POST /api/votes/:voteId/reopen - Reopen voting
 */
export const reopenVoteHandler = http.post('/api/votes/:voteId/reopen', async ({ params, request }) => {
  try {
    const { voteId } = params as { voteId: string };
    const payload = await request.json() as ReopenVotePayload;
    const currentUserId = getCurrentUserId();
    const currentUserName = 'System User';

    // Validate vote exists
    const vote = votesTable.find((v) => v.id === voteId);
    if (!vote) {
      return HttpResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    // Check if reopening is allowed
    if (!canReopen(voteId)) {
      return HttpResponse.json(
        { error: 'Cannot reopen vote. Vote must be closed first.' },
        { status: 400 }
      );
    }

    // Update vote status
    updateVoteStatus(voteId, 'open');

    // Insert reopened action
    insertVoteAction(
      voteId,
      'reopened',
      currentUserId,
      currentUserName,
      {
        reason: payload.reason,
      }
    );

    // Return full vote detail
    const voteDetail = getVoteById(voteId);
    return HttpResponse.json(voteDetail);
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to reopen vote', details: error },
      { status: 500 }
    );
  }
});

// ============================================================================
// QUERY ENDPOINTS
// ============================================================================

/**
 * GET /api/votes/:voteId - Get vote details
 */
export const getVoteHandler = http.get('/api/votes/:voteId', async ({ params }) => {
  try {
    const { voteId } = params as { voteId: string };
    const voteDetail = getVoteById(voteId);

    if (!voteDetail) {
      return HttpResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    return HttpResponse.json(voteDetail);
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to get vote', details: error },
      { status: 500 }
    );
  }
});

/**
 * GET /api/votes/:voteId/results - Get vote results
 */
export const getVoteResultsHandler = http.get('/api/votes/:voteId/results', async ({ params }) => {
  try {
    const { voteId } = params as { voteId: string };
    const results = calculateResults(voteId);

    return HttpResponse.json(results);
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to calculate results', details: error },
      { status: 500 }
    );
  }
});

/**
 * GET /api/votes/:voteId/actions - Get vote audit log
 */
export const getVoteActionsHandler = http.get('/api/votes/:voteId/actions', async ({ params }) => {
  try {
    const { voteId } = params as { voteId: string };
    const voteDetail = getVoteById(voteId);

    if (!voteDetail) {
      return HttpResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    return HttpResponse.json(voteDetail.actions);
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to get vote actions', details: error },
      { status: 500 }
    );
  }
});

/**
 * GET /api/entities/:entityType/:entityId/votes - Get votes for entity
 */
export const getEntityVotesHandler = http.get('/api/entities/:entityType/:entityId/votes', async ({ params }) => {
  try {
    const { entityType, entityId } = params as { entityType: string; entityId: string };
    const votes = getVotesByEntity(entityType as any, entityId);

    return HttpResponse.json(votes);
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to get entity votes', details: error },
      { status: 500 }
    );
  }
});

/**
 * GET /api/meetings/:meetingId/votes - Get all meeting votes
 */
export const getMeetingVotesHandler = http.get('/api/meetings/:meetingId/votes', async ({ params }) => {
  try {
    const { meetingId } = params as { meetingId: string };
    const votes = getVotesByMeeting(meetingId);

    return HttpResponse.json(votes);
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to get meeting votes', details: error },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/votes/:voteId - Delete vote (only if draft)
 */
export const deleteVoteHandler = http.delete('/api/votes/:voteId', async ({ params }) => {
  try {
    const { voteId } = params as { voteId: string };
    const voteIndex = votesTable.findIndex((v) => v.id === voteId);

    if (voteIndex === -1) {
      return HttpResponse.json({ error: 'Vote not found' }, { status: 404 });
    }

    const vote = votesTable[voteIndex];
    if (vote.status !== 'draft') {
      return HttpResponse.json(
        { error: 'Cannot delete vote. Only draft votes can be deleted.' },
        { status: 400 }
      );
    }

    // Remove vote
    votesTable.splice(voteIndex, 1);

    return HttpResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to delete vote', details: error },
      { status: 500 }
    );
  }
});

// ============================================================================
// EXPORT ALL HANDLERS
// ============================================================================

export const votingHandlers = [
  createVoteHandler,
  configureVoteHandler,
  openVoteHandler,
  castVoteHandler,
  closeVoteHandler,
  reopenVoteHandler,
  getVoteHandler,
  getVoteResultsHandler,
  getVoteActionsHandler,
  getEntityVotesHandler,
  getMeetingVotesHandler,
  deleteVoteHandler,
];
