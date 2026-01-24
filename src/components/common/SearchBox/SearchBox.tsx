/**
 * SearchBox Component
 * Reusable search input with debounce and clear functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from 'antd';
import { SearchOutlined, CloseCircleFilled } from '@ant-design/icons';

export interface SearchBoxProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  width?: number | string;
  allowClear?: boolean;
  size?: 'small' | 'middle' | 'large';
  style?: React.CSSProperties;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  width = 240,
  allowClear = true,
  size = 'middle',
  style,
}) => {
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange('');
  }, [onChange]);

  return (
    <Input
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder}
      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
      suffix={
        allowClear && internalValue ? (
          <CloseCircleFilled
            style={{ color: '#bfbfbf', cursor: 'pointer' }}
            onClick={handleClear}
          />
        ) : null
      }
      size={size}
      style={{ width, ...style }}
      allowClear={false}
    />
  );
};

export default SearchBox;
