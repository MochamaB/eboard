/**
 * WizardForm Component
 * Multi-step form wizard with vertical steps layout
 * Based on docs/05_COMPONENT_SPECIFICATION.md and 01_USERS_PAGES.md wizard patterns
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
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
import { useBoardContext } from '../../../contexts';

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
  affixSteps = true,
  affixOffset = 80,
  loading = false,
  successResult,
  errorResult,
  initialStep = 0,
  stepsPlacement = 'left',
}) => {
  const { theme } = useBoardContext();
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

  const stepsComponent = (
    <>
      <style>{`
        .wizard-steps-vertical {
          display: flex;
          flex-direction: column;
           
        }
        
        .wizard-step-item {
          display: flex;
          align-items: flex-start;
          cursor: pointer;
          position: relative;
          padding-bottom: 0px;
        }
        
        .wizard-step-item:last-child {
          padding-bottom: 0;
        }
        
        /* Left column: number + connector */
        .wizard-step-number-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 16px;
          position: relative;
        }
        
        .wizard-step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
          border: 2px solid;
          background-color: #fff;
          z-index: 1;
        }
        
        .wizard-step-item.pending .wizard-step-number {
          background-color: #fff;
          border-color: ${theme.borderColor};
          color: ${theme.textDisabled};
        }
        
        .wizard-step-item.active .wizard-step-number {
          background-color: ${theme.primaryColor};
          border-color: ${theme.primaryColor};
          color: #fff;
        }
        
        .wizard-step-item.completed .wizard-step-number {
          background-color: ${theme.primaryColor};
          border-color: ${theme.primaryColor};
          color: #fff;
        }
        
        /* Connector line between step numbers */
        .wizard-step-connector {
          width: 2px;
          flex: 1;
          min-height: 24px;
          background-color: ${theme.borderColor};
          margin-top: 4px;
        }
        
        .wizard-step-item.completed .wizard-step-connector {
          background-color: ${theme.primaryColor};
        }
        
        .wizard-step-item:last-child .wizard-step-connector {
          display: none;
        }
        
        /* Right column: content box (icon + text) */
        .wizard-step-content-box {
          flex: 1;
          display: flex;
          align-items: flex-start;
          padding: 12px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          min-height: 60px;
        }
        
        .wizard-step-item:hover .wizard-step-content-box {
          background-color: ${theme.borderColor}15;
        }
        
        .wizard-step-item.active .wizard-step-content-box {
          background-color: ${theme.primaryColor}08;
          border-color: ${theme.primaryColor}40;
        }
        
        .wizard-step-item.completed .wizard-step-content-box {
          background-color: transparent;
        }
        
        .wizard-step-item.pending .wizard-step-content-box {
          background-color: transparent;
        }
        
        /* Icon on the left of the text */
        .wizard-step-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          flex-shrink: 0;
          font-size: 18px;
          background-color: ${theme.borderColor}20;
          color: ${theme.textSecondary};
        }
        
        .wizard-step-item.active .wizard-step-icon {
          background-color: ${theme.primaryColor}15;
          color: ${theme.primaryColor};
        }
        
        .wizard-step-item.completed .wizard-step-icon {
          background-color: ${theme.primaryColor}15;
          color: ${theme.primaryColor};
        }
        
        /* Text content */
        .wizard-step-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 40px;
        }
        
        .wizard-step-title {
          font-weight: 600;
          font-size: 14px;
          color: ${theme.textPrimary};
          margin-bottom: 2px;
          line-height: 1.4;
        }
        
        .wizard-step-description {
          font-size: 12px;
          color: ${theme.textSecondary};
          line-height: 1.4;
        }
        
        .wizard-step-item.active .wizard-step-title {
          color: ${theme.primaryColor};
        }
        
        .wizard-step-item.completed .wizard-step-title {
          color: ${theme.textPrimary};
        }
        
        .wizard-step-item.pending .wizard-step-title {
          color: ${theme.textDisabled};
        }
        
        .wizard-step-item.pending .wizard-step-description {
          color: ${theme.textDisabled};
        }
      `}</style>
      
      <div className="wizard-steps-vertical">
        {visibleSteps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isPending = index > currentStep;
          
          return (
            <div
              key={step.key}
              className={`wizard-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isPending ? 'pending' : ''}`}
              onClick={() => handleStepClick(index)}
            >
              {/* Left column: Step number + connector */}
              <div className="wizard-step-number-column">
                <div className="wizard-step-number">
                  {isCompleted ? (
                    <CheckOutlined style={{ fontSize: 14 }} />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="wizard-step-connector" />
              </div>
              
              {/* Right column: Content box with icon and text */}
              <div className="wizard-step-content-box">
                {/* Icon on the left */}
                {step.icon && (
                  <div className="wizard-step-icon">{step.icon}</div>
                )}
                
                {/* Step text */}
                <div className="wizard-step-text">
                  <div className="wizard-step-title">{step.title}</div>
                  {step.description && (
                    <div className="wizard-step-description">{step.description}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
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
            {title && <Title level={5} style={{ marginBottom: 4 }}>{title}</Title>}
            {subtitle && <Text type="secondary">{subtitle}</Text>}
          </div>
        )}

        <Flex gap={32}>
          {/* Steps sidebar */}
          {affixSteps ? (
            <Affix offsetTop={affixOffset}>
              <div style={{ width: 300 }}>
                {stepsComponent}
              </div>
            </Affix>
          ) : (
            <div style={{ width: 300, alignSelf: 'flex-start' }}>
              {stepsComponent}
            </div>
          )}

          {/* Content area */}
          <div style={{ flex: 1,
            paddingLeft: 24,           // Add right padding
  borderLeft: `1px solid ${theme.borderColor}`,
           }}>{contentComponent}</div>
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
          {title && <Title level={5} style={{ marginBottom: 4 }}>{title}</Title>}
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
