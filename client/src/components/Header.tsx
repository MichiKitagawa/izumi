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
  const { token, role, setToken, setRole, setUser, user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [country, setCountry] = React.useState('');
  const [type, setType] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [category, setCategory] = React.useState('');

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setter(event.target.value as string);
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setUser(null); // ユーザー情報をリセット
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // ユーザー情報をローカルストレージから削除
    localStorage.removeItem('role'); // ロール情報をローカルストレージから削除
    window.location.href = '/welcome';
  };

  // ドロップダウンメニューのみをDrawerに表示
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {/* 言語切り替え */}
        <ListItem>
          <LanguageSwitcher />
        </ListItem>
        <Divider />
        {/* ドロップダウンメニュー */}
        <ListItem>
          <FormControl variant="standard" fullWidth>
            <InputLabel>{t('国')}</InputLabel>
            <Select value={country} onChange={handleChange(setCountry)} label={t('国')}>
              <MenuItem value="jp">日本</MenuItem>
              <MenuItem value="us">アメリカ</MenuItem>
              <MenuItem value="uk">イギリス</MenuItem>
              {/* 他の国も追加可能 */}
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
              {/* 他のタイプも追加可能 */}
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
              {/* 他のカテゴリーも追加可能 */}
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
          {/* 1. プロフィール写真 */}
          {token && (
            <IconButton component={Link} to="/profile" color="inherit" sx={{ mr: 2 }}>
              <AccountCircle />
            </IconButton>
          )}

          {/* 2. izumiのロゴ */}
          <Typography
            variant="h6"
            component={Link}
            to={token ? '/' : '/welcome'}
            sx={{ textDecoration: 'none', color: 'inherit', mr: 2 }}
          >
            izumi
          </Typography>

          {/* 3. 検索欄（デスクトップ） */}
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

          {/* 4. 検索アイコン（モバイル） */}
          {isMobile && (
            <IconButton color="inherit" sx={{ flexGrow: 1 }}>
              <SearchIcon />
            </IconButton>
          )}

          {/* 5. ハンバーガーメニュー */}
          <IconButton color="inherit" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer for navigation */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Header;
