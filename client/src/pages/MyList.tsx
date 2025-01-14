// client/src/pages/MyList.tsx
import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import Favorites from './Favorites';
import Downloads from './Downloads';

const MyList: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={handleChange} centered>
        <Tab label="お気に入り" />
        <Tab label="ダウンロード" />
      </Tabs>
      <Box sx={{ p: 2 }}>
        {value === 0 && <Favorites />}
        {value === 1 && <Downloads />}
      </Box>
    </Box>
  );
};

export default MyList;
