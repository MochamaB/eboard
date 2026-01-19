import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { themeConfig } from './theme';
import { router } from './routes';

function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
