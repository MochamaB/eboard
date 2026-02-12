import { ConfigProvider } from 'antd';
import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BoardProvider, useBoardContext, AuthProvider, ResponsiveProvider } from '../contexts';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds — data refreshes on re-navigation
      gcTime: 5 * 60 * 1000, // 5 minutes — keep unused cache before garbage collection
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      refetchOnWindowFocus: false,
    },
  },
});

// Inner component that uses the board context for theming
const ThemedApp: React.FC = () => {
  const { antdTheme } = useBoardContext();
  
  return (
    <ConfigProvider theme={antdTheme}>
      <Outlet />
    </ConfigProvider>
  );
};

// Board provider wrapper - must be inside AuthProvider since it uses useAuth
const BoardWrapper: React.FC = () => {
  return (
    <BoardProvider>
      <ResponsiveProvider>
        <ThemedApp />
      </ResponsiveProvider>
    </BoardProvider>
  );
};

// Root layout - AuthProvider must be outermost (after QueryClient)
// because BoardProvider depends on useAuth
// ResponsiveProvider is inside BoardProvider for clean context hierarchy
export const RootLayout: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BoardWrapper />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
