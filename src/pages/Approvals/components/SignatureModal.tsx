/**
 * Signature Modal
 * Two-step modal for approving a meeting confirmation:
 * 1. PIN entry to unlock certificate
 * 2. Signature canvas to draw/capture signature
 */

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Alert, Space, Divider, Steps } from 'antd';
import { 
  CheckCircleOutlined, 
  LockOutlined, 
  SafetyCertificateOutlined, 
  UserOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useApproveMeeting } from '../../../hooks/api/useMeetings';
import { useAuth } from '../../../contexts/AuthContext';
import {
  canUserApproveMeeting,
  getUserCertificateStatus,
} from '../../../utils/confirmationWorkflow';
import { SignatureCanvas } from '../../../components/common/SignatureCanvas';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

// Mock PIN for demo - in production this would be validated server-side
const DEMO_PIN = '1234';

interface SignatureModalProps {
  open: boolean;
  meetingId: string;
  meetingTitle: string;
  boardId: string;
  onCancel: () => void;
  onSuccess: (signatureDataUrl?: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  open,
  meetingId,
  meetingTitle,
  boardId,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'pin' | 'signature' | 'success'>('pin');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const { user } = useAuth();
  
  const approveMutation = useApproveMeeting(meetingId);

  // Get approver info and certificate status
  const approverInfo = user ? canUserApproveMeeting(user.id, boardId) : null;
  const certStatus = user ? getUserCertificateStatus(user.id) : null;
  
  const canSign = approverInfo?.canApprove && certStatus?.hasCertificate && !certStatus?.isExpired;

  // Handle PIN submission
  const handlePinSubmit = (values: { pin: string }) => {
    setError(null);
    
    // Demo PIN validation - in production this goes to server
    if (values.pin === DEMO_PIN || values.pin.length >= 4) {
      // PIN valid - move to signature step
      setStep('signature');
    } else {
      setError('Invalid PIN. For demo, use "1234" or any 4+ digit PIN.');
    }
  };

  // Handle signature submission
  const handleSignatureSubmit = async () => {
    if (!signatureDataUrl) {
      setError('Please draw your signature before confirming.');
      return;
    }

    setError(null);

    try {
      console.log('🔄 Submitting signature for approval...');
      const result = await approveMutation.mutateAsync({
        approvedBy: user?.id || 0,
        pin: form.getFieldValue('pin'),
        signatureImage: signatureDataUrl,
      });

      console.log('✅ Approval successful:', result);

      // Show success state
      setStep('success');

      // Auto-close after 2 seconds
      setTimeout(() => {
        console.log('⏰ Auto-closing modal and calling onSuccess');
        resetModal();
        onSuccess(signatureDataUrl);
      }, 2000);
    } catch (err) {
      console.error('❌ Confirmation failed:', err);
      setError('Failed to confirm meeting. Please try again.');
    }
  };

  // Go back to PIN step
  const handleBackToPin = () => {
    setStep('pin');
    setSignatureDataUrl(null);
    setError(null);
  };

  // Reset modal state
  const resetModal = () => {
    form.resetFields();
    setStep('pin');
    setSignatureDataUrl(null);
    setError(null);
  };

  // Handle cancel
  const handleCancel = () => {
    resetModal();
    onCancel();
  };

  // Handle signature change
  const handleSignatureChange = (dataUrl: string | null) => {
    setSignatureDataUrl(dataUrl);
    setError(null);
  };

  return (
    <Modal
      title={
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>Confirm Meeting</span>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={520}
      destroyOnClose
    >
      {/* Progress Steps - hide on success */}
      {step !== 'success' && (
        <Steps
          current={step === 'pin' ? 0 : 1}
          size="small"
          style={{ marginBottom: 24 }}
          items={[
            { title: 'Verify PIN', icon: <LockOutlined /> },
            { title: 'Sign Document', icon: <EditOutlined /> },
          ]}
        />
      )}

      {/* Meeting Info - hide on success */}
      {step !== 'success' && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Confirming:</Text>
          <br />
          <Text strong style={{ fontSize: 15 }}>{meetingTitle}</Text>
        </div>
      )}

      {/* Approver Info - hide on success */}
      {step !== 'success' && (
        <div style={{ 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f', 
          borderRadius: 6, 
          padding: 12, 
          marginBottom: 16 
        }}>
          <Space>
            <UserOutlined style={{ color: '#52c41a' }} />
            <Text>
              <Text strong>{user?.fullName}</Text>
              <Text type="secondary"> • {approverInfo?.roleLabel}</Text>
            </Text>
          </Space>
        </div>
      )}

      {/* Certificate Status - only show on PIN step */}
      {step === 'pin' && certStatus?.hasCertificate && !certStatus.isExpired && (
        <div style={{ 
          background: '#f0f5ff', 
          border: '1px solid #adc6ff', 
          borderRadius: 6, 
          padding: 12, 
          marginBottom: 16 
        }}>
          <Space>
            <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Certificate valid until {dayjs(certStatus.certificateExpiry).format('DD MMM YYYY')}
            </Text>
          </Space>
        </div>
      )}

      {/* Certificate Error */}
      {(!certStatus?.hasCertificate || certStatus?.isExpired) && (
        <Alert
          message="Certificate Issue"
          description={
            !certStatus?.hasCertificate 
              ? "You don't have a digital certificate uploaded."
              : "Your digital certificate has expired."
          }
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Divider style={{ margin: '16px 0' }} />

      {/* Error Alert */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Step 1: PIN Entry */}
      {step === 'pin' && (
        <>
          <Alert
            message="Enter your PIN to unlock your digital certificate"
            description={
              <span>
                For demo purposes, use PIN: <Text code>1234</Text> or any 4+ digit PIN
              </span>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handlePinSubmit}
          >
            <Form.Item
              name="pin"
              label="Certificate PIN"
              rules={[
                { required: true, message: 'Please enter your PIN' },
                { min: 4, message: 'PIN must be at least 4 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter PIN"
                size="large"
                autoFocus
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!canSign}
                >
                  Verify & Continue
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}

      {/* Step 2: Signature Canvas */}
      {step === 'signature' && (
        <>
          <Alert
            title="Draw your signature below"
            description="Your signature will be embedded in the meeting notice document along with the digital certificate."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 16 }}
          />

          <div style={{ marginBottom: 16 }}>
            <SignatureCanvas
              width={460}
              height={150}
              lineColor="#1a365d"
              lineWidth={2}
              onSignatureChange={handleSignatureChange}
            />
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToPin}
            >
              Back
            </Button>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleSignatureSubmit}
                loading={approveMutation.isPending}
                disabled={!signatureDataUrl}
              >
                Confirm & Sign
              </Button>
            </Space>
          </div>
        </>
      )}

      {/* Step 3: Success */}
      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
          <Typography.Title level={4} style={{ color: '#52c41a', marginBottom: 8 }}>
            Meeting Confirmed Successfully!
          </Typography.Title>
          <Text type="secondary">
            The meeting notice has been signed and will be sent to participants.
          </Text>
          <div style={{ marginTop: 24 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Closing automatically...
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SignatureModal;
