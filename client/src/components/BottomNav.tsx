// client/src/components/BottomNav.tsx
import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, useMediaQuery, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // md以下の画面サイズで表示

  const getValue = React.useCallback(() => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/mylist')) return 'mylist';
    if (location.pathname.startsWith('/settings')) return 'settings';
    return 'home';
  }, [location.pathname]);

  const [value, setValue] = React.useState(getValue());

  React.useEffect(() => {
    setValue(getValue());
  }, [getValue]);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    if (newValue === 'home') navigate('/');
    if (newValue === 'mylist') navigate('/mylist');
    if (newValue === 'settings') navigate('/settings');
  };

  if (!isMobile) {
    return null; // デスクトップでは表示しない
  }

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation value={value} onChange={handleChange}>
        <BottomNavigationAction label="HOME" value="home" icon={<HomeIcon />} />
        <BottomNavigationAction label="MyList" value="mylist" icon={<FavoriteIcon />} />
        <BottomNavigationAction label="Setting" value="settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  );
};
export default BottomNav;
