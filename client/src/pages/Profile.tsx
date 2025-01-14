// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography } from '@mui/material';
import { API_BASE_URL } from '../api';

const Profile: React.FC = () => {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      console.log('Fetched Token:', token);
      try {
        const res = await axios.get(`${API_BASE_URL}/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setName(res.data.user.name);
        setPreviewImage(res.data.user.profileImage);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          setMessage(error.response.data.message || 'Failed to fetch profile.');
        } else {
          setMessage('Failed to fetch profile.');
        }
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    console.log('Update Token:', token);

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
      if (res.data.user.profileImage) {
        setPreviewImage(res.data.user.profileImage);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message || 'Update failed.');
      } else {
        setMessage('Update failed.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <form onSubmit={handleUpdate}>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
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
            Upload Profile Image
          </Button>
        </label>
        {previewImage && (
          <img
            src={previewImage}
            alt="Profile Preview"
            style={{ width: '100px', height: '100px', marginTop: '10px' }}
          />
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
          Update Profile
        </Button>
      </form>
      {message && <Typography variant="body1">{message}</Typography>}
    </Container>
  );
};

export default Profile;
