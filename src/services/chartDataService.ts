import type { Dayjs } from 'dayjs';

export interface MeetingTrendsData {
  date: string;
  count: number;
}

export interface DistributionData {
  category: string;
  value: number;
  percentage: number;
}

// Generate meeting trends data based on period and filters
export const getMeetingTrendsData = (
  orgId: string,
  committeeId: string = 'all',
  dateRange: [Dayjs, Dayjs],
  period: 'day' | 'week' | 'month' = 'month'
): MeetingTrendsData[] => {
  const [startDate, endDate] = dateRange;
  const data: MeetingTrendsData[] = [];
  
  // Committee multipliers (same as dashboardService)
  const committeeMultipliers: Record<string, number> = {
    all: 1.0,
    board: 0.3,
    audit: 0.15,
    finance: 0.15,
    hr: 0.1,
    nomination: 0.1,
    governance: 0.1,
    risk: 0.1,
  };
  
  const multiplier = committeeMultipliers[committeeId] || 0.05;
  
  // Base meeting count per period
  const baseCounts = {
    day: 2,
    week: 8,
    month: 30,
  };
  
  const baseCount = baseCounts[period];
  
  // Determine number of data points
  let current = startDate.clone();
  const points: Dayjs[] = [];
  
  while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
    points.push(current.clone());
    
    if (period === 'day') {
      current = current.add(1, 'day');
    } else if (period === 'week') {
      current = current.add(1, 'week');
    } else {
      current = current.add(1, 'month');
    }
    
    // Limit to reasonable number of points
    if (points.length > 50) break;
  }
  
  // Generate realistic trends with some variation
  points.forEach((point, index) => {
    // Add seasonal variation and growth trend
    const seasonalFactor = 1 + (Math.sin(index / points.length * Math.PI * 2) * 0.2);
    const growthFactor = 1 + (index / points.length * 0.3); // 30% growth over period
    const randomVariation = 0.8 + (Math.random() * 0.4); // +/- 20%
    
    const count = Math.round(
      baseCount * multiplier * seasonalFactor * growthFactor * randomVariation
    );
    
    data.push({
      date: point.format(period === 'day' ? 'MMM DD' : period === 'week' ? 'MMM DD' : 'MMM YYYY'),
      count: Math.max(1, count),
    });
  });
  
  // Unused param (kept for future API integration)
  void orgId;
  
  return data;
};

// Generate meeting length distribution data
export const getMeetingDistribution = (
  orgId: string,
  committeeId: string = 'all',
  dateRange?: [Dayjs, Dayjs]
): DistributionData[] => {
  // Committee affects distribution patterns
  const isBoard = committeeId === 'board';
  const isAll = committeeId === 'all';
  
  // Board meetings tend to be longer, committees more varied
  let distribution = isBoard
    ? [
        { category: '0-15 min', value: 10, percentage: 10 },
        { category: '15-30 min', value: 20, percentage: 20 },
        { category: '30-60 min', value: 35, percentage: 35 },
        { category: '60+ min', value: 35, percentage: 35 },
      ]
    : isAll
    ? [
        { category: '0-15 min', value: 25, percentage: 25 },
        { category: '15-30 min', value: 40, percentage: 40 },
        { category: '30-60 min', value: 25, percentage: 25 },
        { category: '60+ min', value: 10, percentage: 10 },
      ]
    : [
        { category: '0-15 min', value: 30, percentage: 30 },
        { category: '15-30 min', value: 45, percentage: 45 },
        { category: '30-60 min', value: 20, percentage: 20 },
        { category: '60+ min', value: 5, percentage: 5 },
      ];
  
  // Add slight random variation
  distribution = distribution.map(item => {
    const variation = 0.9 + (Math.random() * 0.2); // +/- 10%
    const newValue = Math.round(item.value * variation);
    return {
      ...item,
      value: newValue,
    };
  });
  
  // Recalculate percentages to sum to 100
  const total = distribution.reduce((sum, item) => sum + item.value, 0);
  distribution = distribution.map(item => ({
    ...item,
    percentage: Math.round((item.value / total) * 100),
  }));
  
  // Unused params (kept for future API integration)
  void orgId;
  void dateRange;
  
  return distribution;
};
