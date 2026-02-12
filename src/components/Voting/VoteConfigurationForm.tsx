/**
 * Vote Configuration Form Component
 * Reusable form for configuring vote rules and settings
 */

import React from 'react';
import { Form, Input, InputNumber, Button, Checkbox, Select, Space, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../contexts';
import type { ConfigureVotePayload } from '../../types/voting.types';

const { Option } = Select;

interface VoteConfigurationFormProps {
  voteId?: string;
  initialValues?: Partial<ConfigureVotePayload>;
  onSubmit: (values: ConfigureVotePayload) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const VoteConfigurationForm: React.FC<VoteConfigurationFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm<ConfigureVotePayload>();
  const { theme } = useBoardContext();

  const votingMethod = Form.useWatch('votingMethod', form);
  const quorumRequired = Form.useWatch('quorumRequired', form);
  const passingRule = Form.useWatch('passingRule', form);


  // Calculate passing percentage based on rule
  const getPassingPercentage = (rule: string): number => {
    const percentages: Record<string, number> = {
      simple_majority: 50,
      two_thirds: 66.67,
      three_quarters: 75,
      unanimous: 100,
    };
    return percentages[rule] || 50;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        votingMethod: 'yes_no_abstain',
        quorumRequired: true,
        quorumPercentage: 50,
        passingRule: 'simple_majority',
        passThresholdPercentage: 50,
        anonymous: false,
        allowAbstain: true,
        allowChangeVote: false,
        timeLimit: undefined,
        autoCloseWhenAllVoted: true,
        ...initialValues,
      }}
      onFinish={onSubmit}
    >
      

      <Form.Item
        name="votingMethod"
        label="Voting Method"
        rules={[{ required: true, message: 'Please select a voting method' }]}
      >
        <Select placeholder="Select voting method">
          <Option value="yes_no">Yes / No</Option>
          <Option value="yes_no_abstain">Yes / No / Abstain</Option>
          <Option value="multiple_choice">Multiple Choice</Option>
          <Option value="ranked">Ranked Choice (Future)</Option>
        </Select>
      </Form.Item>

      {/* Custom Options for Multiple Choice */}
      {votingMethod === 'multiple_choice' && (
        <Form.List name="customOptions">
          {(fields, { add, remove }) => (
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Custom Options</span>
                  <Button
                    type="link"
                    size="middle"
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                    style={{ 
                      padding: '0 8px',
                      height: 'auto',
                      fontSize: '12px',
                      color: theme.primaryColor
                    }}
                  >
                    Add Option
                  </Button>
                </div>
              }
              size="small"
              style={{ 
                marginBottom: 16,
                border: '1px solid #d9d9d9',
                borderRadius: 6
              }}
              headStyle={{ 
                padding: '12px 16px',
                minHeight: 'auto',
                backgroundColor: '#fafafa'
              }}
              styles={{ body: { padding: '16px' } }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {fields.map((field, index) => (
                  <div
                    key={field.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      border: '1px solid #f0f0f0',
                      borderRadius: 4,
                      backgroundColor: '#fff',
                      gap: '12px'
                    }}
                  >
                    <Form.Item
                      {...field}
                      rules={[{ required: true, message: 'Option label is required' }]}
                      style={{ 
                        marginBottom: 0, 
                        flex: 1
                      }}
                    >
                      <Input 
                        placeholder={`Option ${index + 1}`}
                        style={{ fontSize: 14 }}
                      />
                    </Form.Item>
                    <Button
                      type="text"
                      size="small"
                      onClick={() => remove(field.name)}
                      danger
                      style={{ 
                        fontSize: '12px',
                        height: 'auto',
                        padding: '4px 8px'
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </Space>
            </Card>
          )}
        </Form.List>
      )}


      <Form.Item name="quorumRequired" valuePropName="checked">
        <Checkbox>Require Quorum</Checkbox>
      </Form.Item>

      {quorumRequired && (
        <Form.Item
          name="quorumPercentage"
          label="Quorum Percentage"
          rules={[
            { required: true, message: 'Please enter quorum percentage' },
            { type: 'number', min: 0, max: 100, message: 'Must be between 0 and 100' },
          ]}
        >
          <InputNumber
            min={0}
            max={100}
            formatter={(value) => `${value}%`}
            parser={(value): any => {
              if (!value) return 0;
              const parsed = value.replace('%', '');
              const num = Number(parsed);
              return isNaN(num) ? 0 : num;
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
      )}


      <Form.Item
        name="passingRule"
        label="Passing Rule"
        rules={[{ required: true, message: 'Please select a passing rule' }]}
      >
        <Select
          placeholder="Select passing rule"
          onChange={(value) => {
            form.setFieldsValue({
              passThresholdPercentage: getPassingPercentage(value),
            });
          }}
        >
          <Option value="simple_majority">Simple Majority (50%)</Option>
          <Option value="two_thirds">Two-Thirds (66.67%)</Option>
          <Option value="three_quarters">Three-Quarters (75%)</Option>
          <Option value="unanimous">Unanimous (100%)</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="passThresholdPercentage"
        label="Pass Threshold Percentage"
        rules={[
          { required: true, message: 'Please enter pass threshold' },
          { type: 'number', min: 0, max: 100, message: 'Must be between 0 and 100' },
        ]}
      >
        <InputNumber
          min={0}
          max={100}
          formatter={(value) => `${value}%`}
          parser={(value): any => {
            if (!value) return 0;
            const parsed = value.replace('%', '');
            const num = Number(parsed);
            return isNaN(num) ? 0 : num;
          }}
          style={{ width: '100%' }}
          disabled={!!passingRule}
        />
      </Form.Item>

   

      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item name="anonymous" valuePropName="checked" style={{ marginBottom: 8 }}>
          <Checkbox>Anonymous Voting (hide individual votes)</Checkbox>
        </Form.Item>

        <Form.Item name="allowAbstain" valuePropName="checked" style={{ marginBottom: 8 }}>
          <Checkbox>Allow Abstain</Checkbox>
        </Form.Item>

        <Form.Item name="allowChangeVote" valuePropName="checked" style={{ marginBottom: 8 }}>
          <Checkbox>Allow Vote Change (voters can change their vote)</Checkbox>
        </Form.Item>

        <Form.Item name="autoCloseWhenAllVoted" valuePropName="checked" style={{ marginBottom: 8 }}>
          <Checkbox>Auto-close when all eligible voters have voted</Checkbox>
        </Form.Item>
      </Space>

      <Form.Item
        name="timeLimit"
        label="Time Limit (minutes)"
        help="Optional: Set a time limit for voting"
      >
        <InputNumber
          min={1}
          placeholder="No time limit"
          style={{ width: '100%' }}
        />
      </Form.Item>

      {onCancel && (
        <Space style={{ marginTop: 16 }}>
          <Button
            onClick={onCancel}
            style={{ backgroundColor: theme.secondaryColor, borderColor: theme.secondaryColor }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ backgroundColor: theme.primaryColor, borderColor: theme.primaryColor }}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Space>
      )}
    </Form>
  );
};

export default VoteConfigurationForm;
