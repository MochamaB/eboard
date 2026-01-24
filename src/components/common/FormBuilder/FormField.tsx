/**
 * FormField Component
 * Renders individual form fields based on field type configuration
 */

import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Checkbox,
  Switch,
  DatePicker,
  Upload,
  Button,
  Tooltip,
} from 'antd';
import { UploadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { FormInstance, Rule } from 'antd/es/form';
import type { FormFieldConfig } from './fieldTypes';
import { createValidationRules } from './fieldTypes';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface FormFieldProps {
  field: FormFieldConfig;
  form: FormInstance;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  form,
  disabled: globalDisabled,
  size: globalSize,
}) => {
  const {
    name,
    label,
    type,
    required,
    rules = [],
    placeholder,
    disabled,
    readOnly,
    tooltip,
    help,
    options = [],
    render,
    fieldProps = {},
    size,
    rows = 4,
    min,
    max,
    step,
    accept,
    maxCount = 1,
    dateFormat = 'YYYY-MM-DD',
    showTime,
  } = field;

  const fieldSize = size || globalSize || 'large';
  const isDisabled = disabled || globalDisabled || readOnly;

  // Build validation rules
  const fieldRules: Rule[] = [...rules];
  
  if (required) {
    fieldRules.unshift(createValidationRules.required(`${label} is required`));
  }
  
  if (type === 'email' && !rules.some(r => (r as { type?: string }).type === 'email')) {
    fieldRules.push(createValidationRules.email());
  }
  
  if (type === 'phone' && !rules.some(r => (r as { pattern?: RegExp }).pattern)) {
    fieldRules.push(createValidationRules.phone());
  }

  // Render label with tooltip
  const renderLabel = () => {
    if (!tooltip) return label;
    return (
      <span>
        {label}{' '}
        <Tooltip title={tooltip}>
          <QuestionCircleOutlined style={{ color: '#999', cursor: 'help' }} />
        </Tooltip>
      </span>
    );
  };

  // Render field input based on type
  const renderInput = () => {
    switch (type) {
      case 'text':
        return (
          <Input
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={readOnly}
            size={fieldSize}
            {...fieldProps}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            placeholder={placeholder || 'email@example.com'}
            disabled={isDisabled}
            readOnly={readOnly}
            size={fieldSize}
            {...fieldProps}
          />
        );

      case 'phone':
        return (
          <Input
            placeholder={placeholder || '+254712345678'}
            disabled={isDisabled}
            readOnly={readOnly}
            size={fieldSize}
            {...fieldProps}
          />
        );

      case 'password':
        return (
          <Input.Password
            placeholder={placeholder}
            disabled={isDisabled}
            size={fieldSize}
            {...fieldProps}
          />
        );

      case 'number':
        return (
          <InputNumber
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={readOnly}
            size={fieldSize}
            min={min}
            max={max}
            step={step}
            style={{ width: '100%' }}
            {...fieldProps}
          />
        );

      case 'textarea':
        return (
          <TextArea
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={readOnly}
            rows={rows}
            {...fieldProps}
          />
        );

      case 'select':
        return (
          <Select
            placeholder={placeholder || 'Select an option'}
            disabled={isDisabled}
            size={fieldSize}
            options={options.map(opt => ({
              label: opt.description ? (
                <div>
                  <div style={{ fontWeight: 500 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{opt.description}</div>
                </div>
              ) : opt.label,
              value: opt.value,
              disabled: opt.disabled,
            }))}
            {...fieldProps}
          />
        );

      case 'multiselect':
        return (
          <Select
            mode="multiple"
            placeholder={placeholder || 'Select options'}
            disabled={isDisabled}
            size={fieldSize}
            options={options.map(opt => ({
              label: opt.label,
              value: opt.value,
              disabled: opt.disabled,
            }))}
            {...fieldProps}
          />
        );

      case 'radio':
        return (
          <Radio.Group disabled={isDisabled} {...fieldProps}>
            {options.map(opt => (
              <Radio key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                {opt.label}
                {opt.description && (
                  <div style={{ fontSize: 12, color: '#999', marginLeft: 24 }}>
                    {opt.description}
                  </div>
                )}
              </Radio>
            ))}
          </Radio.Group>
        );

      case 'checkbox':
        if (options.length === 0) {
          // Single checkbox (boolean)
          return (
            <Checkbox disabled={isDisabled} {...fieldProps}>
              {placeholder}
            </Checkbox>
          );
        }
        // Multiple checkboxes
        return (
          <Checkbox.Group disabled={isDisabled} {...fieldProps}>
            {options.map(opt => (
              <Checkbox key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        );

      case 'switch':
        return (
          <Switch
            disabled={isDisabled}
            checkedChildren={fieldProps.checkedChildren as React.ReactNode}
            unCheckedChildren={fieldProps.unCheckedChildren as React.ReactNode}
            {...fieldProps}
          />
        );

      case 'date':
        return (
          <DatePicker
            placeholder={placeholder}
            disabled={isDisabled}
            size={fieldSize}
            format={dateFormat}
            showTime={showTime}
            style={{ width: '100%' }}
            {...fieldProps}
          />
        );

      case 'dateRange':
        return (
          <RangePicker
            disabled={isDisabled}
            size={fieldSize}
            format={dateFormat}
            showTime={showTime}
            style={{ width: '100%' }}
            {...fieldProps}
          />
        );

      case 'upload':
        return (
          <Upload
            maxCount={maxCount}
            accept={accept}
            beforeUpload={() => false}
            disabled={isDisabled}
            {...fieldProps}
          >
            <Button icon={<UploadOutlined />} disabled={isDisabled} size={fieldSize}>
              {placeholder || 'Click to upload'}
            </Button>
          </Upload>
        );

      case 'custom':
        if (render) {
          return render(form);
        }
        return null;

      default:
        return (
          <Input
            placeholder={placeholder}
            disabled={isDisabled}
            size={fieldSize}
            {...fieldProps}
          />
        );
    }
  };

  // For switch and single checkbox, use valuePropName
  const valuePropName = type === 'switch' || (type === 'checkbox' && options.length === 0)
    ? 'checked'
    : type === 'upload'
    ? 'fileList'
    : 'value';

  return (
    <Form.Item
      name={name}
      label={renderLabel()}
      required={required}
      rules={fieldRules}
      help={help}
      valuePropName={valuePropName}
      getValueFromEvent={type === 'upload' ? (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
      } : undefined}
    >
      {renderInput()}
    </Form.Item>
  );
};

export default FormField;
