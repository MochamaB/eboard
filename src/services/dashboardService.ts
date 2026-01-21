import type { Dayjs } from 'dayjs';

export interface DashboardMetrics {
  meetings: {
    total: number;
    trend: number;
    frequency: number;
    frequencyTrend: number;
    totalTime: number;
    totalTimeTrend: number;
    avgDuration: number;
    avgDurationTrend: number;
    noShows: number;
    noShowsTrend: number;
  };
  governance: {
    activeResolutions: number;
    resolutionsTrend: number;
    actionItemsRate: number;
    actionItemsRateTrend: number;
    quorumRate: number;
    quorumRateTrend: number;
    documentReviewRate: number;
    documentReviewRateTrend: number;
  };
}

// Mock data generator based on organization and committee
export const getDashboardMetrics = (
  orgId: string,
  committeeId: string = 'all',
  dateRange?: [Dayjs, Dayjs]
): DashboardMetrics => {
  // Calculate days in range to scale data
  const daysInRange = dateRange ? dateRange[1].diff(dateRange[0], 'day') + 1 : 30;
  const scaleFactor = daysInRange / 30; // Scale based on 30-day baseline
  // Base multipliers for different committees
  const committeeMultipliers: Record<string, number> = {
    all: 1.0,     // Full aggregate
    board: 0.3,   // ~30% of total (main board only)
    audit: 0.15,  // ~15% of total
    finance: 0.15,
    hr: 0.1,
    nomination: 0.1,
    governance: 0.1,
    risk: 0.1,
  };

  const multiplier = committeeMultipliers[committeeId] || 0.1;

  // Base metrics (for 'all' committees)
  const baseMetrics = {
    meetings: {
      total: 156,
      frequency: 8,
      totalTime: 9360, // minutes (156 hours)
      avgDuration: 56,
      noShows: 12,
    },
    governance: {
      activeResolutions: 24,
      actionItemsRate: 78,
      quorumRate: 92,
      documentReviewRate: 85,
    },
  };

  // Apply committee multiplier and date range scaling
  const scaled = {
    meetings: {
      total: Math.round(baseMetrics.meetings.total * multiplier * scaleFactor),
      frequency: Math.max(1, Math.round(baseMetrics.meetings.frequency * multiplier)),
      totalTime: Math.round(baseMetrics.meetings.totalTime * multiplier * scaleFactor),
      avgDuration: baseMetrics.meetings.avgDuration, // Duration stays same
      noShows: Math.round(baseMetrics.meetings.noShows * multiplier * scaleFactor),
    },
    governance: {
      activeResolutions: Math.round(baseMetrics.governance.activeResolutions * multiplier),
      actionItemsRate: baseMetrics.governance.actionItemsRate,
      quorumRate: baseMetrics.governance.quorumRate,
      documentReviewRate: baseMetrics.governance.documentReviewRate,
    },
  };
  
  // Unused params (kept for future API integration)
  void orgId;

  // Generate random trends (-20 to +20)
  const generateTrend = () => Math.round((Math.random() * 40) - 20);

  return {
    meetings: {
      total: scaled.meetings.total,
      trend: generateTrend(),
      frequency: scaled.meetings.frequency,
      frequencyTrend: generateTrend(),
      totalTime: scaled.meetings.totalTime,
      totalTimeTrend: generateTrend(),
      avgDuration: scaled.meetings.avgDuration,
      avgDurationTrend: generateTrend(),
      noShows: scaled.meetings.noShows,
      noShowsTrend: generateTrend(),
    },
    governance: {
      activeResolutions: scaled.governance.activeResolutions,
      resolutionsTrend: generateTrend(),
      actionItemsRate: scaled.governance.actionItemsRate,
      actionItemsRateTrend: generateTrend(),
      quorumRate: scaled.governance.quorumRate,
      quorumRateTrend: generateTrend(),
      documentReviewRate: scaled.governance.documentReviewRate,
      documentReviewRateTrend: generateTrend(),
    },
  };
};

// Helper to format minutes to hours
export const formatMinutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};
