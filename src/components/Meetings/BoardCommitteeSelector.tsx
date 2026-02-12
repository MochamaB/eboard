/**
 * BoardCommitteeSelector Component
 * Grouped select dropdown for selecting boards or committees
 * Used when creating/editing meetings
 */

import React, { useMemo } from 'react';
import { Select, Tag, Space } from 'antd';
import type { SelectProps } from 'antd';
import { BankOutlined, TeamOutlined } from '@ant-design/icons';
import type { Board } from '../../types/board.types';
import { BOARD_TYPE_LABELS, BOARD_TYPE_COLORS } from '../../types/board.types';
import { useBoardContext } from '../../contexts';

interface BoardCommitteeSelectorProps extends Omit<SelectProps, 'options' | 'onChange' | 'value'> {
  value?: string;
  onChange?: (boardId: string, board: Board) => void;
  includeCommittees?: boolean;
  filterByUserPermissions?: boolean; // Filter to only boards where user is secretary
  allowClear?: boolean;
}

export const BoardCommitteeSelector: React.FC<BoardCommitteeSelectorProps> = ({
  value,
  onChange,
  includeCommittees = true,
  filterByUserPermissions = false,
  allowClear = false,
  ...selectProps
}) => {
  const { allBoards } = useBoardContext();

  // Filter and group boards
  const { boardOptions, committeeOptions } = useMemo(() => {
    let boards = allBoards.filter(b => b.type !== 'committee' && b.id !== 'ktda-group');
    let committees = includeCommittees ? allBoards.filter(b => b.type === 'committee') : [];

    // TODO: Add user permission filtering when auth context is available
    // if (filterByUserPermissions) {
    //   boards = boards.filter(b => userCanManageBoard(b.id));
    //   committees = committees.filter(c => userCanManageBoard(c.id));
    // }

    const boardOpts = boards.map(board => ({
      label: (
        <Space>
          <BankOutlined style={{ color: BOARD_TYPE_COLORS[board.type] }} />
          <span>{board.name}</span>
          <Tag color={BOARD_TYPE_COLORS[board.type]} style={{ fontSize: '11px', marginLeft: 4 }}>
            {BOARD_TYPE_LABELS[board.type]}
          </Tag>
        </Space>
      ),
      value: board.id,
      board,
      searchValue: `${board.name} ${board.shortName}`,
    }));

    const committeeOpts = committees.map(committee => ({
      label: (
        <Space>
          <TeamOutlined style={{ color: BOARD_TYPE_COLORS.committee }} />
          <span>{committee.name}</span>
          {committee.parentName && (
            <Tag color="default" style={{ fontSize: '11px', marginLeft: 4 }}>
              {committee.parentName}
            </Tag>
          )}
        </Space>
      ),
      value: committee.id,
      board: committee,
      searchValue: `${committee.name} ${committee.shortName} ${committee.parentName || ''}`,
    }));

    return { boardOptions: boardOpts, committeeOptions: committeeOpts };
  }, [allBoards, includeCommittees, filterByUserPermissions]);

  // Build grouped options
  const options = useMemo(() => {
    const groups: SelectProps['options'] = [];

    if (boardOptions.length > 0) {
      groups.push({
        label: (
          <span style={{ fontWeight: 600, color: '#1890ff' }}>
            <BankOutlined /> Boards
          </span>
        ),
        options: boardOptions,
      });
    }

    if (committeeOptions.length > 0) {
      groups.push({
        label: (
          <span style={{ fontWeight: 600, color: '#9C27B0' }}>
            <TeamOutlined /> Committees
          </span>
        ),
        options: committeeOptions,
      });
    }

    return groups;
  }, [boardOptions, committeeOptions]);

  // Handle selection
  const handleChange = (selectedValue: string) => {
    const allOptions = [...boardOptions, ...committeeOptions];
    const selected = allOptions.find(opt => opt.value === selectedValue);
    if (selected && onChange) {
      onChange(selectedValue, selected.board);
    }
  };

  // Custom filter
  const filterOption = (input: string, option: any) => {
    if (!input) return true;
    const searchValue = option?.searchValue || '';
    return searchValue.toLowerCase().includes(input.toLowerCase());
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      options={options}
      placeholder="Select board or committee"
      showSearch
      filterOption={filterOption}
      allowClear={allowClear}
      style={{ width: '100%' }}
      size="large"
      {...selectProps}
    />
  );
};

export default BoardCommitteeSelector;
