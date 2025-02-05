// src/pages/UploadProduct.tsx
import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Container,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
} from '@mui/material';
import { API_BASE_URL } from '../api';

const availableLanguages = ['ja', 'en', 'es', 'fr', 'de', 'it', 'zh'];

const UploadProduct: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState(availableLanguages[0]); // 初期値: "ja"
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }
    if (!thumbnail) {
      setMessage('Please select a thumbnail image.');
      return;
    }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('language', language); // アップロード時の言語情報を追加
    formData.append('file', file);
    formData.append('thumbnail', thumbnail);

    try {
      const res = await axios.post(`${API_BASE_URL}/product/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(res.data.message);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message || 'Upload failed.');
      } else {
        setMessage('Upload failed.');
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Upload Product
      </Typography>
      <Box component="form" onSubmit={handleUpload} sx={{ mt: 2 }}>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as string)}
            label="Category"
          >
            <MenuItem value="Education">Education</MenuItem>
            <MenuItem value="Business">Business</MenuItem>
            <MenuItem value="Lifestyle">Lifestyle</MenuItem>
            {/* 必要に応じてカテゴリーを追加 */}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Language</InputLabel>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value as string)}
            label="Language"
          >
            {availableLanguages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          component="label"
          fullWidth
          sx={{ mt: 3 }}
        >
          Select File
          <input
            type="file"
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </Button>
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {file.name}
          </Typography>
        )}
        <Button
          variant="contained"
          component="label"
          fullWidth
          sx={{ mt: 3 }}
        >
          Select Thumbnail
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setThumbnail(e.target.files[0]);
              }
            }}
          />
        </Button>
        {thumbnail && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {thumbnail.name}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Upload
        </Button>
      </Box>
      {message && (
        <Typography variant="body1" align="center" sx={{ mt: 3 }}>
          {message}
        </Typography>
      )}
    </Container>
  );
};

export default UploadProduct;
