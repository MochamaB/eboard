import React, { useEffect } from 'react';
import { Form, Button, Space, Typography, message, Card, Alert, Upload, Input, Divider, Row, Col } from 'antd';
import { SaveOutlined, UploadOutlined, BgColorsOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

import type { Board } from '../../../types/board.types';
import { useBoardContext } from '../../../contexts';

const { Title, Text } = Typography;

interface BrandingTabProps {
  board: Board;
}

export const BrandingTab: React.FC<BrandingTabProps> = ({ board }) => {
  const { theme } = useBoardContext();
  const [form] = Form.useForm();

  // Initialize form with board branding
  useEffect(() => {
    if (board.branding) {
      form.setFieldsValue({
        logoUrl: board.branding.logo?.main,
        primaryColor: board.branding.primaryColor,
        secondaryColor: board.branding.secondaryColor,
        accentColor: board.branding.accentColor,
      });
    }
  }, [board.branding, form]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // TODO: Call API to update board branding
      console.log('Updated branding:', values);
      message.success('Board branding updated successfully');
    } catch (error) {
      message.error('Please fix the validation errors');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 900 }}>
        {/* Header */}
        <div>
          <Title level={4} style={{ margin: 0 }}>Board Branding</Title>
          <Text type="secondary">
            Customize the visual identity for {board.name}
          </Text>
        </div>

        {/* Info Alert */}
        <Alert
          message="Branding Customization"
          description={
            board.type === 'main'
              ? 'Main board branding will be used as default for all subsidiary boards and committees unless overridden.'
              : board.type === 'subsidiary'
              ? 'Subsidiary branding can be customized independently or inherit from the main board.'
              : 'Committees and factories inherit branding from their parent board.'
          }
          type="info"
          showIcon
          icon={<BgColorsOutlined />}
        />

        <Divider style={{ margin: 0 }} />

        {/* Branding Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={24}>
            {/* Logo Upload */}
            <Col span={24}>
              <Card title="Logo" size="small" style={{ marginBottom: 24 }}>
                <Form.Item
                  name="logoUrl"
                  label="Board Logo"
                  extra="Recommended size: 200x200px, PNG or SVG format"
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Card>
            </Col>

            {/* Color Scheme */}
            <Col span={24}>
              <Card title="Color Scheme" size="small">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="primaryColor"
                      label="Primary Color"
                      rules={[
                        { required: true, message: 'Please enter primary color' },
                        { pattern: /^#[0-9A-F]{6}$/i, message: 'Invalid hex color' }
                      ]}
                    >
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          placeholder="#324721"
                          maxLength={7}
                        />
                        <Input
                          type="color"
                          style={{ width: 60 }}
                          onChange={(e) => form.setFieldValue('primaryColor', e.target.value)}
                        />
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="secondaryColor"
                      label="Secondary Color"
                      rules={[
                        { required: true, message: 'Please enter secondary color' },
                        { pattern: /^#[0-9A-F]{6}$/i, message: 'Invalid hex color' }
                      ]}
                    >
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          placeholder="#ffaf00"
                          maxLength={7}
                        />
                        <Input
                          type="color"
                          style={{ width: 60 }}
                          onChange={(e) => form.setFieldValue('secondaryColor', e.target.value)}
                        />
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="accentColor"
                      label="Accent Color"
                      rules={[
                        { pattern: /^#[0-9A-F]{6}$/i, message: 'Invalid hex color' }
                      ]}
                    >
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          placeholder="#3577f1"
                          maxLength={7}
                        />
                        <Input
                          type="color"
                          style={{ width: 60 }}
                          onChange={(e) => form.setFieldValue('accentColor', e.target.value)}
                        />
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Preview */}
            <Col span={24}>
              <Card title="Preview" size="small">
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <Text type="secondary">
                    Theme preview will be displayed here
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Actions */}
          <Divider />
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
              >
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  if (board.branding) {
                    form.setFieldsValue({
                      logoUrl: board.branding.logo?.main,
                      primaryColor: board.branding.primaryColor,
                      secondaryColor: board.branding.secondaryColor,
                      accentColor: board.branding.accentColor,
                    });
                  }
                  message.info('Changes discarded');
                }}
              >
                Reset
              </Button>
              {board.type !== 'main' && (
                <Button
                  onClick={() => {
                    // TODO: Reset to parent branding
                    message.info('Reset to parent branding');
                  }}
                >
                  Reset to Parent Branding
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
};

export default BrandingTab;
