/**
 * Meeting Documents Tab
 * Placeholder for document management functionality
 */

import React from 'react';
import { Empty, Card, Typography, Space, Button } from 'antd';
import {
  FolderOpenOutlined,
  UploadOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { Meeting } from '../../../types/meeting.types';

const { Text, Title } = Typography;

interface MeetingDocumentsTabProps {
  meeting: Meeting;
  themeColor?: string;
}

export const MeetingDocumentsTab: React.FC<MeetingDocumentsTabProps> = ({
  themeColor = '#1890ff',
}) => {
  return (
    <div style={{ padding: '8px 0' }}>
      <Card>
        <Empty
          image={<FolderOpenOutlined style={{ fontSize: 64, color: themeColor, opacity: 0.5 }} />}
          description={
            <Space direction="vertical" size={8} style={{ marginTop: 16 }}>
              <Title level={5} style={{ marginBottom: 0 }}>
                Document Management
              </Title>
              <Text type="secondary">
                Upload and manage meeting documents, board packs, and supporting materials.
              </Text>
              <Space style={{ marginTop: 16 }}>
                <ToolOutlined style={{ color: '#faad14' }} />
                <Text type="warning">This feature is under development</Text>
              </Space>
            </Space>
          }
        >
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            disabled
            style={{ backgroundColor: themeColor, borderColor: themeColor }}
          >
            Upload Document
          </Button>
        </Empty>
      </Card>

      {/* Planned Features */}
      <Card title="Planned Features" size="small" style={{ marginTop: 16 }}>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li><Text>Upload meeting documents and board packs</Text></li>
          <li><Text>Categorize documents (agenda, minutes, presentations)</Text></li>
          <li><Text>Version control for document updates</Text></li>
          <li><Text>Access control based on participant roles</Text></li>
          <li><Text>Document annotations and comments</Text></li>
          <li><Text>Secure document viewing with watermarks</Text></li>
        </ul>
      </Card>
    </div>
  );
};

export default MeetingDocumentsTab;
