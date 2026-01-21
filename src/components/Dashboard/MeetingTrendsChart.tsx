import React, { useState } from 'react';
import { Area } from '@ant-design/plots';
import { Segmented, Spin } from 'antd';
import type { MeetingTrendsData } from '../../services/chartDataService';
import { useOrgTheme } from '../../contexts';

interface MeetingTrendsChartProps {
  data: MeetingTrendsData[];
  loading?: boolean;
  onPeriodChange?: (period: 'day' | 'week' | 'month') => void;
}

export const MeetingTrendsChart: React.FC<MeetingTrendsChartProps> = ({
  data,
  loading = false,
  onPeriodChange,
}) => {
  const { theme } = useOrgTheme();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  const handlePeriodChange = (value: string | number) => {
    const newPeriod = value as 'day' | 'week' | 'month';
    setPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  const config = {
    data,
    xField: 'date',
    yField: 'count',
    color: theme.primaryColor,
    smooth: true,
    areaStyle: {
      fill: theme.primaryColor,
      fillOpacity: 0.2,
    },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Segmented
          value={period}
          onChange={handlePeriodChange}
          options={[
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
          ]}
          style={{
            background: '#f5f5f5',
          }}
        />
      </div>
      <Area {...config} height={300} />
    </div>
  );
};
