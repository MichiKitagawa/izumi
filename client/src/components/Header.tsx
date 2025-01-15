// src/components/Header.tsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  TextField,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  Divider,
  SelectChangeEvent, // SelectChangeEvent をインポート
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useTheme, useMediaQuery } from '@mui/material';
import AuthContext from '../context/AuthContext';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [country, setCountry] = React.useState('');
  const [type, setType] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [category, setCategory] = React.useState('');

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (
    event: SelectChangeEvent<string>
  ) => {
    setter(event.target.value as string);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem>
          <LanguageSwitcher />
        </ListItem>
        <Divider />
        <ListItem>
          <FormControl variant="standard" fullWidth>
            <InputLabel>{t('国')}</InputLabel>
            <Select value={country} onChange={handleChange(setCountry)} label={t('国')}>
              <MenuItem value="jp">日本</MenuItem>
              <MenuItem value="us">アメリカ</MenuItem>
              <MenuItem value="uk">イギリス</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
        <Divider />
        <ListItem>
          <FormControl variant="standard" fullWidth>
            <InputLabel>{t('タイプ')}</InputLabel>
            <Select value={type} onChange={handleChange(setType)} label={t('タイプ')}>
              <MenuItem value="video">動画</MenuItem>
              <MenuItem value="image">画像</MenuItem>
              <MenuItem value="text">テキスト</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
        <Divider />
        <ListItem>
          <FormControl variant="standard" fullWidth>
            <InputLabel>{t('料金')}</InputLabel>
            <Select value={price} onChange={handleChange(setPrice)} label={t('料金')}>
              <MenuItem value="free">無料</MenuItem>
              <MenuItem value="paid">有料</MenuItem>
              <MenuItem value="subscription">サブスクリプション</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
        <Divider />
        <ListItem>
          <FormControl variant="standard" fullWidth>
            <InputLabel>{t('カテゴリー')}</InputLabel>
            <Select value={category} onChange={handleChange(setCategory)} label={t('カテゴリー')}>
              <MenuItem value="business">ビジネス</MenuItem>
              <MenuItem value="lifestyle">ライフスタイル</MenuItem>
              <MenuItem value="education">教育</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
        <Divider />
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {token && (
            <IconButton component={Link} to="/profile" color="inherit" sx={{ mr: 2 }}>
              <AccountCircle />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to={token ? '/' : '/welcome'}
            sx={{ textDecoration: 'none', color: 'inherit', mr: 2 }}
          >
            izumi
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', maxWidth: 400 }}>
              <TextField
                variant="outlined"
                placeholder={t('Search')}
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" color="inherit">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {isMobile && (
            <IconButton color="inherit" sx={{ flexGrow: 1 }}>
              <SearchIcon />
            </IconButton>
          )}

          <IconButton color="inherit" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
};export default Header;
