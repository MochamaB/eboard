import React from 'react';
import { Form, Typography, Divider, Select, Space } from 'antd';
import { BankOutlined, ApartmentOutlined } from '@ant-design/icons';
import type { MeetingType } from '../../../types/meeting.types';
import { getActiveBoardTypes } from '../../../mocks/db/tables/boardTypes';
import { getAllMeetingTypes } from '../../../mocks/db/tables/meetingTypes';

const { Title, Text } = Typography;

// Get board types from mock data
const BOARD_TYPE_OPTIONS = getActiveBoardTypes().map(bt => ({
  value: bt.code,
  label: bt.label,
  icon: bt.icon === 'BankOutlined' ? <BankOutlined /> : <ApartmentOutlined />,
}));

// Get meeting types from mock data
const MEETING_TYPE_OPTIONS = getAllMeetingTypes().map(mt => ({
  value: mt.code,
  label: mt.label,
  description: mt.description,
  defaultDuration: mt.defaultDuration,
}));

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
  const filteredBoards = selectedBoardType
    ? allBoardsWithCommittees.filter(board => board.type === selectedBoardType)
    : [];

  const selectedBoard = allBoardsWithCommittees.find(b => b.value === selectedBoardId);

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
            options={BOARD_TYPE_OPTIONS}
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
            options={MEETING_TYPE_OPTIONS.map(option => ({
              value: option.value,
              label: (
                <div>
                  <div style={{ fontWeight: 500 }}>{option.label}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>{option.description}</div>
                </div>
              ),
            }))}
          />
        </Form.Item>
      </Space>
    </div>
  );
};

export default BoardSelectionStep;
