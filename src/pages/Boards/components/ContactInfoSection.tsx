import React from 'react';
import { Form, Input, Typography, Divider, Space } from 'antd';
import type { FormInstance } from 'antd';

const { Title, Text } = Typography;

interface ContactInfoSectionProps {
  form: FormInstance;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ form }) => {
  return (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Contact Information</Title>
      <Text type="secondary">
        Provide contact details for this board. These details will be visible to members with appropriate permissions.
      </Text>
      <Divider />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Form.Item
          name="contactAddress"
          label="Street Address"
        >
          <Input placeholder="e.g., KTDA Plaza, Naivasha Road" />
        </Form.Item>

        <Form.Item
          name="contactPoBox"
          label="P.O. Box"
        >
          <Input placeholder="e.g., P.O. Box 30213" />
        </Form.Item>

        <Space size="middle" style={{ width: '100%' }}>
          <Form.Item
            name="contactCity"
            label="City"
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g., Nairobi" />
          </Form.Item>

          <Form.Item
            name="contactCountry"
            label="Country"
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g., Kenya" />
          </Form.Item>
        </Space>

        <Space size="middle" style={{ width: '100%' }}>
          <Form.Item
            name="contactPhone"
            label="Primary Phone"
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g., +254 20 1234567" />
          </Form.Item>

          <Form.Item
            name="contactPhoneAlt"
            label="Alternate Phone"
            style={{ flex: 1 }}
          >
            <Input placeholder="Optional alternate number" />
          </Form.Item>
        </Space>

        <Space size="middle" style={{ width: '100%' }}>
          <Form.Item
            name="contactEmail"
            label="Email"
            rules={[{ type: 'email', message: 'Enter a valid email address' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g., info@ktdateas.com" />
          </Form.Item>

          <Form.Item
            name="contactWebsite"
            label="Website"
            style={{ flex: 1 }}
          >
            <Input placeholder="e.g., https://www.ktdateas.com" />
          </Form.Item>
        </Space>
      </Space>
    </div>
  );
};

export default ContactInfoSection;
