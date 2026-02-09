/**
 * Voting Query Functions
 * Helper functions for querying and manipulating voting data
 */

import { votesTable } from '../tables/votes';
import type { VoteRow } from '../tables/votes';
import { voteConfigurationsTable } from '../tables/voteConfigurations';
import type { VoteConfigurationRow } from '../tables/voteConfigurations';
import { voteOptionsTable } from '../tables/voteOptions';
import type { VoteOptionRow } from '../tables/voteOptions';
import { voteEligibilityTable } from '../tables/voteEligibility';
import { votesCastTable } from '../tables/votesCast';
import type { VoteCastRow } from '../tables/votesCast';
import { voteActionsTable } from '../tables/voteActions';
import type { VoteActionRow, VoteActionType } from '../tables/voteActions';
import { voteResultsTable, voteResultsSummariesTable } from '../tables/voteResults';
import type {
  Vote,
  VoteConfiguration,
  VoteOption,
  VoteEligibility,
  VoteCast,
  VoteAction,
  VoteResult,
  VoteResultsSummary,
  VoteWithResults,
  VoteDetail,
  VoteEntityType,
} from '../../../types/voting.types';
import { idsMatch } from '../utils/idUtils';

// ============================================================================
// BASIC QUERIES
// ============================================================================

/**
 * Get vote by ID (full details with all related data)
 */
export function getVoteById(voteId: string): VoteDetail | null {
  const vote = votesTable.find((v) => idsMatch(v.id, voteId));
  if (!vote) return null;

  const configuration = voteConfigurationsTable.find((c) => idsMatch(c.voteId, voteId));
  const options = voteOptionsTable.filter((o) => idsMatch(o.voteId, voteId));
  const eligibility = voteEligibilityTable.filter((e) => idsMatch(e.voteId, voteId));
  const votes = votesCastTable.filter((v) => idsMatch(v.voteId, voteId));
  const actions = voteActionsTable.filter((a) => idsMatch(a.voteId, voteId));
  const resultsSummary = voteResultsSummariesTable.find((r) => idsMatch(r.voteId, voteId));
  const results = voteResultsTable.filter((r) => idsMatch(r.voteId, voteId));

  return {
    ...vote,
    configuration,
    options,
    eligibility,
    votes: configuration?.anonymous ? undefined : votes, // Hide votes if anonymous
    resultsSummary: resultsSummary
      ? {
          ...resultsSummary,
          results,
        }
      : undefined,
    actions,
  } as VoteDetail;
}

/**
 * Get votes by entity (polymorphic)
 */
export function getVotesByEntity(entityType: VoteEntityType, entityId: string): Vote[] {
  return votesTable
    .filter((v) => v.entityType === entityType && idsMatch(v.entityId, entityId))
    .map((v) => v as Vote);
}

/**
 * Get all votes for a meeting
 */
export function getVotesByMeeting(meetingId: string): VoteWithResults[] {
  return votesTable
    .filter((v) => idsMatch(v.meetingId, meetingId))
    .map((vote) => {
      const configuration = voteConfigurationsTable.find((c) => idsMatch(c.voteId, vote.id));
      const options = voteOptionsTable.filter((o) => idsMatch(o.voteId, vote.id));
      const resultsSummary = voteResultsSummariesTable.find((r) => idsMatch(r.voteId, vote.id));
      const results = voteResultsTable.filter((r) => idsMatch(r.voteId, vote.id));

      return {
        ...vote,
        configuration,
        options,
        resultsSummary: resultsSummary
          ? {
              ...resultsSummary,
              results,
            }
          : undefined,
      } as VoteWithResults;
    });
}

/**
 * Get vote configuration
 */
export function getVoteConfiguration(voteId: string): VoteConfiguration | null {
  const config = voteConfigurationsTable.find((c) => idsMatch(c.voteId, voteId));
  return config ? (config as VoteConfiguration) : null;
}

/**
 * Get vote options
 */
export function getVoteOptions(voteId: string): VoteOption[] {
  return voteOptionsTable
    .filter((o) => idsMatch(o.voteId, voteId))
    .map((o) => o as VoteOption);
}

/**
 * Get vote eligibility
 */
export function getVoteEligibility(voteId: string): VoteEligibility[] {
  return voteEligibilityTable
    .filter((e) => idsMatch(e.voteId, voteId))
    .map((e) => e as VoteEligibility);
}

