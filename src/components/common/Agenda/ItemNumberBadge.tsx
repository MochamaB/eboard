/**
 * Item Number Badge
 * Displays agenda item number with board-themed styling
 */

import React from 'react';

import { useBoardContext } from '../../../contexts';

interface ItemNumberBadgeProps {
  /** Item number (e.g., "1", "2.1", "3.2.1") */
  number: string;
  /** Is this a parent item (no decimal) */
  isParent?: boolean;
  /** Size variant */
  size?: 'small' | 'default' | 'large';
  /** Custom style */
  style?: React.CSSProperties;
}

export const ItemNumberBadge: React.FC<ItemNumberBadgeProps> = ({
  number,
  isParent = true,
  size = 'default',
  style,
}) => {
  const { theme } = useBoardContext();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: '24px',
          height: '24px',
          fontSize: '11px',
          lineHeight: '24px',
        };
      case 'large':
        return {
          width: '36px',
          height: '36px',
          fontSize: '15px',
          lineHeight: '36px',
        };
      default:
        return {
          width: '28px',
          height: '28px',
          fontSize: '13px',
          lineHeight: '28px',
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sizeStyles,
        borderRadius: '50%',
        backgroundColor: isParent ? theme.primaryColor : theme.primaryLight,
        color: isParent ? theme.primaryContrast : theme.primaryColor,
        fontWeight: 600,
        flexShrink: 0,
        border: isParent ? 'none' : `2px solid ${theme.primaryColor}`,
        ...style,
      }}
    >
      {number}
    </div>
  );
};
