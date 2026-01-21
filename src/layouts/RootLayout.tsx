import { ConfigProvider } from 'antd';
import { Outlet } from 'react-router-dom';
import { OrgThemeProvider, useOrgTheme } from '../contexts';

// Inner component that uses the theme context
const ThemedRoot: React.FC = () => {
  const { antdTheme } = useOrgTheme();
  
  return (
    <ConfigProvider theme={antdTheme}>
      <Outlet />
    </ConfigProvider>
  );
};

// Root layout that provides OrgThemeContext (must be inside Router)
export const RootLayout: React.FC = () => {
  return (
    <OrgThemeProvider>
      <ThemedRoot />
    </OrgThemeProvider>
  );
};

export default RootLayout;
