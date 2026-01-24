/**
 * FormBuilder Component
 * Renders forms dynamically based on field configurations
 * Handles layout, validation, and consistent styling
 */

import React, { useMemo } from 'react';
import { Form, Row, Col } from 'antd';
import { FormField } from './FormField';
import type { FormBuilderProps, FormFieldConfig } from './fieldTypes';

export const FormBuilder: React.FC<FormBuilderProps> = ({
  form,
  fields,
  layout = 'vertical',
  gutter = 16,
  onValuesChange,
  initialValues,
  disabled = false,
  size = 'large',
}) => {
  // Get current form values for conditional rendering
  const formValues = Form.useWatch([], form) || {};

  // Filter visible fields based on hidden condition
  const visibleFields = useMemo(() => {
    return fields.filter((field) => {
      if (typeof field.hidden === 'function') {
        return !field.hidden(formValues);
      }
      return !field.hidden;
    });
  }, [fields, formValues]);

  // Group fields into rows based on colSpan
  const fieldRows = useMemo(() => {
    const rows: FormFieldConfig[][] = [];
    let currentRow: FormFieldConfig[] = [];
    let currentRowSpan = 0;

    visibleFields.forEach((field) => {
      const colSpan = field.colSpan || 24;

      // If adding this field exceeds 24, start a new row
      if (currentRowSpan + colSpan > 24) {
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }
        currentRow = [field];
        currentRowSpan = colSpan;
      } else {
        currentRow.push(field);
        currentRowSpan += colSpan;
      }

      // If row is full (24), start a new row
      if (currentRowSpan === 24) {
        rows.push(currentRow);
        currentRow = [];
        currentRowSpan = 0;
      }
    });

    // Push any remaining fields
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  }, [visibleFields]);

  return (
    <Form
      form={form}
      layout={layout}
      initialValues={initialValues}
      onValuesChange={onValuesChange}
    >
      {fieldRows.map((row, rowIndex) => (
        <Row gutter={gutter} key={`row-${rowIndex}`}>
          {row.map((field) => (
            <Col span={field.colSpan || 24} key={field.name}>
              <FormField
                field={field}
                form={form}
                disabled={disabled}
                size={size}
              />
            </Col>
          ))}
        </Row>
      ))}
    </Form>
  );
};

export default FormBuilder;
