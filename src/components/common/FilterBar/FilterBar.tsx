/**
 * FilterBar Component
 * Reusable filter bar with dropdowns, date pickers, and quick filters
 * Based on docs/05_COMPONENT_SPECIFICATION.md sections 4.3 and 2.3
 */

import React, { useState } from 'react';
import {
  Space,
  Select,
  DatePicker,
  Button,
  Dropdown,
  Badge,
  Flex,
  Divider,
  Tag,
} from 'antd';

import { FilterOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export type FilterType = 'select' | 'multiselect' | 'daterange' | 'date';

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
  width?: number;
  allowClear?: boolean;
  showInBar?: boolean; // Show directly in bar vs in dropdown
}

export interface QuickFilter {
  key: string;
  label: string;
  count?: number;
}

export interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onReset?: () => void;
  quickFilters?: QuickFilter[];
  activeQuickFilter?: string;
  onQuickFilterChange?: (key: string) => void;
  showReset?: boolean;
  compact?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  values,
  onChange,
  onReset,
  quickFilters,
  activeQuickFilter,
  onQuickFilterChange,
  showReset = true,
  compact = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const barFilters = filters.filter((f) => f.showInBar !== false);
  const dropdownFilters = filters.filter((f) => f.showInBar === false);

  const activeFilterCount = Object.entries(values).filter(
    ([_, v]) => v !== undefined && v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];
    const commonProps = {
      placeholder: filter.placeholder || `Select ${filter.label}`,
      allowClear: filter.allowClear !== false,
      style: { width: filter.width || 160 },
    };

    switch (filter.type) {
      case 'select':
        return (
          <Select
            {...commonProps}
            value={value as string | number | undefined}
            onChange={(val) => onChange(filter.key, val)}
            options={filter.options?.map((opt) => ({
              label: opt.count !== undefined ? `${opt.label} (${opt.count})` : opt.label,
              value: opt.value,
            }))}
          />
        );

      case 'multiselect':
        return (
          <Select
            {...commonProps}
            mode="multiple"
            maxTagCount="responsive"
            value={value as (string | number)[] | undefined}
            onChange={(val) => onChange(filter.key, val)}
            options={filter.options?.map((opt) => ({
              label: opt.count !== undefined ? `${opt.label} (${opt.count})` : opt.label,
              value: opt.value,
            }))}
          />
        );

      case 'daterange':
        return (
          <RangePicker
            value={value as [Dayjs, Dayjs] | undefined}
            onChange={(dates) => onChange(filter.key, dates)}
            style={{ width: filter.width || 240 }}
            allowClear={filter.allowClear !== false}
            presets={[
              { label: 'Today', value: [dayjs(), dayjs()] },
              { label: 'Last 7 days', value: [dayjs().subtract(7, 'day'), dayjs()] },
              { label: 'Last 30 days', value: [dayjs().subtract(30, 'day'), dayjs()] },
              { label: 'This month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
              { label: 'Last month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
            ]}
          />
        );

      case 'date':
        return (
          <DatePicker
            value={value as Dayjs | undefined}
            onChange={(date) => onChange(filter.key, date)}
            style={{ width: filter.width || 140 }}
            allowClear={filter.allowClear !== false}
          />
        );

      default:
        return null;
    }
  };

  const dropdownContent = dropdownFilters.length > 0 && (
    <div style={{ padding: 16, minWidth: 280 }}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        {dropdownFilters.map((filter) => (
          <div key={filter.key}>
            <div style={{ marginBottom: 4, fontSize: 12, color: '#8c8c8c' }}>
              {filter.label}
            </div>
            {renderFilter({ ...filter, width: undefined })}
          </div>
        ))}
        <Divider style={{ margin: '8px 0' }} />
        <Flex justify="space-between">
          <Button size="small" onClick={onReset}>
            Reset
          </Button>
          <Button size="small" type="primary" onClick={() => setDropdownOpen(false)}>
            Apply
          </Button>
        </Flex>
      </Space>
    </div>
  );

  return (
    <Flex
      wrap="wrap"
      gap={compact ? 8 : 12}
      align="center"
      style={{ marginBottom: 16 }}
    >
      {/* Quick filters (tabs) */}
      {quickFilters && quickFilters.length > 0 && (
        <>
          <Space size={4}>
            {quickFilters.map((qf) => (
              <Tag.CheckableTag
                key={qf.key}
                checked={activeQuickFilter === qf.key}
                onChange={() => onQuickFilterChange?.(qf.key)}
                style={{ 
                  padding: '4px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                {qf.label}
                {qf.count !== undefined && (
                  <Badge
                    count={qf.count}
                    size="small"
                    style={{ marginLeft: 6 }}
                    showZero
                  />
                )}
              </Tag.CheckableTag>
            ))}
          </Space>
          <Divider type="vertical" style={{ height: 24 }} />
        </>
      )}

      {/* Bar filters */}
      {barFilters.map((filter) => (
        <div key={filter.key}>
          {!compact && (
            <span style={{ marginRight: 8, fontSize: 13, color: '#595959' }}>
              {filter.label}:
            </span>
          )}
          {renderFilter(filter)}
        </div>
      ))}

      {/* Dropdown filters */}
      {dropdownFilters.length > 0 && (
        <Dropdown
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
          trigger={['click']}
          dropdownRender={() => dropdownContent}
        >
          <Badge count={activeFilterCount} size="small" offset={[-4, 4]}>
            <Button icon={<FilterOutlined />}>
              Filters
            </Button>
          </Badge>
        </Dropdown>
      )}

      {/* Reset button */}
      {showReset && activeFilterCount > 0 && (
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onReset}
        >
          Clear filters
        </Button>
      )}
    </Flex>
  );
};

export default FilterBar;
