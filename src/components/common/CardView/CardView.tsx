/**
 * CardView Component
 * Generic reusable card grid component for displaying data in card layout
 * Can be used for meetings, documents, tasks, or any other data
 */

import React from 'react';
import { Row, Col, Empty, Spin } from 'antd';
import type { ColProps } from 'antd';

export interface CardViewProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  gutter?: number | [number, number];
  emptyText?: string;
  emptyDescription?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Default responsive columns: 1 col on mobile, 2 on tablet, 3 on desktop, 4 on large screens
const DEFAULT_COLUMNS: CardViewProps<unknown>['columns'] = {
  xs: 24,  // 1 card on mobile
  sm: 24,  // 1 card on small tablet
  md: 12,  // 2 cards on tablet
  lg: 8,   // 3 cards on desktop
  xl: 6,   // 4 cards on large desktop
  xxl: 6,  // 4 cards on extra large
};

export function CardView<T>({
  data,
  renderCard,
  loading = false,
  columns = DEFAULT_COLUMNS,
  gutter = [16, 16],
  emptyText = 'No data found',
  emptyDescription,
  className,
  style,
}: CardViewProps<T>) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', ...style }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '48px 0', ...style }}>
        <Empty
          description={
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>{emptyText}</div>
              {emptyDescription && (
                <div style={{ fontSize: 13, color: '#8c8c8c' }}>{emptyDescription}</div>
              )}
            </div>
          }
        />
      </div>
    );
  }

  return (
    <Row gutter={gutter} className={className} style={style}>
      {data.map((item, index) => (
        <Col key={index} {...columns}>
          {renderCard(item, index)}
        </Col>
      ))}
    </Row>
  );
}

export default CardView;
