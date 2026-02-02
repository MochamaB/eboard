/**
 * NoticeMeetingDetails Component
 * Date, time, venue information in formal document style
 */

import React from 'react';
import { LOCATION_TYPE_LABELS } from '../../../types/meeting.types';
import type { LocationType } from '../../../types/meeting.types';
import dayjs from 'dayjs';

interface NoticeMeetingDetailsProps {
  startDate: string;
  startTime: string;
  duration: number;
  locationType: LocationType;
  locationDetails?: string;
  virtualMeetingLink?: string;
  quorumRequired: number;
  quorumPercentage: number;
  primaryColor?: string;
  compact?: boolean;
}

export const NoticeMeetingDetails: React.FC<NoticeMeetingDetailsProps> = ({
  startDate,
  startTime,
  duration,
  locationType,
  locationDetails,
  virtualMeetingLink,
  primaryColor = '#324721',
  compact = false,
}) => {
  const labelStyle: React.CSSProperties = {
    color: '#666',
    minWidth: compact ? 60 : 80,
    display: 'inline-block',
  };

  const valueStyle: React.CSSProperties = {
    color: primaryColor,
    fontWeight: 600,
  };

  return (
    <div
      className="notice-meeting-details"
      style={{
        marginBottom: compact ? 16 : 24,
        lineHeight: 1.8,
        fontSize: compact ? 13 : 14,
      }}
    >
      {/* Date */}
      <div>
        <span style={labelStyle}>Date:</span>
        <span style={valueStyle}>{dayjs(startDate).format('dddd, DD MMMM YYYY')}</span>
      </div>

      {/* Time */}
      <div>
        <span style={labelStyle}>Time:</span>
        <span style={valueStyle}>{startTime}</span>
        <span style={{ color: '#666' }}> ({duration} minutes)</span>
      </div>

      {/* Location */}
      <div>
        <span style={labelStyle}>Location:</span>
        <span style={valueStyle}>
          {LOCATION_TYPE_LABELS[locationType]}
          {locationDetails && ` - ${locationDetails}`}
        </span>
      </div>

      {/* Virtual Meeting Link */}
      {virtualMeetingLink && locationType !== 'physical' && (
        <div>
          <span style={labelStyle}>Join Link:</span>
          <span style={{ color: '#1890ff', wordBreak: 'break-all' }}>
            {virtualMeetingLink}
          </span>
        </div>
      )}
    </div>
  );
};

export default NoticeMeetingDetails;
