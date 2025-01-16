// client/src/pages/Login.tsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { login } from '../api';
import AuthContext from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { setToken, setUser, setRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      if (res.token) {
        setToken(res.token);
        setUser({
          name: res.user.name,
          profileImage: res.user.profileImage || '/default-avatar.png',
        });
        setRole(res.user.role);
        navigate('/');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message || t('Login failed.'));
      } else {
        setMessage(t('Login failed.'));
      }
    }
  };
  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" minHeight="80vh">
        <Typography variant="h4" gutterBottom>
          {t('Login')}
        </Typography>
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField
            label={t('Email')}
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label={t('Password')}
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {t('Login')}
          </Button>
        </form>
        {message && (
          <Typography variant="body1" color="error" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Login;
