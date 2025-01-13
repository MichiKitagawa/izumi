// client/src/pages/Login.tsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useTranslation } from 'react-i18next';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import AuthContext from '../context/AuthContext'; // AuthContext のインポート

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setToken, setRole } = useContext(AuthContext); // AuthContext を使用
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await login(email, password);
      if (response.token) {
        setToken(response.token);
        localStorage.setItem('token', response.token);
        const decoded: { role: string } = JSON.parse(atob(response.token.split('.')[1]));
        setRole(decoded.role);
        navigate('/'); // ルートにリダイレクト
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'ログインに失敗しました。');
      } else {
        setError('ログインに失敗しました。');
      }
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '100px' }}>
      <Typography variant="h4" gutterBottom>
        {t('Login')}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label={t('Email')}
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label={t('Password')}
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {t('Login')}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default Login;
