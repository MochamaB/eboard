/**
 * Login Page
 * Provides login form and dev quick-login buttons for prototype testing
 */

import { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Collapse, Divider, Spin, message, Typography } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  AuditOutlined,
  TeamOutlined,
  SolutionOutlined,
  FileTextOutlined,
  SettingOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { colors } from '../../theme';
import apiClient from '../../api/client';

const { Text } = Typography;

// Map role codes to icons
const ROLE_ICONS: Record<string, React.ReactNode> = {
  system_admin: <SafetyCertificateOutlined />,
  group_chairman: <CrownOutlined />,
  group_company_secretary: <AuditOutlined />,
  board_member: <TeamOutlined />,
  board_secretary: <SolutionOutlined />,
  presenter: <FileTextOutlined />,
};

// Type for the dev-users API response
interface DevUser {
  email: string;
  fullName: string;
  avatar: string | null;
  description: string;
}

interface DevUserGroup {
  role: string;
  roleName: string;
  users: DevUser[];
}

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState<string | null>(null);
  const [devUserGroups, setDevUserGroups] = useState<DevUserGroup[]>([]);
  const [devUsersLoading, setDevUsersLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the return URL from location state (set by ProtectedRoute)
  const from = location.state?.from;
  const returnUrl = from ? `${from.pathname}${from.search}${from.hash}` : '/';

  // Fetch dev users from backend on mount
  useEffect(() => {
    const fetchDevUsers = async () => {
      try {
        const response = await apiClient.get('/auth/dev-users');
        setDevUserGroups(response.data || []);
      } catch {
        // Endpoint not available (production or backend down) — hide quick login
        setDevUserGroups([]);
      } finally {
        setDevUsersLoading(false);
      }
    };
    fetchDevUsers();
  }, []);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await login(values);
      if (response.user.mfaEnabled) {
        navigate('/auth/mfa');
      } else {
        message.success(`Welcome, ${response.user.firstName}!`);
        navigate(returnUrl);
      }
    } catch (error) {
      message.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (email: string) => {
    setDevLoading(email);
    try {
      const response = await login({ email, password: 'Password123!' });
      if (response.user.mfaEnabled) {
        navigate('/auth/mfa');
      } else {
        message.success(`Welcome, ${response.user.firstName}!`);
        navigate(returnUrl);
      }
    } catch (error) {
      message.error('Login failed. Check if user exists.');
    } finally {
      setDevLoading(null);
    }
  };

  const getRoleIcon = (roleCode: string): React.ReactNode => {
    return ROLE_ICONS[roleCode] || <SettingOutlined />;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 24,
          textAlign: 'center',
        }}
      >
        <img
          src="/assets/ktdadefault/ktdalogo-dark.png"
          alt="KTDA"
          style={{
            height: 64,
            objectFit: 'contain',
            marginBottom: 16,
            display: 'block',
          }}
        />

        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: colors.primary,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          Welcome to <span style={{ color: colors.secondary }}>eBoard</span>
        </h2>

        <Text type="secondary" style={{ fontSize: 13 }}>
          Please enter your credentials to continue
        </Text>
      </div>

      {/* Login Form */}
      <Form
        name="login"
        onFinish={handleLogin}
        layout="vertical"
        requiredMark={false}
        initialValues={{ remember: true }}
      >
        <Form.Item
          name="email"
          label={<span style={{ fontWeight: 600, fontSize: 13 }}>Email</span>}
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: colors.textMuted }} />}
            placeholder="you@ktdateas.com"
            size="middle"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span style={{ fontWeight: 600, fontSize: 13 }}>Password</span>}
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: colors.textMuted }} />}
            placeholder="Enter your password"
            size="middle"
            style={{ borderRadius: 6 }}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>
                <Text style={{ fontSize: 13 }}>Remember me</Text>
              </Checkbox>
            </Form.Item>
            <a href="/auth/forgot-password" style={{ fontSize: 13, color: colors.secondary, fontWeight: 500 }}>
              Forgot password?
            </a>
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{
              height: 44,
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 15,
              background: colors.primary,
              borderColor: colors.primary,
            }}
          >
            Sign In
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <SafetyCertificateOutlined style={{ color: colors.textMuted, marginRight: 6, fontSize: 12 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Secure login for KTDA employees only
          </Text>
        </div>
      </Form>

      {/* Dev Quick Login Section — only shown if endpoint returned data */}
      {devUsersLoading ? (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} />} size="small" />
        </div>
      ) : devUserGroups.length > 0 && (
        <>
          <Divider style={{ margin: '16px 0 12px' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              <ThunderboltOutlined /> Quick Login (Dev)
            </Text>
          </Divider>

          <div
            style={{
              maxHeight: 240,
              overflowY: 'auto',
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: 4,
            }}
          >
            <Collapse
              accordion
              size="small"
              bordered={false}
              style={{ background: 'transparent' }}
              items={devUserGroups.map((group) => ({
                key: group.role,
                label: (
                  <span style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getRoleIcon(group.role)} {group.roleName}
                    <span style={{ fontWeight: 400, color: colors.textMuted, fontSize: 11 }}>
                      ({group.users.length})
                    </span>
                  </span>
                ),
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {group.users.map((user) => (
                      <Button
                        key={user.email}
                        type="text"
                        block
                        size="small"
                        onClick={() => handleDevLogin(user.email)}
                        loading={devLoading === user.email}
                        style={{
                          textAlign: 'left',
                          height: 'auto',
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: `1px solid ${colors.border}`,
                          background: colors.tertiary,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>
                            {user.fullName}
                          </div>
                          <div style={{ fontSize: 11, color: colors.textMuted }}>
                            {user.description || user.email}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ),
              }))}
            />
          </div>

          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 10 }}>
              Password: <code style={{ fontSize: 10 }}>Password123!</code>
            </Text>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginPage;
