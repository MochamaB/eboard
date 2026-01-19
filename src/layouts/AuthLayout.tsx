import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { colors } from '../theme';

const { Content } = Layout;

export const AuthLayout: React.FC = () => {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: colors.tertiary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          width: '100%',
          maxWidth: 480,
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            <span style={{ color: colors.primary }}>KTDA</span>{' '}
            <span style={{ color: colors.secondary }}>eBoard</span>
          </div>
          <div style={{ color: colors.textSecondary, fontSize: 14 }}>
            Board Management Portal
          </div>
        </div>

        {/* Auth content (login form, etc.) */}
        <Outlet />

        {/* Footer */}
        <div
          style={{
            marginTop: 40,
            textAlign: 'center',
            color: colors.textMuted,
            fontSize: 12,
          }}
        >
          © 2026 KTDA. All rights reserved.
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
