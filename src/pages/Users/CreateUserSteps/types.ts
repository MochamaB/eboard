/**
 * Shared types for Create/Edit User steps
 */

import type { FormInstance } from 'antd';

// User form data structure
export interface UserFormData {
  // Step 1: Basic Info
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  alternateEmail?: string;
  employeeId?: string;

  // Step 2: Role
  primaryRole: string;
  
  // Step 3: Board Assignments (conditional)
  boardAssignments: BoardAssignment[];
  
  // Step 4: Certificate (conditional)
  certificate?: File;
  
  // Step 5: Account Settings
  requireMfa: boolean;
  status: 'active' | 'inactive';
  sendWelcomeEmail: boolean;
}

// Board assignment structure
export interface BoardAssignment {
  boardId: number; // Changed from string to number to match Board.id type
  boardName?: string;
  role: string; // Role code (for display)
  roleId?: number; // Role ID (for API)
  roleName?: string;
  startDate: string;
  endDate?: string | null;
  isDefault?: boolean;
}

// Common props for all step components
export interface StepProps {
  formData: Partial<UserFormData>;
  onChange: (data: Partial<UserFormData>) => void;
  form: FormInstance<UserFormData>;
  mode?: 'create' | 'edit';
  originalUser?: any; // Original user data for edit mode (to skip unchanged field validation)
  onSave?: (data: Partial<UserFormData>) => Promise<void>; // Individual save handler for edit mode
  isSaving?: boolean; // Loading state for save button
}

// Step-specific props
export interface BasicInfoStepProps extends StepProps {}

export interface RoleSelectionStepProps extends StepProps {
  selectedRole?: string;
}

export interface BoardAssignmentsStepProps extends StepProps {
  selectedRole?: string;
}

export interface CertificateUploadStepProps extends StepProps {}

export interface AccountSettingsStepProps extends StepProps {}

export interface ReviewStepProps extends StepProps {
  selectedRole?: string;
}
