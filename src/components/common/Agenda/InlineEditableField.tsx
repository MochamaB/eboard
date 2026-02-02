/**
 * Inline Editable Field Component
 * Displays as text in view mode, becomes editable input in edit mode
 */

import React, { useState, useEffect } from 'react';
import { Input, Select, InputNumber, Typography } from 'antd';
import { useBoardContext } from '../../../contexts';

const { TextArea } = Input;
const { Text: AntText } = Typography;

export type FieldType = 'text' | 'textarea' | 'select' | 'number';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface InlineEditableFieldProps {
  /** Current value */
  value: string | number | null | undefined;
  /** Whether field is in edit mode */
  isEditing: boolean;
  /** Field type */
  type: FieldType;
  /** Options for select type */
  options?: SelectOption[];
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Display formatter for view mode */
  formatter?: (value: string | number | null | undefined) => string;
  /** Style for view mode text */
  style?: React.CSSProperties;
  /** Additional class name */
  className?: string;
  /** Input size */
  size?: 'small' | 'middle' | 'large';
  /** Min value for number type */
  min?: number;
  /** Max value for number type */
  max?: number;
  /** Suffix for number type (e.g., "min") */
  suffix?: string;
}

export const InlineEditableField: React.FC<InlineEditableFieldProps> = ({
  value,
  isEditing,
  type,
  options = [],
  onChange,
  placeholder,
  formatter,
  style,
  className,
  size = 'small',
  min,
  max,
  suffix,
}) => {
  const { theme } = useBoardContext();
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string | number | null) => {
    setLocalValue(newValue);
    if (onChange && newValue !== null && newValue !== undefined) {
      onChange(newValue);
    }
  };

  // Format display value
  const displayValue = formatter 
    ? formatter(localValue) 
    : localValue?.toString() || placeholder || '-';

  // View mode - display as text
  if (!isEditing) {
    return (
      <AntText
        style={{
          color: theme.textPrimary,
          fontSize: '13px',
          ...style,
        }}
        className={className}
      >
        {displayValue}
      </AntText>
    );
  }

  // Edit mode - render appropriate input
  switch (type) {
    case 'text':
      return (
        <Input
          value={localValue as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          size={size}
          style={{ minWidth: '150px', ...style }}
          className={className}
        />
      );

    case 'textarea':
      return (
        <TextArea
          value={localValue as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          size={size}
          autoSize={{ minRows: 2, maxRows: 6 }}
          style={{ minWidth: '200px', ...style }}
          className={className}
        />
      );

    case 'select':
      return (
        <Select
          value={localValue as string}
          onChange={(val) => handleChange(val)}
          placeholder={placeholder}
          size={size}
          style={{ minWidth: '120px', ...style }}
          className={className}
          options={options}
        />
      );

    case 'number':
      return (
        <InputNumber
          value={localValue as number}
          onChange={(val) => handleChange(val || 0)}
          placeholder={placeholder}
          size={size}
          min={min}
          max={max}
          suffix={suffix}
          style={{ minWidth: '80px', ...style }}
          className={className}
        />
      );

    default:
      return (
        <AntText style={{ color: theme.textSecondary }}>
          {displayValue}
        </AntText>
      );
  }
};
