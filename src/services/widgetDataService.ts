import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export interface UpcomingMeeting {
  id: string;
  title: string;
  committee: string;
  committeeId: string;
  date: Date;
  time: string;
  location: string;
  type: 'physical' | 'virtual';
  participants: number;
  status: 'today' | 'tomorrow' | 'upcoming';
  meetingLink?: string;
  hasAgenda: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'meeting' | 'document' | 'action' | 'decision' | 'member';
  title: string;
  description: string;
  user: {
    name: string;
    avatar: string;
  };
  timestamp: Date;
  committee?: string;
  metadata?: any;
}

export interface QuickStat {
  id: string;
  label: string;
  count: number;
  urgent?: number;
  linkTo: string;
}

// Generate upcoming meetings based on filters
export const getUpcomingMeetings = (
  orgId: string,
  committeeId: string = 'all',
  dateRange?: [Dayjs, Dayjs]
): UpcomingMeeting[] => {
  const committees = ['board', 'audit', 'finance', 'hr', 'governance'];
  const committeeNames: Record<string, string> = {
    board: 'Main Board',
    audit: 'Audit Committee',
    finance: 'Finance Committee',
    hr: 'HR Committee',
    governance: 'Governance Committee',
  };

  const meetings: UpcomingMeeting[] = [];
  const now = dayjs();

  // Generate meetings for next 2 weeks
  for (let i = 0; i < 7; i++) {
    const meetingDate = now.add(i, 'day');
    
    // Random number of meetings per day (0-2)
    const meetingsCount = Math.floor(Math.random() * 3);
    
    for (let j = 0; j < meetingsCount; j++) {
      const committee = committees[Math.floor(Math.random() * committees.length)];
      
      // Skip if filtering by specific committee
      if (committeeId !== 'all' && committee !== committeeId) continue;
      
      const hour = 9 + Math.floor(Math.random() * 7); // 9 AM to 4 PM
      const isVirtual = Math.random() > 0.4;
      
      let status: 'today' | 'tomorrow' | 'upcoming' = 'upcoming';
      if (i === 0) status = 'today';
      else if (i === 1) status = 'tomorrow';
      
      meetings.push({
        id: `meeting-${i}-${j}`,
        title: `${committeeNames[committee]} Meeting`,
        committee: committeeNames[committee],
        committeeId: committee,
        date: meetingDate.toDate(),
        time: `${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`,
        location: isVirtual ? 'Virtual' : `Boardroom ${Math.floor(Math.random() * 3) + 1}`,
        type: isVirtual ? 'virtual' : 'physical',
        participants: 5 + Math.floor(Math.random() * 10),
        status,
        meetingLink: isVirtual ? 'https://meet.example.com/...' : undefined,
        hasAgenda: Math.random() > 0.3,
      });
    }
  }

  // Sort by date
  meetings.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Limit to 6 meetings
  const limited = meetings.slice(0, 6);
  
  // Unused params
  void orgId;
  void dateRange;
  
  return limited;
};

// Generate recent activity feed
export const getRecentActivity = (
  orgId: string,
  committeeId: string = 'all',
  limit: number = 10
): ActivityItem[] => {
  const activities: ActivityItem[] = [];
  const activityTypes: ActivityItem['type'][] = ['meeting', 'document', 'action', 'decision', 'member'];
  const committees = ['Main Board', 'Audit Committee', 'Finance Committee', 'HR Committee'];
  const users = [
    { name: 'John Kamau', avatar: 'JK' },
    { name: 'Sarah Wanjiku', avatar: 'SW' },
    { name: 'David Omondi', avatar: 'DO' },
    { name: 'Grace Muthoni', avatar: 'GM' },
  ];

  const titles: Record<ActivityItem['type'], string[]> = {
    meeting: ['Meeting completed', 'Meeting scheduled', 'Meeting rescheduled', 'Meeting cancelled'],
    document: ['Document uploaded', 'Document shared', 'Document approved', 'Document reviewed'],
    action: ['Action item created', 'Action item completed', 'Action item assigned', 'Action item overdue'],
    decision: ['Decision made', 'Resolution passed', 'Motion approved', 'Vote completed'],
    member: ['Member added', 'Member removed', 'Role changed', 'Member invited'],
  };

  for (let i = 0; i < limit; i++) {
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const committee = committees[Math.floor(Math.random() * committees.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const titleOptions = titles[type];
    const title = titleOptions[Math.floor(Math.random() * titleOptions.length)];
    
    // Generate timestamp (last 7 days)
    const hoursAgo = Math.floor(Math.random() * 168); // 7 days
    const timestamp = dayjs().subtract(hoursAgo, 'hour').toDate();
    
    activities.push({
      id: `activity-${i}`,
      type,
      title,
      description: `${title} in ${committee}`,
      user,
      timestamp,
      committee,
    });
  }

  // Sort by timestamp (newest first)
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Filter by committee if specified
  const filtered = committeeId === 'all' 
    ? activities 
    : activities.filter(a => a.committee?.toLowerCase().includes(committeeId));
  
  // Unused param
  void orgId;
  
  return filtered.slice(0, limit);
};

// Generate quick stats
export const getQuickStats = (
  orgId: string,
  committeeId: string = 'all'
): QuickStat[] => {
  // Base multipliers for different committees
  const multipliers: Record<string, number> = {
    all: 1.0,
    board: 0.3,
    audit: 0.2,
    finance: 0.2,
    hr: 0.15,
    governance: 0.15,
  };
  
  const multiplier = multipliers[committeeId] || 0.1;
  
  const stats: QuickStat[] = [
    {
      id: 'meetings-week',
      label: 'Meetings this week',
      count: Math.round(5 * multiplier),
      linkTo: '/meetings',
    },
    {
      id: 'action-items',
      label: 'Pending action items',
      count: Math.round(12 * multiplier),
      urgent: Math.round(3 * multiplier),
      linkTo: '/actions',
    },
    {
      id: 'documents',
      label: 'Documents to review',
      count: Math.round(8 * multiplier),
      urgent: Math.round(2 * multiplier),
      linkTo: '/documents',
    },
    {
      id: 'votes',
      label: 'Active votes',
      count: Math.round(2 * multiplier),
      linkTo: '/votes',
    },
  ];
  
  // Unused param
  void orgId;
  
  return stats;
};
