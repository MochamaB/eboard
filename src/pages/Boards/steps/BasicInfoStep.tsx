import React from 'react';
import { Form, Typography, Divider, Input, Select, Space, Alert, Tag } from 'antd';
import type { FormInstance } from 'antd';
import {
  ApartmentOutlined,
  BankOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import {
  BOARD_TYPE_LABELS,
  BOARD_TYPE_COLORS,
  ZONE_LABELS,
  type BoardType,
} from '../../../types/board.types';
import type { Board } from '../../../types/board.types';
import { getActiveBoardTypes } from '../../../mocks/db/tables/boardTypes';

const { Title, Text } = Typography;

// Get board types from mock data and map icons
const BOARD_TYPE_OPTIONS = getActiveBoardTypes().map(bt => ({
  value: bt.code,
  label: bt.label,
  description: bt.description,
  icon: bt.icon === 'ApartmentOutlined' ? <ApartmentOutlined /> :
        bt.icon === 'ShopOutlined' ? <ShopOutlined /> :
        <BankOutlined />,
}));

interface BasicInfoStepProps {
  form: FormInstance;
  boardType?: string;
  requiresParentBoard: boolean;
  requiresZone: boolean;
  availableParentBoards: Board[];
  onTypeChange: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  form,
  boardType,
  requiresParentBoard,
  requiresZone,
  availableParentBoards,
  onTypeChange,
}) => {
  return (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Basic Information</Title>
      <Text type="secondary">
        Enter the board's basic details and select its type in the organizational hierarchy.
      </Text>
      <Divider />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Board Type */}
        <Form.Item
          name="type"
          label="Board Type"
          rules={[{ required: true, message: 'Please select a board type' }]}
        >
          <Select
            placeholder="Select board type"
            onChange={onTypeChange}
            options={BOARD_TYPE_OPTIONS.map(type => ({
              value: type.value,
              label: type.label,
            }))}
            optionRender={(option) => {
              const typeInfo = BOARD_TYPE_OPTIONS.find(t => t.value === option.value);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                  <span style={{ fontSize: 18, color: '#8c8c8c' }}>{typeInfo?.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{typeInfo?.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{typeInfo?.description}</div>
                  </div>
                </div>
              );
            }}
          />
        </Form.Item>

        {/* Board Type Info Alert */}
        {boardType && (
          <Alert
            message={`${BOARD_TYPE_LABELS[boardType as BoardType]} Selected`}
            description={BOARD_TYPE_OPTIONS.find(t => t.value === boardType)?.description}
            type="info"
            showIcon
            icon={BOARD_TYPE_OPTIONS.find(t => t.value === boardType)?.icon}
          />
        )}

        {/* Parent Board (conditional) */}
        {requiresParentBoard && (
          <Form.Item
            name="parentId"
            label="Parent Board"
            rules={[{ required: true, message: 'Please select a parent board' }]}
          >
            <Select
              placeholder={
                boardType === 'committee'
                  ? 'Select the board this committee reports to'
                  : boardType === 'subsidiary'
                  ? 'Select KTDA Main Board'
                  : 'Select KTDA Main Board'
              }
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={availableParentBoards.map(board => ({
                value: board.id,
                label: board.name,
              }))}
              optionRender={(option) => {
                const boardInfo = availableParentBoards.find(b => b.id === option.value);
                return (
                  <div style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 500 }}>{boardInfo?.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                      <Tag color={BOARD_TYPE_COLORS[boardInfo?.type || 'main']} style={{ marginRight: 4 }}>
                        {BOARD_TYPE_LABELS[boardInfo?.type || 'main']}
                      </Tag>
                    </div>
                  </div>
                );
              }}
            />
          </Form.Item>
        )}

        {/* Zone (conditional - only for factories) */}
        {requiresZone && (
          <Form.Item
            name="zone"
            label="Zone"
            rules={[{ required: true, message: 'Please select a zone' }]}
          >
            <Select
              placeholder="Select factory zone"
              options={Object.entries(ZONE_LABELS).map(([key, label]) => ({
                value: key,
                label: label,
              }))}
            />
          </Form.Item>
        )}

        {/* Board Name */}
        <Form.Item
          name="name"
          label="Board Name"
          rules={[{ required: true, message: 'Please enter the board name' }]}
        >
          <Input
            placeholder="Enter full board name (e.g., 'KTDA Main Board', 'Ketepa Limited')"
          />
        </Form.Item>

        {/* Short Name */}
        <Form.Item
          name="shortName"
          label="Short Name"
          rules={[{ required: true, message: 'Please enter a short name' }]}
        >
          <Input
            placeholder="Enter abbreviated name (e.g., 'KTDA', 'Ketepa')"
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          name="description"
          label="Description (Optional)"
        >
          <Input.TextArea
            placeholder="Enter board description"
            rows={3}
          />
        </Form.Item>
      </Space>
    </div>
  );
};

export default BasicInfoStep;
