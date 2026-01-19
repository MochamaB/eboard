import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { OrgThemeProvider, useOrgTheme } from './contexts';
import { router } from './routes';

// Inner component that uses the theme context
const ThemedApp: React.FC = () => {
  const { antdTheme } = useOrgTheme();
  
  return (
    <ConfigProvider theme={antdTheme}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

function App() {
  return (
    <OrgThemeProvider>
      <ThemedApp />
    </OrgThemeProvider>
  );
}

export default App;
