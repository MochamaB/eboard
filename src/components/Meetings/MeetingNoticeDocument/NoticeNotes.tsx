/**
 * NoticeNotes Component
 * Custom notes/instructions section
 */

import React from 'react';
import { Typography, Divider } from 'antd';

const { Text } = Typography;

interface NoticeNotesProps {
  notes?: string | string[];
  primaryColor?: string;
  compact?: boolean;
}

export const NoticeNotes: React.FC<NoticeNotesProps> = ({
  notes,
  primaryColor = '#324721',
  compact = false,
}) => {
  if (!notes || (Array.isArray(notes) && notes.length === 0)) {
    return null;
  }

  const notesList = Array.isArray(notes) ? notes : [notes];

  return (
    <div className="notice-notes">
      <Divider
        style={{ 
          color: primaryColor, 
          borderColor: primaryColor,
          fontSize: compact ? 13 : 14,
        }}
      >
        Notes
      </Divider>
      <ul
        style={{
          paddingLeft: 24,
          marginBottom: 24,
        }}
      >
        {notesList.map((note, index) => (
          <li
            key={index}
            style={{
              marginBottom: 6,
              fontSize: compact ? 13 : 14,
            }}
          >
            <Text>{note}</Text>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoticeNotes;
