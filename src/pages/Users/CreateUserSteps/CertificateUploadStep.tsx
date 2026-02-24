/**
 * CertificateUploadStep Component
 * Step 4: Upload digital certificate (conditional - only for board_secretary role)
 * Reusable in both Create and Edit user flows
 */

import React from 'react';
import { Typography, Alert, Form, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { CertificateUploadStepProps } from './types';

const { Title, Text } = Typography;

export const CertificateUploadStep: React.FC<CertificateUploadStepProps> = ({
  formData,
  onChange,
  form,
  mode = 'create',
}) => {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 8 }}>
          Digital Certificate
        </Title>
        <Text type="secondary">
          {mode === 'create'
            ? "Upload the user's digital certificate for document signing. This step is optional and can be completed later."
            : "Update or upload a new digital certificate for document signing."}
        </Text>
      </div>

      <Alert
        message={<span style={{ fontSize: 13, fontWeight: 600 }}>Certificate Requirements</span>}
        description={
          <span style={{ fontSize: 12 }}>
            Upload a valid .pfx or .p12 certificate file. The certificate will be used for digitally signing board documents and minutes.
          </span>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24, padding: '12px 16px' }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={formData}
        onValuesChange={(_, values) => onChange({ ...formData, ...values })}
      >
        <Form.Item
          label="Certificate File"
          name="certificate"
          valuePropName="file"
        >
          <Upload
            maxCount={1}
            accept=".pfx,.p12"
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />} size="middle">
              Select Certificate File
            </Button>
          </Upload>
        </Form.Item>

        <Alert
          message={<span style={{ fontSize: 13, fontWeight: 600 }}>Optional Step</span>}
          description={
            <span style={{ fontSize: 12 }}>
              {mode === 'create'
                ? "You can skip this step and upload the certificate later from the user's profile page."
                : "Leave empty to keep the existing certificate."}
            </span>
          }
          type="warning"
          showIcon
          style={{ padding: '12px 16px' }}
        />
      </Form>
    </div>
  );
};

export default CertificateUploadStep;
