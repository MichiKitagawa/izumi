// client/src/pages/Register.tsx
import React, { useState } from 'react';
import { register } from '../api'; // API リクエスト関数のインポート
import { useTranslation } from 'react-i18next';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await register(email, password, name);
      if (response.message) {
        setSuccess(response.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || '登録に失敗しました。');
      } else {
        setError('登録に失敗しました。');
      }
    }
  };
  return (
    <div>
      <h1>{t('Register')}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
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
        <input
          type="text"
          placeholder={t('Name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">{t('Register')}</button>
      </form>
    </div>
  );
};

export default Register;
