/**
 * NoticeAgenda Component
 * Agenda items in formal document style - numbered list with item numbers
 */

import React from 'react';
import type { AgendaItem } from '../../../types/agenda.types';

interface NoticeAgendaProps {
  agendaItems?: AgendaItem[];
  compact?: boolean;
}

export const NoticeAgenda: React.FC<NoticeAgendaProps> = ({
  agendaItems,
  compact = false,
}) => {
  if (!agendaItems || agendaItems.length === 0) {
    return null;
  }

  // Sort by orderIndex and filter only top-level items for main list
  const sortedItems = [...agendaItems].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="notice-agenda" style={{ marginBottom: compact ? 16 : 24 }}>
      <p style={{ marginBottom: 8 }}>
        The agenda for this meeting will include the following items:
      </p>
      <div style={{ paddingLeft: 8 }}>
        {sortedItems.map((item) => (
          <div
            key={item.id}
            style={{
              marginBottom: 4,
              fontSize: compact ? 13 : 14,
              paddingLeft: item.parentItemId ? 24 : 0,
            }}
          >
            <strong>{item.itemNumber}. {item.title}</strong>
            {item.estimatedDuration && (
              <span style={{ color: '#666', fontWeight: 'normal', marginLeft: 8 }}>
                ({item.estimatedDuration} min)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeAgenda;
