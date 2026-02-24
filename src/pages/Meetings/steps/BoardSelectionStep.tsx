import React from 'react';
import { Form, Typography, Divider, Select, Space, Spin } from 'antd';
import { BankOutlined, ApartmentOutlined, ShopOutlined } from '@ant-design/icons';
import type { MeetingType } from '../../../types/meeting.types';
import { useLookups } from '../../../contexts/LookupsContext';

const { Title, Text } = Typography;

// Icon mapping helper for board types
const getIconComponent = (iconName?: string | null) => {
  switch (iconName) {
    case 'ApartmentOutlined':
      return <ApartmentOutlined />;
    case 'ShopOutlined':
      return <ShopOutlined />;
    case 'BankOutlined':
    default:
      return <BankOutlined />;
  }
};

interface BoardSelectionStepProps {
  form: any;
  selectedBoardType?: string;
  selectedBoardId?: string;
  allBoardsWithCommittees: Array<{
    value: string;
    label: string;
    type: string;
    shortName: string;
    parentName?: string;
  }>;
  onBoardTypeChange: (value: string) => void;
  onBoardChange: (value: string) => void;
  onMeetingTypeChange: (value: MeetingType) => void;
}

const BoardSelectionStep: React.FC<BoardSelectionStepProps> = ({
  form,
  selectedBoardType,
  selectedBoardId,
  allBoardsWithCommittees,
  onBoardTypeChange,
  onBoardChange,
  onMeetingTypeChange,
}) => {
  const { boardTypeOptions, getBoardTypeByCode, meetingTypeOptions, getMeetingTypeByCode, isLoading } = useLookups();
  
  const filteredBoards = selectedBoardType
    ? allBoardsWithCommittees.filter(board => board.type === selectedBoardType)
    : [];

  const selectedBoard = allBoardsWithCommittees.find(b => b.value === selectedBoardId);

  if (isLoading) {
    return <Spin tip="Loading meeting options..." />;
  }

  return (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Select Board/Committee</Title>
      <Text type="secondary">
        Choose the board or committee for this meeting.
      </Text>
      <Divider />
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Form.Item
          name="boardType"
          label="Board Type"
          rules={[{ required: true, message: 'Please select board type' }]}
        >
          <Select
            placeholder="Select board type"
            onChange={onBoardTypeChange}
            options={boardTypeOptions}
            optionRender={(option) => {
              const typeInfo = getBoardTypeByCode(option.value as string);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {getIconComponent(typeInfo?.icon)}
                  <span>{option.label}</span>
                </div>
              );
            }}
          />
        </Form.Item>

        {selectedBoardType && (
          <Form.Item
            name="boardId"
            label={selectedBoardType === 'main' ? 'Board' : 'Committee'}
            rules={[{ required: true, message: `Please select ${selectedBoardType === 'main' ? 'board' : 'committee'}` }]}
          >
            <Select
              placeholder={`Select ${selectedBoardType === 'main' ? 'board' : 'committee'}`}
              onChange={onBoardChange}
              showSearch
              optionFilterProp="label"
              options={filteredBoards.map(board => ({
                value: board.value,
                label: board.parentName ? `${board.label} (${board.parentName})` : board.label,
              }))}
            />
          </Form.Item>
        )}

        

        <Form.Item
          name="meetingType"
          label="Meeting Type"
          rules={[{ required: true, message: 'Please select meeting type' }]}
        >
          <Select
            placeholder="Select meeting type"
            onChange={onMeetingTypeChange}
            options={meetingTypeOptions}
            optionRender={(option) => {
              const typeInfo = getMeetingTypeByCode(option.value as string);
              return (
                <div>
                  <div style={{ fontWeight: 500 }}>{option.label}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>{typeInfo?.description}</div>
                </div>
              );
            }}
          />
        </Form.Item>
      </Space>
    </div>
  );
};

export default BoardSelectionStep;
