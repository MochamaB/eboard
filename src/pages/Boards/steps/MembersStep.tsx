/**
 * MembersStep - Board Members Assignment Step
 * Allows assigning initial members to the board during creation
 * Validates that at least a Chairman is assigned (BoardLeadership requirement)
 */

import React, { useCallback } from 'react';
import { Form, type FormInstance } from 'antd';
import { MemberSelector, type BoardMemberAssignment } from '../../../components/Boards';

interface MembersStepProps {
  form: FormInstance;
  onValidationChange?: (isValid: boolean) => void;
}

const MembersStep: React.FC<MembersStepProps> = ({ form, onValidationChange }) => {
  // Handle validation status from MemberSelector
  const handleValidationChange = useCallback((isValid: boolean, errors: string[]) => {
    // Update form validation state
    if (!isValid && errors.length > 0) {
      form.setFields([
        {
          name: 'members',
          errors: errors,
        },
      ]);
    } else {
      form.setFields([
        {
          name: 'members',
          errors: [],
        },
      ]);
    }
    // Report to parent
    onValidationChange?.(isValid);
  }, [form, onValidationChange]);

  return (
    <Form.Item
      name="members"
      initialValue={[]}
      rules={[
        {
          validator: async (_, value: BoardMemberAssignment[]) => {
            // Check if chairman is assigned
            const hasChairman = value?.some(m => m.roleCode === 'chairman');
            if (!hasChairman) {
              return Promise.reject('A Chairman must be assigned to the board');
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <MemberSelector
        onValidationChange={handleValidationChange}
      />
    </Form.Item>
  );
};

export default MembersStep;
