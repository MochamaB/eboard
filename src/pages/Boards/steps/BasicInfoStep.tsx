import React from 'react';
import { Form, Typography, Divider, Input, Select, Space, Alert, Tag, Switch, Spin } from 'antd';
import type { FormInstance } from 'antd';
import {
  ApartmentOutlined,
  BankOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import type { Board } from '../../../types/board.types';
import { useLookups } from '../../../contexts/LookupsContext';

const { Title, Text } = Typography;

// Icon mapping helper
const getIconComponent = (iconName?: string | null) => {
  switch (iconName) {
    case 'ApartmentOutlined':
      return <ApartmentOutlined />;
    case 'ShopOutlined':
      return <ShopOutlined />;
    case 'BankOutlined':
      return <BankOutlined />;
    default:
      return <BankOutlined />;
  }
};

interface BasicInfoStepProps {
  form: FormInstance;
  boardType?: string;
  requiresParentBoard: boolean;
  requiresZone: boolean;
  availableParentBoards: Board[];
  onTypeChange: () => void;
  mode?: 'create' | 'edit';
  slug?: string | null;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  form,
  boardType,
  requiresParentBoard,
  requiresZone,
  availableParentBoards,
  onTypeChange,
  mode = 'create',
  slug,
}) => {
  const isEditMode = mode === 'edit';
  const { 
    boardTypeOptions, 
    boardZoneOptions, 
    getBoardTypeByCode,
    getBoardZoneByCode,
    isLoading 
  } = useLookups();

  if (isLoading) {
    return <Spin tip="Loading board options..." />;
  }

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
            disabled={isEditMode}
            options={boardTypeOptions}
            optionRender={(option) => {
              const typeInfo = getBoardTypeByCode(option.value as string);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                  <span style={{ fontSize: 18, color: '#8c8c8c' }}>{getIconComponent(typeInfo?.icon)}</span>
                  <div>
                    <div style={{ fontWeight: 500 }}>{option.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{typeInfo?.description}</div>
                  </div>
                </div>
              );
            }}
          />
        </Form.Item>

        {/* Board Type Info Alert */}
        {boardType && (() => {
          const typeInfo = getBoardTypeByCode(boardType);
          return (
            <Alert
              message={`${typeInfo?.name} Selected`}
              description={typeInfo?.description}
              type="info"
              showIcon
              icon={getIconComponent(typeInfo?.icon)}
            />
          );
        })()}

        {/* Board Slug (read-only) */}
        {isEditMode && slug && (
          <Form.Item
            name="slug"
            label="Board Slug"
          >
            <Input disabled />
          </Form.Item>
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
                      <Tag color="blue" style={{ marginRight: 4 }}>
                        {getBoardTypeByCode(boardInfo?.type || 'main')?.name}
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
              options={boardZoneOptions}
            />
          </Form.Item>
        )}

        {/* Board Status Toggle (edit mode only) */}
        {isEditMode && (
          <Form.Item
            name="isActive"
            label="Board Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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
