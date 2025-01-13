// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Drawer,
  List,
  ListItemButton, // 追加
  ListItemText,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useTheme, useMediaQuery } from '@mui/material';

interface HeaderProps {
  role: string | null;
}

const Header: React.FC<HeaderProps> = ({ role }) => {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
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

  const menuItems = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {/* ドロップダウンメニュー項目 */}
        <ListItemButton>
          <FormControl variant="standard" fullWidth>
            <InputLabel>{t('国')}</InputLabel>
            <Select value={country} onChange={handleChange(setCountry)} label={t('国')}>
              <MenuItem value="jp">日本</MenuItem>
              <MenuItem value="us">アメリカ</MenuItem>
              <MenuItem value="uk">イギリス</MenuItem>
              {/* 他の国も追加可能 */}
            </Select>
          </FormControl>
        </ListItemButton>
        <Divider />
        <ListItemButton>
          <FormControl variant="standard" fullWidth>
            <InputLabel>{t('タイプ')}</InputLabel>
            <Select value={type} onChange={handleChange(setType)} label={t('タイプ')}>
              <MenuItem value="video">動画</MenuItem>
              <MenuItem value="image">画像</MenuItem>
              <MenuItem value="text">テキスト</MenuItem>
              {/* 他のタイプも追加可能 */}
            </Select>
          </FormControl>
        </ListItemButton>
        <Divider />
        <ListItemButton>
          <FormControl variant="standard" fullWidth>
            <InputLabel>{t('料金')}</InputLabel>
            <Select value={price} onChange={handleChange(setPrice)} label={t('料金')}>
              <MenuItem value="free">無料</MenuItem>
              <MenuItem value="paid">有料</MenuItem>
              <MenuItem value="subscription">サブスクリプション</MenuItem>
            </Select>
          </FormControl>
        </ListItemButton>
        <Divider />
        <ListItemButton>
          <FormControl variant="standard" fullWidth>
            <InputLabel>{t('カテゴリー')}</InputLabel>
            <Select value={category} onChange={handleChange(setCategory)} label={t('カテゴリー')}>
              <MenuItem value="business">ビジネス</MenuItem>
              <MenuItem value="lifestyle">ライフスタイル</MenuItem>
              <MenuItem value="education">教育</MenuItem>
              {/* 他のカテゴリーも追加可能 */}
            </Select>
          </FormControl>
        </ListItemButton>
      </List>
      <Divider />
      {/* ユーザー関連リンク */}
      <List>
        {token ? (
          <>
            <ListItemButton component={Link} to="/profile">
              <ListItemText primary={t('Profile')} />
            </ListItemButton>
            <ListItemButton component={Link} to="/subscription">
              <ListItemText primary={t('Subscription')} />
            </ListItemButton>
            <ListItemButton component={Link} to="/ai">
              <ListItemText primary={t('AI Processing')} />
            </ListItemButton>
            <ListItemButton component={Link} to="/revenue-report">
              <ListItemText primary={t('Revenue Report')} />
            </ListItemButton>
            {role === 'admin' && (
              <ListItemButton component={Link} to="/admin">
                <ListItemText primary={t('Admin')} />
              </ListItemButton>
            )}
            {role === 'provider' && (
              <ListItemButton component={Link} to="/upload">
                <ListItemText primary={t('Upload Product')} />
              </ListItemButton>
            )}
            <ListItemButton component={Link} to="/logout">
              <ListItemText primary={t('Logout')} />
            </ListItemButton>
          </>
        ) : (
          <>
            <ListItemButton component={Link} to="/register">
              <ListItemText primary={t('Register')} />
            </ListItemButton>
            <ListItemButton component={Link} to="/login">
              <ListItemText primary={t('Login')} />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* 左: ロゴ */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit', mr: 2 }}
          >
            izumi
          </Typography>

          {/* 中央: ドロップダウンメニュー (デスクトップのみ) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', flexGrow: 1, gap: 2 }}>
              {/* 国 */}
              <FormControl variant="standard" sx={{ minWidth: 120, color: 'inherit' }}>
                <InputLabel sx={{ color: 'inherit' }}>{t('国')}</InputLabel>
                <Select
                  value={country}
                  onChange={handleChange(setCountry)}
                  label={t('国')}
                  sx={{ color: 'inherit', borderBottom: '1px solid white' }}
                >
                  <MenuItem value="jp">日本</MenuItem>
                  <MenuItem value="us">アメリカ</MenuItem>
                  <MenuItem value="uk">イギリス</MenuItem>
                  {/* 他の国も追加可能 */}
                </Select>
              </FormControl>

              {/* タイプ */}
              <FormControl variant="standard" sx={{ minWidth: 120, color: 'inherit' }}>
                <InputLabel sx={{ color: 'inherit' }}>{t('タイプ')}</InputLabel>
                <Select
                  value={type}
                  onChange={handleChange(setType)}
                  label={t('タイプ')}
                  sx={{ color: 'inherit', borderBottom: '1px solid white' }}
                >
                  <MenuItem value="video">動画</MenuItem>
                  <MenuItem value="image">画像</MenuItem>
                  <MenuItem value="text">テキスト</MenuItem>
                  {/* 他のタイプも追加可能 */}
                </Select>
              </FormControl>

              {/* 料金 */}
              <FormControl variant="standard" sx={{ minWidth: 120, color: 'inherit' }}>
                <InputLabel sx={{ color: 'inherit' }}>{t('料金')}</InputLabel>
                <Select
                  value={price}
                  onChange={handleChange(setPrice)}
                  label={t('料金')}
                  sx={{ color: 'inherit', borderBottom: '1px solid white' }}
                >
                  <MenuItem value="free">無料</MenuItem>
                  <MenuItem value="paid">有料</MenuItem>
                  <MenuItem value="subscription">サブスクリプション</MenuItem>
                </Select>
              </FormControl>

              {/* カテゴリー */}
              <FormControl variant="standard" sx={{ minWidth: 150, color: 'inherit' }}>
                <InputLabel sx={{ color: 'inherit' }}>{t('カテゴリー')}</InputLabel>
                <Select
                  value={category}
                  onChange={handleChange(setCategory)}
                  label={t('カテゴリー')}
                  sx={{ color: 'inherit', borderBottom: '1px solid white' }}
                >
                  <MenuItem value="business">ビジネス</MenuItem>
                  <MenuItem value="lifestyle">ライフスタイル</MenuItem>
                  <MenuItem value="education">教育</MenuItem>
                  {/* 他のカテゴリーも追加可能 */}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* 右: 検索アイコン、言語スイッチャー、ユーザーアイコン (デスクトップのみ) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit">
                <SearchIcon />
              </IconButton>
              <LanguageSwitcher />
              {token && (
                <IconButton color="inherit" component={Link} to="/profile">
                  <AccountCircle />
                </IconButton>
              )}
              {!token && (
                <>
                  <Button color="inherit" component={Link} to="/register">
                    {t('Register')}
                  </Button>
                  <Button color="inherit" component={Link} to="/login">
                    {t('Login')}
                  </Button>
                </>
              )}
              {token && (
                <>
                  <Button color="inherit" component={Link} to="/subscription">
                    {t('Subscription')}
                  </Button>
                  <Button color="inherit" component={Link} to="/ai">
                    {t('AI Processing')}
                  </Button>
                  <Button color="inherit" component={Link} to="/revenue-report">
                    {t('Revenue Report')}
                  </Button>
                  {role === 'admin' && (
                    <Button color="inherit" component={Link} to="/admin">
                      {t('Admin')}
                    </Button>
                  )}
                  {role === 'provider' && (
                    <Button color="inherit" component={Link} to="/upload">
                      {t('Upload Product')}
                    </Button>
                  )}
                </>
              )}
            </Box>
          )}

          {/* ハンバーガーメニュー (モバイルのみ) */}
          {isMobile && (
            <IconButton color="inherit" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile navigation */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {menuItems}
      </Drawer>
    </>
  );
};
export default Header;
