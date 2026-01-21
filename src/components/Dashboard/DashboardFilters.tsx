import React from 'react';
import { Space, DatePicker, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useOrgTheme } from '../../contexts';

const { RangePicker } = DatePicker;

interface DashboardFiltersProps {
  dateRange: [Dayjs, Dayjs];
  onDateRangeChange: (dates: [Dayjs, Dayjs] | null) => void;
  onExport?: (format: 'pdf' | 'excel') => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  onExport,
}) => {
  const { theme } = useOrgTheme();

  const rangePresets: {
    label: string;
    value: [Dayjs, Dayjs];
  }[] = [
    { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
    { label: 'This Week', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
    { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'This Quarter', value: [dayjs().startOf('month').subtract(dayjs().month() % 3, 'month'), dayjs().startOf('month').subtract(dayjs().month() % 3, 'month').add(3, 'month').subtract(1, 'day')] },
    { label: 'This Year', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
    { label: 'Last 7 Days', value: [dayjs().subtract(7, 'day'), dayjs()] },
    { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
    { label: 'Last 90 Days', value: [dayjs().subtract(90, 'day'), dayjs()] },
  ];

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'pdf',
      label: 'Export as PDF',
      onClick: () => onExport?.('pdf'),
    },
    {
      key: 'excel',
      label: 'Export as Excel',
      onClick: () => onExport?.('excel'),
    },
  ];

  return (
    <Space size="middle" wrap>
      <RangePicker
        value={dateRange}
        onChange={(dates) => {
          if (dates && dates[0] && dates[1]) {
            onDateRangeChange([dates[0], dates[1]]);
          } else {
            onDateRangeChange(null);
          }
        }}
        presets={rangePresets}
        format="MMM DD, YYYY"
        style={{
          borderColor: theme.primaryColor,
        }}
      />
      
      {onExport && (
        <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
          <Button
            icon={<DownloadOutlined />}
            style={{
              borderColor: theme.primaryColor,
              color: theme.primaryColor,
            }}
          >
            Export
          </Button>
        </Dropdown>
      )}
    </Space>
  );
};
