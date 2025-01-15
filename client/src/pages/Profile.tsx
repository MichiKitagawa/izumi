// client/src/pages/Profile.tsx
import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Avatar, Box, Paper } from '@mui/material';
import { API_BASE_URL } from '../api';
import AuthContext from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; // 多言語対応を使用している場合

const Profile: React.FC = () => {
  const { token, user, setUser } = useContext(AuthContext);
  const { t } = useTranslation(); // 多言語対応を使用している場合
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(user?.profileImage || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPreviewImage(user.profileImage);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage(t('Authentication token is missing.')); // 多言語対応を使用している場合
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const res = await axios.put(`${API_BASE_URL}/profile/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(res.data.message);
      if (res.data.user) {
        // AuthContextのuser情報を更新
        setUser({
          name: res.data.user.name,
          profileImage: res.data.user.profileImage || user?.profileImage || '', // photoUrl から profileImage に変更
        });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message || t('Update failed.')); // 多言語対応を使用している場合
      } else {
        setMessage(t('Update failed.')); // 多言語対応を使用している場合
      }
    }
  };
  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            alt={user?.name || 'User'}
            src={previewImage || '/default-avatar.png'}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            {t('Profile')} {/* 多言語対応を使用している場合 */}
          </Typography>
          <form onSubmit={handleUpdate} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label={t('Name')} // 多言語対応を使用している場合
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="profile-image-upload">
              <Button variant="contained" color="secondary" component="span">
                {t('Upload Profile Image')} {/* 多言語対応を使用している場合 */}
              </Button>
            </label>
            {previewImage && (
              <Avatar
                src={previewImage}
                alt="Profile Preview"
                sx={{ width: 100, height: 100, mt: 2 }}
              />
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {t('Update Profile')} {/* 多言語対応を使用している場合 */}
            </Button>
          </form>
          {message && (
            <Typography variant="body1" color={message.includes('failed') ? 'error' : 'success'} sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