/**
 * Get votes cast
 */
export function getVotesCast(voteId: string): VoteCast[] {
  return votesCastTable
    .filter((v) => idsMatch(v.voteId, voteId))
    .map((v) => v as VoteCast);
}

/**
 * Get vote actions (audit log)
 */
export function getVoteActions(voteId: string): VoteAction[] {
  return voteActionsTable
    .filter((a) => idsMatch(a.voteId, voteId))
    .map((a) => a as VoteAction);
}

// ============================================================================
// VALIDATION & BUSINESS LOGIC
// ============================================================================

/**
 * Check if user is eligible to vote
 */
export function isUserEligible(voteId: string, userId: number): boolean {
  const eligibility = voteEligibilityTable.find(
    (e) => idsMatch(e.voteId, voteId) && e.userId === userId && e.eligible
  );
  return !!eligibility;
}

/**
 * Check if user has already voted
 */
export function hasUserVoted(voteId: string, userId: number): boolean {
  const vote = votesCastTable.find((v) => idsMatch(v.voteId, voteId) && v.userId === userId);
  return !!vote;
}

/**
 * Check if vote can be configured
 */
export function canConfigure(voteId: string): boolean {
  const vote = votesTable.find((v) => idsMatch(v.id, voteId));
  return vote?.status === 'draft';
}

/**
 * Check if vote can be opened
 */
export function canOpen(voteId: string): boolean {
  const vote = votesTable.find((v) => idsMatch(v.id, voteId));
  const hasConfig = voteConfigurationsTable.some((c) => idsMatch(c.voteId, voteId));
  return vote?.status === 'configured' && hasConfig;
}

/**
 * Check if user can vote
 */
export function canVote(voteId: string, userId: number): boolean {
  const vote = votesTable.find((v) => idsMatch(v.id, voteId));
  if (vote?.status !== 'open') return false;

  const eligible = isUserEligible(voteId, userId);
  if (!eligible) return false;

  const config = voteConfigurationsTable.find((c) => idsMatch(c.voteId, voteId));
  if (!config?.allowChangeVote && hasUserVoted(voteId, userId)) {
    return false;
  }

  return true;
}

/**
 * Check if vote can be closed
 */
export function canClose(voteId: string): boolean {
  const vote = votesTable.find((v) => idsMatch(v.id, voteId));
  return vote?.status === 'open';
}

/**
 * Check if vote can be reopened
 */
export function canReopen(voteId: string): boolean {
  const vote = votesTable.find((v) => idsMatch(v.id, voteId));
  return vote?.status === 'closed';
}

// ============================================================================
// RESULT CALCULATION
// ============================================================================

/**
 * Calculate vote results from votes_cast
 */
