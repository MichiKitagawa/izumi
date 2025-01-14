// client/src/App.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import theme from './theme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Box sx={{ padding: { xs: '10px', sm: '20px', md: '40px' }, paddingBottom: '60px' }}>
        <Outlet /> {/* 子ルートのコンテンツがここにレンダリングされる */}
      </Box>
      <BottomNav />
    </ThemeProvider>
  );
};
export default App;
