/**
 * WizardForm Component
 * Multi-step form wizard with vertical steps layout
 * Based on docs/05_COMPONENT_SPECIFICATION.md and 01_USERS_PAGES.md wizard patterns
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Steps,
  Button,
  Card,
  Space,
  Typography,
  Flex,
  Affix,
  Divider,
  Result,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export interface WizardStep {
  key: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  optional?: boolean;
  hidden?: boolean;
  validate?: () => Promise<boolean> | boolean;
}

export interface WizardFormProps {
  steps: WizardStep[];
  title?: string;
  subtitle?: string;
  onFinish: () => Promise<void> | void;
  onCancel?: () => void;
  finishButtonText?: string;
  cancelButtonText?: string;
  showStepNumbers?: boolean;
  affixSteps?: boolean;
  affixOffset?: number;
  loading?: boolean;
  successResult?: {
    title: string;
    subTitle?: string;
    extra?: React.ReactNode;
  };
  errorResult?: {
    title: string;
    subTitle?: string;
    extra?: React.ReactNode;
  };
  initialStep?: number;
  stepsDirection?: 'vertical' | 'horizontal';
  stepsPlacement?: 'left' | 'top';
}

export const WizardForm: React.FC<WizardFormProps> = ({
  steps,
  title,
  subtitle,
  onFinish,
  onCancel,
  finishButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  showStepNumbers = true,
  affixSteps = true,
  affixOffset = 80,
  loading = false,
  successResult,
  errorResult,
  initialStep = 0,
  stepsDirection = 'vertical',
  stepsPlacement = 'left',
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [stepValidating, setStepValidating] = useState(false);

  // Filter out hidden steps
  const visibleSteps = useMemo(() => steps.filter((s) => !s.hidden), [steps]);

  const currentStepData = visibleSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === visibleSteps.length - 1;

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    if (!currentStepData?.validate) return true;
    
    setStepValidating(true);
    try {
      const isValid = await currentStepData.validate();
      return isValid;
    } catch {
      return false;
    } finally {
      setStepValidating(false);
    }
  }, [currentStepData]);

  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && !isLastStep) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [validateCurrentStep, isLastStep]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleStepClick = useCallback(
    async (stepIndex: number) => {
      // Only allow going back, not forward (must validate)
      if (stepIndex < currentStep) {
        setCurrentStep(stepIndex);
      }
    },
    [currentStep]
  );

  const handleFinish = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onFinish();
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateCurrentStep, onFinish]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  // Show result screen after submission
  if (submitStatus === 'success' && successResult) {
    return (
      <Result
        status="success"
        title={successResult.title}
        subTitle={successResult.subTitle}
        extra={successResult.extra}
      />
    );
  }

  if (submitStatus === 'error' && errorResult) {
    return (
      <Result
        status="error"
        title={errorResult.title}
        subTitle={errorResult.subTitle}
        extra={
          errorResult.extra || (
            <Button type="primary" onClick={() => setSubmitStatus('idle')}>
              Try Again
            </Button>
          )
        }
      />
    );
  }

  const stepsItems = visibleSteps.map((step, index) => ({
    key: step.key,
    title: step.title,
    description: step.description,
    icon: step.icon,
    status:
      index < currentStep
        ? 'finish'
        : index === currentStep
        ? 'process'
        : 'wait',
  }));

  const stepsComponent = (
    <Steps
      current={currentStep}
      direction={stepsDirection}
      items={stepsItems as any}
      onChange={handleStepClick}
      size="small"
      style={stepsDirection === 'vertical' ? { minWidth: 220 } : undefined}
    />
  );

  const contentComponent = (
    <div style={{ flex: 1 }}>
      {/* Step content */}
      <Spin spinning={loading || stepValidating}>
        <div style={{ minHeight: 300 }}>{currentStepData?.content}</div>
      </Spin>

      {/* Navigation buttons */}
      <Divider />
      <Flex justify="space-between" align="center">
        <Button icon={<CloseOutlined />} onClick={handleCancel}>
          {cancelButtonText}
        </Button>
        <Space>
          {!isFirstStep && (
            <Button icon={<ArrowLeftOutlined />} onClick={handlePrev}>
              Previous
            </Button>
          )}
          {isLastStep ? (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleFinish}
              loading={isSubmitting}
            >
              {finishButtonText}
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleNext}
              loading={stepValidating}
            >
              Next
              <ArrowRightOutlined />
            </Button>
          )}
        </Space>
      </Flex>
    </div>
  );

  // Vertical steps on left (default for wizard)
  if (stepsPlacement === 'left') {
    return (
      <div>
        {/* Header */}
        {(title || subtitle) && (
          <div style={{ marginBottom: 24 }}>
            {title && <Title level={4} style={{ marginBottom: 4 }}>{title}</Title>}
            {subtitle && <Text type="secondary">{subtitle}</Text>}
          </div>
        )}

        <Flex gap={32}>
          {/* Steps sidebar */}
          {affixSteps ? (
            <Affix offsetTop={affixOffset}>
              <Card size="small" style={{ width: 260 }}>
                {stepsComponent}
              </Card>
            </Affix>
          ) : (
            <Card size="small" style={{ width: 260, alignSelf: 'flex-start' }}>
              {stepsComponent}
            </Card>
          )}

          {/* Content area */}
          <Card style={{ flex: 1 }}>{contentComponent}</Card>
        </Flex>
      </div>
    );
  }

  // Horizontal steps on top
  return (
    <div>
      {/* Header */}
      {(title || subtitle) && (
        <div style={{ marginBottom: 24 }}>
          {title && <Title level={4} style={{ marginBottom: 4 }}>{title}</Title>}
          {subtitle && <Text type="secondary">{subtitle}</Text>}
        </div>
      )}

      <Card>
        {/* Steps at top */}
        <div style={{ marginBottom: 24 }}>{stepsComponent}</div>
        <Divider />
        {/* Content */}
        {contentComponent}
      </Card>
    </div>
  );
};

export default WizardForm;
