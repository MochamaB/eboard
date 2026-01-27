import React from 'react';
import { Form, Typography, Divider, Space, Alert } from 'antd';
import type { FormInstance } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface BrandingStepProps {
  form: FormInstance;
  boardType?: string;
}

const BrandingStep: React.FC<BrandingStepProps> = ({
  form,
  boardType,
}) => {
  return (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Board Branding</Title>
      <Text type="secondary">
        Customize the visual identity for this board. These settings are optional and can be configured later.
      </Text>
      <Divider />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert
          message="Branding Customization"
          description={
            <div>
              <p style={{ marginBottom: 8 }}>
                This step allows you to customize the visual appearance of the board including:
              </p>
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>Logo uploads (main, small, dark, light variants)</li>
                <li>Primary and secondary brand colors</li>
                <li>Sidebar theme colors</li>
                <li>Typography preferences</li>
              </ul>
              <p style={{ marginTop: 12, marginBottom: 0 }}>
                <Text strong>Note:</Text> Branding configuration UI will be implemented in the next phase.
                For now, default KTDA branding will be applied and can be customized later through board settings.
              </p>
            </div>
          }
          type="info"
          showIcon
          icon={<BgColorsOutlined style={{ fontSize: 20 }} />}
        />

        <div style={{
          padding: 32,
          textAlign: 'center',
          backgroundColor: '#fafafa',
          borderRadius: 8,
          border: '1px dashed #d9d9d9',
        }}>
          <BgColorsOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <div>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Branding customization form coming soon...
            </Text>
          </div>
        </div>
      </Space>
    </div>
  );
};

export default BrandingStep;
