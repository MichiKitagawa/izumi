// src/App.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import AdBanner from './components/AdBanner';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (token) {
      const decoded: { role: string } = JSON.parse(atob(token.split('.')[1]));
      setRole(decoded.role);
    }
  }, [token]);

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            izumi
          </Typography>
          <LanguageSwitcher />
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
              <Button color="inherit" component={Link} to="/profile">
                {t('Profile')}
              </Button>
              <Button color="inherit" component={Link} to="/subscription">
                {t('Subscription')}
              </Button>
              <Button color="inherit" component={Link} to="/ai">
                {t('AI Processing')}
              </Button>
              <Button color="inherit" component={Link} to="/products">
                {t('Products')}
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
        </Toolbar>
      </AppBar>
      <Typography variant="h3" align="center" style={{ marginTop: '50px' }}>
        {t('Welcome')}
      </Typography>
      <AdBanner />
      <footer style={{ marginTop: '50px', padding: '20px', backgroundColor: '#f5f5f5', textAlign: 'center' }}>
        <Typography variant="body2">
          <Link to="/terms">利用規約</Link> | <Link to="/privacy">プライバシーポリシー</Link>
        </Typography>
      </footer>
    </div>
  );
};

export default App;
