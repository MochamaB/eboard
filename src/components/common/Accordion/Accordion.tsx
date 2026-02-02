/**
 * Reusable Accordion Component
 * Custom accordion with themed styling and collapse icon as rounded badge on the right
 */

import React, { useState, useCallback } from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';

export interface AccordionItem {
  /** Unique key for the item */
  key: string;
  /** Header content (can be any React node) */
  header: React.ReactNode;
  /** Body content (can be any React node) */
  children: React.ReactNode;
  /** Disable expand/collapse for this item */
  disabled?: boolean;
  /** Custom styles for this item's header */
  headerStyle?: React.CSSProperties;
  /** Custom styles for this item's body */
  bodyStyle?: React.CSSProperties;
}

export interface AccordionProps {
  /** Array of accordion items */
  items: AccordionItem[];
  /** Keys of initially expanded items */
  defaultActiveKeys?: string[];
  /** Controlled active keys */
  activeKeys?: string[];
  /** Callback when active keys change */
  onChange?: (activeKeys: string[]) => void;
  /** Allow multiple items to be expanded at once */
  multiple?: boolean;
  /** Custom styles for the accordion container */
  style?: React.CSSProperties;
  /** Custom styles for each item */
  itemStyle?: React.CSSProperties;
  /** Custom styles for the header */
  headerStyle?: React.CSSProperties;
  /** Custom styles for the body */
  bodyStyle?: React.CSSProperties;
  /** Apply theme background to expanded header */
  themedHeader?: boolean;
  /** Show left border on expanded items */
  showLeftBorder?: boolean;
  /** Border color for items */
  borderColor?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultActiveKeys = [],
  activeKeys: controlledActiveKeys,
  onChange,
  multiple = true,
  style,
  itemStyle,
  headerStyle,
  bodyStyle,
  themedHeader = true,
  showLeftBorder = true,
  borderColor,
}) => {
  const { theme } = useBoardContext();
  const [internalActiveKeys, setInternalActiveKeys] = useState<Set<string>>(
    new Set(defaultActiveKeys)
  );

  // Use controlled or internal state
  const activeKeys = controlledActiveKeys
    ? new Set(controlledActiveKeys)
    : internalActiveKeys;

  const toggleItem = useCallback(
    (key: string) => {
      const newKeys = new Set(activeKeys);

      if (newKeys.has(key)) {
        newKeys.delete(key);
      } else {
        if (!multiple) {
          newKeys.clear();
        }
        newKeys.add(key);
      }

      const keysArray = Array.from(newKeys);

      if (!controlledActiveKeys) {
        setInternalActiveKeys(newKeys);
      }

      onChange?.(keysArray);
    },
    [activeKeys, multiple, controlledActiveKeys, onChange]
  );

  const itemBorderColor = borderColor || theme.borderColor;

  return (
    <div style={{ backgroundColor: '#ffffff', ...style }}>
      {items.map((item) => {
        const isExpanded = activeKeys.has(item.key);

        return (
          <div key={item.key} style={itemStyle}>
            {/* Header */}
            <div
              onClick={() => !item.disabled && toggleItem(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                backgroundColor: isExpanded && themedHeader ? theme.primaryLight : '#ffffff',
                borderLeft:
                  isExpanded && showLeftBorder
                    ? `3px solid ${theme.primaryColor}`
                    : '3px solid transparent',
                borderBottom: `1px solid ${itemBorderColor}`,
                transition: 'all 0.2s ease',
                opacity: item.disabled ? 0.6 : 1,
                ...headerStyle,
                ...item.headerStyle, // Per-item header style override
              }}
            >
              {/* Header Content */}
              <div style={{ flex: 1, minWidth: 0 }}>{item.header}</div>

              {/* Expand/Collapse Badge - Right Side */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isExpanded ? theme.primaryLight : theme.backgroundTertiary,
                  color: isExpanded ? theme.primaryColor : theme.textSecondary,
                  border: isExpanded ? `2px solid ${theme.primaryColor}` : `2px solid ${theme.borderColor}`,
                  flexShrink: 0,
                  marginLeft: '12px',
                  transition: 'all 0.2s ease',
                }}
              >
                {isExpanded ? (
                  <DownOutlined style={{ fontSize: '12px' }} />
                ) : (
                  <RightOutlined style={{ fontSize: '12px' }} />
                )}
              </div>
            </div>

            {/* Body - Only shown when expanded */}
            {isExpanded && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderBottom: `1px solid ${itemBorderColor}`,
                  borderLeft: `1px solid ${itemBorderColor}`,
                  borderRight: `1px solid ${itemBorderColor}`,
                  ...bodyStyle,
                  ...item.bodyStyle, // Per-item body style override
                }}
              >
                {item.children}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
