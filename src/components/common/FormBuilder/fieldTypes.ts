/**
 * FormBuilder Field Types
 * Type definitions for form field configurations
 */

import type { FormInstance, Rule } from 'antd/es/form';
import type { ReactNode } from 'react';

// Supported field types
export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'password'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'dateRange'
  | 'upload'
  | 'custom';

// Option type for select, radio, checkbox
export interface FieldOption {
  label: string | ReactNode;
  value: string | number | boolean;
  disabled?: boolean;
  description?: string;
}

// Field configuration interface
export interface FormFieldConfig {
  // Core properties
  name: string;
  label: string;
  type: FieldType;
  
  // Layout
  colSpan?: number; // 24 = full width, 12 = half, 8 = third (default: 24)
  
  // Validation
  required?: boolean;
  rules?: Rule[];
  
  // Appearance
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  tooltip?: string;
  help?: string;
  
  // Options (for select, radio, checkbox)
  options?: FieldOption[];
  
  // Conditional rendering
  hidden?: boolean | ((formValues: Record<string, unknown>) => boolean);
  
  // Custom render (for type: 'custom')
  render?: (form: FormInstance) => ReactNode;
  
  // Field-specific props
  fieldProps?: Record<string, unknown>;
  
  // Input size
  size?: 'small' | 'middle' | 'large';
  
  // For textarea
  rows?: number;
  
  // For number input
  min?: number;
  max?: number;
  step?: number;
  
  // For upload
  accept?: string;
  maxCount?: number;
  
  // For date
  dateFormat?: string;
  showTime?: boolean;
}

// FormBuilder props
export interface FormBuilderProps {
  form: FormInstance;
  fields: FormFieldConfig[];
  layout?: 'vertical' | 'horizontal' | 'inline';
  gutter?: number | [number, number];
  onValuesChange?: (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\+?[0-9]{10,15}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^[0-9]+$/,
};

// Common validation rules factory
export const createValidationRules = {
  required: (message?: string): Rule => ({
    required: true,
    message: message || 'This field is required',
  }),
  
  email: (message?: string): Rule => ({
    type: 'email',
    message: message || 'Please enter a valid email address',
  }),
  
  phone: (message?: string): Rule => ({
    pattern: ValidationPatterns.phone,
    message: message || 'Please enter a valid phone number (e.g., +254712345678)',
  }),
  
  minLength: (min: number, message?: string): Rule => ({
    min,
    message: message || `Must be at least ${min} characters`,
  }),
  
  maxLength: (max: number, message?: string): Rule => ({
    max,
    message: message || `Must be no more than ${max} characters`,
  }),
  
  pattern: (pattern: RegExp, message: string): Rule => ({
    pattern,
    message,
  }),
};
