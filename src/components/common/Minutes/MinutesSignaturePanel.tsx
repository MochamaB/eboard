/**
 * Minutes Signature Panel
 * Display signatures and signature status for minutes approval
 */

import React, { useState } from 'react';
import { Card, Space, Typography, Button, Avatar, Tag, Divider, Empty, Modal, Select, Input } from 'antd';
import {
  UserOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { MinutesSignature } from '../../../types/minutes.types';

const { Text } = Typography;

interface MinutesSignaturePanelProps {
  minutesId: string;
  signatures: MinutesSignature[];
  requiredSigners: { role: string; name: string; userId: number }[];
  canSign: boolean;
  currentUserRole?: string;
  currentUserName?: string;
  onAddSignature: (payload: {
    signerRole: string;
    signerName: string;
    signatureHash: string;
    signatureMethod: 'digital' | 'biometric' | 'pin';
    certificateId?: string;
  }) => void;
}

export const MinutesSignaturePanel: React.FC<MinutesSignaturePanelProps> = ({
  minutesId: _minutesId,
  signatures,
  requiredSigners,
  canSign,
  currentUserRole,
  currentUserName,
  onAddSignature,
}) => {
  const { theme } = useBoardContext();
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'digital' | 'biometric' | 'pin'>('digital');
  const [pin, setPin] = useState('');

  const hasUserSigned = signatures.some(
    sig => sig.signerRole === currentUserRole && sig.signerName === currentUserName
  );

  const getSignatureStatus = (signer: { role: string; name: string }) => {
    const signature = signatures.find(
      sig => sig.signerRole === signer.role && sig.signerName === signer.name
    );
    return signature;
  };

  const allRequiredSignaturesPresent = requiredSigners.every(signer => 
    getSignatureStatus(signer) !== undefined
  );

  const handleSign = () => {
    if (!currentUserRole || !currentUserName) return;

    const signatureHash = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const certificateId = signatureMethod === 'digital' 
      ? `cert_${Math.random().toString(36).substr(2, 9)}`
      : undefined;

    onAddSignature({
      signerRole: currentUserRole,
      signerName: currentUserName,
      signatureHash,
      signatureMethod,
      certificateId,
    });

    setIsSignModalOpen(false);
    setPin('');
  };

  return (
    <>
      <Card
        title={
          <Space>
            <SafetyOutlined />
            <span>Signatures</span>
            {allRequiredSignaturesPresent ? (
              <Tag color={theme.successColor} icon={<CheckCircleOutlined />}>
                All Signed
              </Tag>
            ) : (
              <Tag color={theme.warningColor}>
                {signatures.length}/{requiredSigners.length} Signed
              </Tag>
            )}
          </Space>
        }
        size="small"
        styles={{
          body: { padding: '16px' },
        }}
        extra={
          canSign && !hasUserSigned && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsSignModalOpen(true)}
            >
              Sign Minutes
            </Button>
          )
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '12px' }}>
              Required Signatures
            </Text>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {requiredSigners.map((signer, index) => {
                const signature = getSignatureStatus(signer);
                const isSigned = !!signature;

                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: isSigned ? theme.successLight : theme.backgroundSecondary,
                      borderRadius: '6px',
                      border: `1px solid ${isSigned ? theme.successColor : theme.borderColor}`,
                    }}
                  >
                    <Space size={12}>
                      <Avatar 
                        size="small" 
                        icon={<UserOutlined />}
                        style={{ 
                          backgroundColor: isSigned ? theme.successColor : theme.textSecondary 
                        }}
                      />
                      <div>
                        <Text strong style={{ fontSize: '13px', display: 'block' }}>
                          {signer.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {signer.role}
                        </Text>
                      </div>
                    </Space>
                    {isSigned ? (
                      <Space direction="vertical" size={0} align="end">
                        <Tag color={theme.successColor} icon={<CheckCircleOutlined />}>
                          Signed
                        </Tag>
                        {signature.verified && (
                          <Tag color={theme.infoColor} style={{ fontSize: '10px', marginTop: '4px' }}>
                            Verified
                          </Tag>
                        )}
                        <Text type="secondary" style={{ fontSize: '11px', marginTop: '4px' }}>
                          {new Date(signature.signedAt).toLocaleString()}
                        </Text>
                      </Space>
                    ) : (
                      <Tag color={theme.textSecondary} icon={<CloseCircleOutlined />}>
                        Pending
                      </Tag>
                    )}
                  </div>
                );
              })}
            </Space>
          </div>

          {signatures.length > 0 && <Divider style={{ margin: 0 }} />}

          {signatures.length > 0 && (
            <div>
              <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '12px' }}>
                Signature Details
              </Text>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {signatures.map((signature) => (
                  <div
                    key={signature.id}
                    style={{
                      padding: '10px',
                      backgroundColor: theme.backgroundSecondary,
                      borderRadius: '4px',
                      border: `1px solid ${theme.borderColor}`,
                    }}
                  >
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text strong style={{ fontSize: '12px' }}>
                          {signature.signerName} ({signature.signerRole})
                        </Text>
                        <Tag style={{ fontSize: '10px' }}>
                          {signature.signatureMethod.toUpperCase()}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        Signed: {new Date(signature.signedAt).toLocaleString()}
                      </Text>
                      {signature.verified && signature.verificationDate && (
                        <Text type="success" style={{ fontSize: '11px' }}>
                          Verified: {new Date(signature.verificationDate).toLocaleString()}
                        </Text>
                      )}
                      {signature.certificateId && (
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          Certificate: {signature.certificateId}
                        </Text>
                      )}
                    </Space>
                  </div>
                ))}
              </Space>
            </div>
          )}

          {signatures.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No signatures yet"
              style={{ padding: '20px 0' }}
            />
          )}
        </Space>
      </Card>

      <Modal
        title="Sign Minutes"
        open={isSignModalOpen}
        onOk={handleSign}
        onCancel={() => {
          setIsSignModalOpen(false);
          setPin('');
        }}
        okText="Sign"
        okButtonProps={{ disabled: signatureMethod === 'pin' && !pin }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%', padding: '16px 0' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Signature Method
            </Text>
            <Select
              value={signatureMethod}
              onChange={setSignatureMethod}
              style={{ width: '100%' }}
              options={[
                { value: 'digital', label: 'Digital Signature (Certificate)' },
                { value: 'biometric', label: 'Biometric Signature' },
                { value: 'pin', label: 'PIN Signature' },
              ]}
            />
          </div>

          {signatureMethod === 'pin' && (
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Enter PIN
              </Text>
              <Input.Password
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                maxLength={6}
              />
            </div>
          )}

          <div style={{ 
            padding: '12px', 
            backgroundColor: theme.infoLight, 
            borderRadius: '6px',
          }}>
            <Text style={{ fontSize: '12px' }}>
              By signing these minutes, you confirm that you have reviewed the content and 
              approve it for {signatures.length === requiredSigners.length - 1 ? 'publication' : 'the next stage of approval'}.
            </Text>
          </div>
        </Space>
      </Modal>
    </>
  );
};
