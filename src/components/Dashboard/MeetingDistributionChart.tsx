import React from 'react';
import { Pie } from '@ant-design/plots';
import { Spin } from 'antd';
import type { DistributionData } from '../../services/chartDataService';
import { useOrgTheme } from '../../contexts';

interface MeetingDistributionChartProps {
  data: DistributionData[];
  loading?: boolean;
}

export const MeetingDistributionChart: React.FC<MeetingDistributionChartProps> = ({
  data,
  loading = false,
}) => {
  const { theme } = useOrgTheme();

  const totalMeetings = data.reduce((sum, item) => sum + item.value, 0);

  const config = {
    data,
    angleField: 'value',
    colorField: 'category',
    radius: 0.9,
    innerRadius: 0.6,
    color: [
      theme.primaryColor,
      theme.secondaryColor,
      theme.successColor,
      theme.warningColor,
    ],
    label: false,
    legend: {
      position: 'bottom' as const,
    },
    statistic: {
      title: {
        content: 'Total',
      },
      content: {
        content: totalMeetings.toString(),
      },
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
      <Pie {...config} height={300} />
    </div>
  );
};
