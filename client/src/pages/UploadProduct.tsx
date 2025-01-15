// src/pages/UploadProduct.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { API_BASE_URL } from '../api';

const UploadProduct: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null); // サムネイル用
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }
    if (!thumbnail) { // サムネイルのチェック
      setMessage('Please select a thumbnail image.');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('file', file);
    formData.append('thumbnail', thumbnail); // サムネイルを追加

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
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Upload Product
      </Typography>
      <form onSubmit={handleUpload}>
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
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value as string)} required>
            <MenuItem value="Education">Education</MenuItem>
            <MenuItem value="Business">Business</MenuItem>
            <MenuItem value="Lifestyle">Lifestyle</MenuItem>
            {/* 必要に応じてカテゴリーを追加 */}
          </Select>
        </FormControl>
        {/* メインファイル選択 */}
        <Button variant="contained" component="label" fullWidth style={{ marginTop: '20px' }}>
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
        {file && <Typography variant="body1" style={{ marginTop: '10px' }}>{file.name}</Typography>}
        {/* サムネイル選択を追加 */}
        <Button variant="contained" component="label" fullWidth style={{ marginTop: '20px' }}>
          Select Thumbnail
          <input
            type="file"
            accept="image/*" // 画像のみ選択可能にする
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setThumbnail(e.target.files[0]);
              }
            }}
          />
        </Button>
        {thumbnail && <Typography variant="body1" style={{ marginTop: '10px' }}>{thumbnail.name}</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
          Upload
        </Button>
      </form>
      {message && <Typography variant="body1">{message}</Typography>}
    </Container>
  );
};

export default UploadProduct;
