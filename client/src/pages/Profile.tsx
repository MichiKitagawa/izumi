// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography } from '@mui/material';

const Profile: React.FC = () => {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/api/profile/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setName(res.data.name);
        setProfileImage(res.data.profileImage);
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(
        '/api/profile/',
        { name, profileImage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(res.data.message);
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
        <TextField
          label="Profile Image URL"
          variant="outlined"
          fullWidth
          margin="normal"
          value={profileImage}
          onChange={(e) => setProfileImage(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Update Profile
        </Button>
      </form>
      {message && <Typography variant="body1">{message}</Typography>}
    </Container>
  );
};
export default Profile;
