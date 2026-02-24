import React, { useMemo } from 'react';
import { Form, Typography, Divider, InputNumber, Select, Switch, Space, Row, Col, Spin, Card } from 'antd';
import type { FormInstance } from 'antd';
import type { BoardSettings } from '../../../types/board.types';
import { useLookups } from '../../../contexts/LookupsContext';
import { useRolesByPermission } from '../../../hooks/api/useLookups';

const { Title, Text } = Typography;

interface BoardSettingsStepProps {
  form: FormInstance;
  boardType?: string;
  defaultSettings: Partial<BoardSettings>;
}

const BoardSettingsStep: React.FC<BoardSettingsStepProps> = ({
  form,
  boardType,
  defaultSettings,
}) => {
  const { meetingFrequencyOptions, votingThresholdOptions, isLoading } = useLookups();

  // Fetch roles with meetings.approve permission for the approver dropdown
  const { data: approverRoles = [], isLoading: loadingApproverRoles } = useRolesByPermission('meetings.approve');

  // Convert approver roles to select options
  const approverRoleOptions = useMemo(() => {
    return approverRoles.map(role => ({
      value: role.code,
      label: role.name,
    }));
  }, [approverRoles]);

  if (isLoading || loadingApproverRoles) {
    return <Spin tip="Loading settings options..." />;
  }

  return (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Board Settings</Title>
      <Text type="secondary">
        Configure governance rules and meeting requirements for this board.
      </Text>
      <Divider />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Quorum Percentage */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="quorumPercentage"
              label="Quorum Percentage"
              rules={[
                { required: true, message: 'Please enter quorum percentage' },
                { type: 'number', min: 1, max: 100, message: 'Must be between 1 and 100' }
              ]}
              tooltip="Percentage of members required to be present for a valid meeting"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={100}
                formatter={value => `${value}%`}
                parser={value => value?.replace('%', '') as any}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="minMeetingsPerYear"
              label="Min Meetings Per Year"
              rules={[
                { required: true, message: 'Please enter minimum meetings' },
                { type: 'number', min: 1, max: 52, message: 'Must be between 1 and 52' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={52}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Meeting Frequency */}
        <Form.Item
          name="meetingFrequency"
          label="Meeting Frequency"
          rules={[{ required: true, message: 'Please select meeting frequency' }]}
          tooltip="How often regular board meetings should be held"
        >
          <Select
            placeholder="Select meeting frequency"
            options={meetingFrequencyOptions}
          />
        </Form.Item>

        {/* Voting Threshold */}
        <Form.Item
          name="votingThreshold"
          label="Voting Threshold"
          rules={[{ required: true, message: 'Please select voting threshold' }]}
          tooltip="Required percentage or unanimity for decisions to pass"
        >
          <Select
            placeholder="Select voting threshold"
            options={votingThresholdOptions}
          />
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />

        {/* Confirmation Settings */}
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="confirmationRequired"
              label="Require Confirmation"
              valuePropName="checked"
              tooltip="Require designated approver to confirm meeting minutes"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'right', paddingTop: 30 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {form.getFieldValue('confirmationRequired') ? 'Enabled' : 'Disabled'}
              </Text>
            </div>
          </Col>
        </Row>

        {/* Designated Approver Role (conditional) */}
        {form.getFieldValue('confirmationRequired') && (
          <Form.Item
            name="designatedApproverRole"
            label="Designated Approver Role"
            rules={[
              {
                required: form.getFieldValue('confirmationRequired'),
                message: 'Please select an approver role'
              }
            ]}
            tooltip="Role that can approve meeting minutes. Only roles with meetings.approve permission are shown."
          >
            <Select
              placeholder="Select approver role"
              options={approverRoleOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* Virtual Meetings */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="allowVirtualMeetings"
              label="Allow Virtual Meetings"
              valuePropName="checked"
              tooltip="Enable online/hybrid meeting options"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="requireAttendanceTracking"
              label="Track Attendance"
              valuePropName="checked"
              tooltip="Require attendance records for all meetings"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        {/* Override Permissions */}
        <Card size="small" title="Secretary Override Permissions" style={{ marginBottom: 0 }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="allowSecretarySkipAgenda"
                  label="Skip Agenda Items"
                  valuePropName="checked"
                  tooltip="Allow secretary to skip agenda items during meetings"
                  style={{ marginBottom: 8 }}
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="allowSecretarySkipDocuments"
                  label="Skip Documents"
                  valuePropName="checked"
                  tooltip="Allow secretary to skip document requirements"
                  style={{ marginBottom: 8 }}
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="requireApprovalForOverrides"
              label="Require Approval for Overrides"
              valuePropName="checked"
              tooltip="Require chairman approval when secretary uses override permissions"
              style={{ marginBottom: 0 }}
            >
              <Switch />
            </Form.Item>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default BoardSettingsStep;
