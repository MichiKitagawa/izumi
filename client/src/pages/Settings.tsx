// client/src/pages/Settings.tsx
import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import Profile from './Profile';
import Subscription from './Subscription';
import UploadProduct from './UploadProduct';
import UserProducts from './UserProducts';

const Settings: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={handleChange} centered>
        <Tab label="プロフィール" />
        <Tab label="サブスクリプション" />
        <Tab label="商品アップロード" />
        <Tab label="商品一覧" />
      </Tabs>
      <Box sx={{ p: 2 }}>
        {value === 0 && <Profile />}
        {value === 1 && <Subscription />}
        {value === 2 && <UploadProduct />}
        {value === 3 && <UserProducts />}
      </Box>
    </Box>
  );
};

export default Settings;
