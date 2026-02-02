/**
 * BoardPackStatusCell Component
 * Displays compact icons for Agenda, Documents, and Minutes status in meeting list
 * Each icon is clickable and navigates to the corresponding meeting tab
 */

import React from 'react';
import { Tooltip, Space } from 'antd';
import {
  FileTextOutlined,
  FolderOutlined,
  FormOutlined,
  CheckCircleFilled,
  EditFilled,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { BoardPackStatus, MeetingStatus } from '../../types/meeting.types';

interface BoardPackStatusCellProps {
  meetingId: string;
  boardId: string;
  boardPackStatus?: BoardPackStatus;
  meetingStatus: MeetingStatus;
}

type PackItemStatus = 'none' | 'draft' | 'published';

const getStatusIcon = (status: PackItemStatus) => {
  switch (status) {
    case 'published':
      return <CheckCircleFilled style={{ color: '#52c41a', fontSize: 10 }} />;
    case 'draft':
      return <EditFilled style={{ color: '#faad14', fontSize: 10 }} />;
    case 'none':
    default:
      return <MinusCircleOutlined style={{ color: '#d9d9d9', fontSize: 10 }} />;
  }
};

const getStatusColor = (status: PackItemStatus): string => {
  switch (status) {
    case 'published':
      return '#52c41a';
    case 'draft':
      return '#faad14';
    case 'none':
    default:
      return '#bfbfbf';
  }
};

const getStatusLabel = (status: PackItemStatus): string => {
  switch (status) {
    case 'published':
      return 'Published';
    case 'draft':
      return 'Draft';
    case 'none':
    default:
      return 'Not Created';
  }
};

export const BoardPackStatusCell: React.FC<BoardPackStatusCellProps> = ({
  meetingId,
  boardId,
  boardPackStatus,
  meetingStatus,
}) => {
  const navigate = useNavigate();

  const agendaStatus = boardPackStatus?.agenda?.status || 'none';
  const agendaItemCount = boardPackStatus?.agenda?.itemCount || 0;
  const documentCount = boardPackStatus?.documents?.count || 0;
  const minutesStatus = boardPackStatus?.minutes?.status || 'none';

  // Only show minutes for completed or in_progress meetings
  const showMinutes = meetingStatus === 'completed' || meetingStatus === 'in_progress';

  const handleClick = (tab: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${boardId}/meetings/${meetingId}?tab=${tab}`);
  };

  return (
    <Space size={8}>
      {/* Agenda */}
      <Tooltip
        title={
          <div>
            <div style={{ fontWeight: 500 }}>Agenda</div>
            <div>{getStatusLabel(agendaStatus)}</div>
            {agendaItemCount > 0 && <div>{agendaItemCount} items</div>}
          </div>
        }
      >
        <div
          onClick={handleClick('agenda')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: agendaStatus !== 'none' ? `${getStatusColor(agendaStatus)}15` : '#f5f5f5',
            border: `1px solid ${agendaStatus !== 'none' ? getStatusColor(agendaStatus) : '#e8e8e8'}`,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FileTextOutlined style={{ color: getStatusColor(agendaStatus), fontSize: 14 }} />
          {getStatusIcon(agendaStatus)}
        </div>
      </Tooltip>

      {/* Documents */}
      <Tooltip
        title={
          <div>
            <div style={{ fontWeight: 500 }}>Documents</div>
            <div>{documentCount} attached</div>
          </div>
        }
      >
        <div
          onClick={handleClick('documents')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: documentCount > 0 ? '#1890ff15' : '#f5f5f5',
            border: `1px solid ${documentCount > 0 ? '#1890ff' : '#e8e8e8'}`,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FolderOutlined style={{ color: documentCount > 0 ? '#1890ff' : '#bfbfbf', fontSize: 14 }} />
          <span style={{ 
            fontSize: 11, 
            fontWeight: 500, 
            color: documentCount > 0 ? '#1890ff' : '#bfbfbf',
            minWidth: 12,
            textAlign: 'center',
          }}>
            {documentCount}
          </span>
        </div>
      </Tooltip>

      {/* Minutes - only show for completed/in_progress meetings */}
      {showMinutes && (
        <Tooltip
          title={
            <div>
              <div style={{ fontWeight: 500 }}>Minutes</div>
              <div>{getStatusLabel(minutesStatus)}</div>
            </div>
          }
        >
          <div
            onClick={handleClick('minutes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: 4,
              backgroundColor: minutesStatus !== 'none' ? `${getStatusColor(minutesStatus)}15` : '#f5f5f5',
              border: `1px solid ${minutesStatus !== 'none' ? getStatusColor(minutesStatus) : '#e8e8e8'}`,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FormOutlined style={{ color: getStatusColor(minutesStatus), fontSize: 14 }} />
            {getStatusIcon(minutesStatus)}
          </div>
        </Tooltip>
      )}
    </Space>
  );
};

export default BoardPackStatusCell;
