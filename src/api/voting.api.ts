/**
 * Voting API Client
 * RESTful API endpoints for voting and polling
 */

import apiClient from './client';
import type {
  Vote,
  VoteDetail,
  VoteWithResults,
  VoteAction,
  VoteResultsSummary,
  CreateVotePayload,
  ConfigureVotePayload,
  OpenVotePayload,
  CastVotePayload,
  CloseVotePayload,
  ReopenVotePayload,
  VoteEntityType,
} from '../types/voting.types';

/**
 * Create a new vote (draft status)
 */
export async function createVote(payload: CreateVotePayload): Promise<Vote> {
  const response = await apiClient.post<Vote>('/votes', payload);
  return response.data;
}

/**
 * Configure vote rules (must be in draft status)
 */
export async function configureVote(
  voteId: string,
  payload: ConfigureVotePayload
): Promise<VoteDetail> {
  const response = await apiClient.put<VoteDetail>(
    `/votes/${voteId}/configure`,
    payload
  );
  return response.data;
}

/**
 * Open voting (start accepting votes)
 */
export async function openVote(
  voteId: string,
  payload?: OpenVotePayload
): Promise<VoteDetail> {
  const response = await apiClient.post<VoteDetail>(
    `/votes/${voteId}/open`,
    payload || {}
  );
  return response.data;
}

/**
 * Cast a vote
 */
export async function castVote(
  voteId: string,
  payload: CastVotePayload
): Promise<VoteDetail> {
  const response = await apiClient.post<VoteDetail>(
    `/votes/${voteId}/cast`,
    payload
  );
  return response.data;
}

/**
 * Close voting (stop accepting votes)
 */
export async function closeVote(
  voteId: string,
  payload?: CloseVotePayload
): Promise<VoteDetail> {
  const response = await apiClient.post<VoteDetail>(
    `/votes/${voteId}/close`,
    payload || { force: false }
  );
  return response.data;
}

/**
 * Reopen voting (requires reason for audit)
 */
export async function reopenVote(
  voteId: string,
  payload: ReopenVotePayload
): Promise<VoteDetail> {
  const response = await apiClient.post<VoteDetail>(
    `/votes/${voteId}/reopen`,
    payload
  );
  return response.data;
}

/**
 * Get vote details by ID
 */
export async function getVote(voteId: string): Promise<VoteDetail> {
  const response = await apiClient.get<VoteDetail>(`/votes/${voteId}`);
  return response.data;
}

/**
 * Get vote results
 */
export async function getVoteResults(voteId: string): Promise<VoteResultsSummary> {
  const response = await apiClient.get<VoteResultsSummary>(
    `/votes/${voteId}/results`
  );
  return response.data;
}

/**
 * Get vote audit log
 */
export async function getVoteActions(voteId: string): Promise<VoteAction[]> {
  const response = await apiClient.get<VoteAction[]>(
    `/votes/${voteId}/actions`
  );
  return response.data;
}

/**
 * Get votes for a specific entity (polymorphic)
 */
export async function getEntityVotes(
  entityType: VoteEntityType,
  entityId: string
): Promise<Vote[]> {
  const response = await apiClient.get<Vote[]>(
    `/entities/${entityType}/${entityId}/votes`
  );
  return response.data;
}

/**
 * Get all votes for a meeting
 */
export async function getMeetingVotes(meetingId: string): Promise<VoteWithResults[]> {
  const response = await apiClient.get<VoteWithResults[]>(
    `/meetings/${meetingId}/votes`
  );
  return response.data;
}

/**
 * Delete a vote (only if in draft status)
 */
export async function deleteVote(voteId: string): Promise<void> {
  await apiClient.delete(`/votes/${voteId}`);
}
