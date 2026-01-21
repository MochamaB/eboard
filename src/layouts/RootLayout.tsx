import { ConfigProvider } from 'antd';
import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrgThemeProvider, useOrgTheme, AuthProvider } from '../contexts';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Inner component that uses the theme context
const ThemedRoot: React.FC = () => {
  const { antdTheme } = useOrgTheme();
  
  return (
    <ConfigProvider theme={antdTheme}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ConfigProvider>
  );
};

// Root layout that provides OrgThemeContext (must be inside Router)
export const RootLayout: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <OrgThemeProvider>
        <ThemedRoot />
      </OrgThemeProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
