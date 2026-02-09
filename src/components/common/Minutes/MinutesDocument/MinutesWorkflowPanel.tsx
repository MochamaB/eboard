/**
 * MinutesWorkflowPanel Component
 * Sidebar panel showing status, version, workflow info, and actions
 */

import React from 'react';
import { Space, Typography, Button, Tag, Divider, Alert } from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { MinutesStatusBadge } from '../MinutesStatusBadge';
import type { Minutes } from '../../../../types/minutes.types';

const { Text, Title } = Typography;

interface MinutesWorkflowPanelProps {
  minutes: Minutes;
  meetingTitle: string;
  archivedDate?: string;
  primaryColor?: string;
  showActions?: boolean;
  onDownloadPDF?: () => void;
  onPrint?: () => void;
}

export const MinutesWorkflowPanel: React.FC<MinutesWorkflowPanelProps> = ({
  minutes,
  meetingTitle,
  archivedDate,
  primaryColor = '#324721',
  showActions = true,
  onDownloadPDF,
  onPrint,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div style={{ position: 'sticky', top: 16 }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Title and Status */}
        <div>
          <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
            Meeting Minutes
          </Title>
          <MinutesStatusBadge status={minutes.status} size="default" />
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Archived Alert */}
        {archivedDate && (
          <Alert
            message="Archived Meeting - Read Only"
            description="This meeting has been archived. Minutes are in read-only mode and cannot be edited."
            type="info"
            showIcon
          />
        )}

        {/* Version Info */}
        {minutes.version && minutes.version > 1 && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: `${primaryColor}10`, 
            borderRadius: '6px',
            border: `1px solid ${primaryColor}30`,
          }}>
            <Space>
              <CheckCircleOutlined style={{ color: primaryColor }} />
              <div>
                <Text strong style={{ display: 'block', fontSize: '13px' }}>
                  Version {minutes.version}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Last updated {formatDate(minutes.updatedAt)}
                </Text>
              </div>
            </Space>
          </div>
        )}

        {/* Published Info */}
        {minutes.status === 'published' && minutes.publishedAt && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f6ffed', 
            borderRadius: '6px',
            border: '1px solid #b7eb8f',
          }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <div>
                <Text strong style={{ display: 'block', fontSize: '13px' }}>
                  Published
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatDate(minutes.publishedAt)} by User {minutes.publishedBy}
                </Text>
              </div>
            </Space>
          </div>
        )}

        {/* Archived Info */}
        {archivedDate && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Archived on: {formatDate(archivedDate)}
            </Text>
          </div>
        )}

        {/* Metadata */}
        <div>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>Minutes ID:</Text>
              <br />
              <Text style={{ fontSize: '13px' }}>{minutes.id}</Text>
            </div>
            {minutes.wordCount && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Word Count:</Text>
                <br />
                <Text style={{ fontSize: '13px' }}>{minutes.wordCount.toLocaleString()} words</Text>
              </div>
            )}
            {minutes.estimatedReadTime && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>Estimated Read Time:</Text>
                <br />
                <Text style={{ fontSize: '13px' }}>{minutes.estimatedReadTime} minutes</Text>
              </div>
            )}
          </Space>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <>
            <Divider style={{ margin: 0 }} />
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {onDownloadPDF && minutes.pdfUrl && (
                <Button
                  block
                  icon={<DownloadOutlined />}
                  onClick={onDownloadPDF}
                  style={{ 
                    borderColor: primaryColor,
                    color: primaryColor,
                  }}
                >
                  Download PDF
                </Button>
              )}
              <Button
                block
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Print Minutes
              </Button>
            </Space>
          </>
        )}
      </Space>
    </div>
  );
};

export default MinutesWorkflowPanel;
