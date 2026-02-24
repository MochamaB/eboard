import { Outlet } from 'react-router-dom';
import { colors } from '../theme';

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* Left Panel - Branding & Illustration */}
      <div
        style={{
          flex: '1 1 60%',
          background: `linear-gradient(135deg, ${colors.tertiary} 0%, #e8ebe6 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 250, height: 250, borderRadius: '50%',
          background: 'rgba(50, 71, 33, 0.06)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255, 175, 0, 0.08)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
          {/* App Title */}
          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            color: colors.primary,
            margin: 0,
            lineHeight: 1.2,
          }}>
            KTDA <span style={{ color: colors.secondary }}>eBoard</span>
          </h1>
          <p style={{
            fontSize: 16,
            color: colors.secondary,
            marginTop: 8,
            marginBottom: 40,
            fontWeight: 500,
          }}>
            Digital Board Management Platform for KTDA Group
          </p>

          {/* Illustration */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 40,
          }}>
            <img
              src="/assets/eboard2.svg"
              alt="eBoard"
              style={{
                maxWidth: 620,
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.1))',
              }}
            />
          </div>

          {/* Feature highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { icon: '📋', text: 'Manage board meetings, agendas & resolutions' },
              { icon: '👥', text: 'Track board members, committees & compliance' },
              { icon: '📊', text: 'Real-time dashboards & governance reports' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 14,
                color: colors.textSecondary,
              }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer on left */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: 60,
          color: colors.textMuted,
          fontSize: 12,
        }}>
          © 2026 KTDA. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div
        style={{
          flex: '1 1 40%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 48px',
          background: '#ffffff',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
