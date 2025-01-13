// client/src/pages/Login.tsx
import React, { useState } from 'react';
import { login } from '../api'; // API リクエスト関数のインポート
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setToken(null);

    try {
      const response = await login(email, password);
      if (response.token) {
        setToken(response.token);
        localStorage.setItem('token', response.token);
        // 必要に応じてリダイレクトなどの処理を追加
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
    <div>
      <h1>{t('Login')}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {token && <p style={{ color: 'green' }}>ログインに成功しました。</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder={t('Email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('Password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t('Login')}</button>
      </form>
    </div>
  );
};

export default Login;
