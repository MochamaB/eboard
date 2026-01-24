/**
 * Login Page
 * Provides login form and dev quick-login buttons for prototype testing
 */

import { useState } from 'react';
import { Card, Form, Input, Button, Divider, Space, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

const { Text } = Typography;

// Dev login presets for quick testing - using actual users from usersTable with userBoardRoles
const DEV_USERS = [
  { 
    email: 'brian.mochama@ktdateas.com', 
    label: 'System Admin',
    description: 'Full system access (User ID: 20)'
  },
  { 
    email: 'chege.kirundi@ktda.co.ke', 
    label: 'Group Chairman',
    description: 'KTDA MS Chairman (User ID: 1)'
  },
  { 
    email: 'mathew.odero@ktdateas.com', 
    label: 'Group Company Secretary',
    description: 'Global secretary access (User ID: 3)'
  },
  { 
    email: 'gg.kagombe@ktdateas.com', 
    label: 'Board Member',
    description: 'Zone 1 Director (User ID: 4)'
  },
  { 
    email: 'kmuhia@ktdateas.com', 
    label: 'Board Secretary',
    description: 'KTDA MS Secretary (User ID: 17)'
  },
  { 
    email: 'headofict@ktdateas.com', 
    label: 'Presenter',
    description: 'Head of ICT (User ID: 22)'
  },
];

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await login(values);
      if (response.user.mfaRequired) {
        navigate('/auth/mfa');
      } else {
        message.success(`Welcome, ${response.user.firstName}!`);
        // Navigate to root - DynamicBoardRedirect will handle routing to user's primary board
        navigate('/');
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
      // All dev users use password123
      const response = await login({ email, password: 'password123' });
      if (response.user.mfaRequired) {
        // For dev, auto-verify MFA with any 6-digit code
        navigate('/auth/mfa');
      } else {
        message.success(`Welcome, ${response.user.firstName}!`);
        // Navigate to root - DynamicBoardRedirect will handle routing to user's primary board
        navigate('/');
      }
    } catch (error) {
      message.error('Login failed. Check if user exists in mock data.');
    } finally {
      setDevLoading(null);
    }
  };

  return (
    <Card style={{ width: '100%', maxWidth: 400 }}>
      <Form
        name="login"
        onFinish={handleLogin}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email address"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            Sign In
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          <a href="/auth/forgot-password">Forgot password?</a>
        </div>
      </Form>

      {/* Dev Quick Login Section */}
      <Divider>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ThunderboltOutlined /> Quick Login (Demo)
        </Text>
      </Divider>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {DEV_USERS.map((user) => (
          <Button
            key={user.email}
            block
            onClick={() => handleDevLogin(user.email)}
            loading={devLoading === user.email}
            style={{ 
              textAlign: 'left', 
              height: 'auto', 
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>
              <strong>{user.label}</strong>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {user.description}
              </Text>
            </span>
          </Button>
        ))}
      </Space>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Demo password for all users: <code>password123</code>
        </Text>
      </div>
    </Card>
  );
};

export default LoginPage;