export function calculateResults(voteId: string): VoteResultsSummary {
  const vote = votesTable.find((v) => idsMatch(v.id, voteId));
  const config = voteConfigurationsTable.find((c) => idsMatch(c.voteId, voteId));
  const options = voteOptionsTable.filter((o) => idsMatch(o.voteId, voteId));
  const eligibility = voteEligibilityTable.filter((e) => idsMatch(e.voteId, voteId) && e.eligible);
  const votes = votesCastTable.filter((v) => idsMatch(v.voteId, voteId));

  if (!vote || !config) {
    throw new Error('Vote or configuration not found');
  }

  const totalEligible = eligibility.length;
  const totalVoted = votes.length;
  const totalWeight = votes.reduce((sum, v) => sum + v.weightApplied, 0);

  // Calculate quorum
  const quorumRequired = config.quorumRequired
    ? Math.ceil((totalEligible * config.quorumPercentage) / 100)
    : 0;
  const quorumMet = !config.quorumRequired || totalVoted >= quorumRequired;

  // Calculate results per option
  const results: VoteResult[] = options.map((option) => {
    const optionVotes = votes.filter((v) => idsMatch(v.optionId, option.id));
    const optionWeight = optionVotes.reduce((sum, v) => sum + v.weightApplied, 0);
    const voteCount = optionVotes.length;

    // Calculate percentage (exclude abstain from denominator for yes_no_abstain)
    let percentage = 0;
    if (config.votingMethod === 'yes_no_abstain') {
      const abstainOption = options.find((o) => o.label.toLowerCase() === 'abstain');
      const abstainVotes = votes.filter((v) => abstainOption && idsMatch(v.optionId, abstainOption.id));
      const decisiveVotes = totalVoted - abstainVotes.length;

      if (decisiveVotes > 0 && option.id !== abstainOption?.id) {
        percentage = (voteCount / decisiveVotes) * 100;
      }
    } else {
      percentage = totalVoted > 0 ? (voteCount / totalVoted) * 100 : 0;
    }

    return {
      voteId,
      optionId: option.id,
      optionLabel: option.label,
      totalWeight: optionWeight,
      voteCount,
      percentage,
      isWinner: false, // Will be set below
    };
  });

  // Determine winner (for yes_no and yes_no_abstain, it's the Yes option)
  let outcome: 'passed' | 'failed' | 'invalid' = 'invalid';

  if (!quorumMet) {
    outcome = 'invalid';
  } else {
    const yesOption = results.find((r) => r.optionLabel.toLowerCase() === 'yes');
    if (yesOption) {
      const passed = yesOption.percentage >= config.passThresholdPercentage;
      outcome = passed ? 'passed' : 'failed';
      yesOption.isWinner = passed;
    } else {
      // For multiple choice, find option with highest percentage
      const winner = results.reduce((max, r) => (r.percentage > max.percentage ? r : max), results[0]);
      if (winner && winner.percentage >= config.passThresholdPercentage) {
        winner.isWinner = true;
        outcome = 'passed';
      } else {
        outcome = 'failed';
      }
    }
  }

  return {
    totalEligible,
    totalVoted,
    totalWeight,
    quorumRequired,
    quorumMet,
    thresholdPercentage: config.passThresholdPercentage,
    outcome,
    results,
    computedAt: new Date().toISOString(),
  };
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Insert vote action (audit log)
 */
export function insertVoteAction(
  voteId: string,
  actionType: VoteActionType,
  performedBy: number,
  performedByName: string,
  metadata?: Record<string, any>
): VoteActionRow {
  const action: VoteActionRow = {
    id: `action-${voteId}-${Date.now()}`,
    voteId,
    actionType,
    performedBy,
    performedByName,
    metadata,
    createdAt: new Date().toISOString(),
  };

  voteActionsTable.push(action);
  return action;
}

/**
 * Create vote
 */
export function createVote(vote: Omit<VoteRow, 'id'>): VoteRow {
  const newVote: VoteRow = {
    id: `vote-${Date.now()}`,
    ...vote,
  };

  votesTable.push(newVote);
  return newVote;
}

/**
 * Update vote status
 */
export function updateVoteStatus(
  voteId: string,
  status: VoteRow['status'],
  outcome?: VoteRow['outcome']
): void {
  const vote = votesTable.find((v) => idsMatch(v.id, voteId));
  if (vote) {
    vote.status = status;
    if (outcome) vote.outcome = outcome;

    // Update timestamps
    if (status === 'open') {
      vote.openedAt = new Date().toISOString();
    } else if (status === 'closed') {
      vote.closedAt = new Date().toISOString();
    }
  }
}

/**
 * Insert vote configuration
 */
export function insertVoteConfiguration(config: Omit<VoteConfigurationRow, 'id'>): VoteConfigurationRow {
  const newConfig: VoteConfigurationRow = {
    id: `config-${Date.now()}`,
    ...config,
  };

  voteConfigurationsTable.push(newConfig);
  return newConfig;
}

/**
 * Insert vote option
 */
export function insertVoteOption(option: Omit<VoteOptionRow, 'id'>): VoteOptionRow {
  const newOption: VoteOptionRow = {
    id: `opt-${Date.now()}`,
    ...option,
  };

  voteOptionsTable.push(newOption);
  return newOption;
}

/**
 * Insert vote cast
 */
export function castVote(voteCast: Omit<VoteCastRow, 'id'>): VoteCastRow {
  const newVote: VoteCastRow = {
    id: `cast-${Date.now()}`,
    ...voteCast,
  };

  votesCastTable.push(newVote);
  return newVote;
}

/**
 * Clear votes cast (for reopen)
 */
export function clearVotesCast(voteId: string): void {
  const index = votesCastTable.findIndex((v) => idsMatch(v.voteId, voteId));
  if (index !== -1) {
    votesCastTable.splice(index, votesCastTable.filter((v) => idsMatch(v.voteId, voteId)).length);
  }
}
