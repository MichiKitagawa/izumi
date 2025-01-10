// src/pages/AIProcessing.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography } from '@mui/material';

const AIProcessing: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateText = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/ai/generate-text', { prompt }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setResponse(res.data.response);
    } catch (err: unknown) {
      console.error(err);
      setError('AI processing failed.');
    } finally {
      setLoading(false);
    }
  };
  const handleSpeechToText = async (audio: File) => {
    setLoading(true);
    setError('');
    setResponse('');

    const formData = new FormData();
    formData.append('audio', audio);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/ai/speech-to-text', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(res.data.transcription);
    } catch (err: unknown) {
      console.error(err);
      setError('Transcription failed.');
    } finally {
      setLoading(false);
    }
  };
  const handleTextToSpeech = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/ai/text-to-speech', { text: response }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      const audioURL = window.URL.createObjectURL(new Blob([res.data]));
      const audio = new Audio(audioURL);
      audio.play();
    } catch (err: unknown) {
      console.error(err);
      setError('Synthesis failed.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        AI Processing
      </Typography>
      
      {/* Generate Text */}
      <TextField
        label="Enter your prompt"
        variant="outlined"
        fullWidth
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        required
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerateText}
        fullWidth
        style={{ marginTop: '10px' }}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Generate Text'}
      </Button>

      {/* Speech to Text */}
      <input
        accept="audio/*"
        style={{ display: 'none' }}
        id="contained-button-file"
        type="file"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSpeechToText(e.target.files[0]);
          }
        }}
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" component="span" color="secondary" fullWidth style={{ marginTop: '10px' }}>
          Upload Audio for Transcription
        </Button>
      </label>

      {/* Text to Speech */}
      {response && (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleTextToSpeech}
          fullWidth
          style={{ marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Synthesizing...' : 'Convert Text to Speech'}
        </Button>
      )}

      {/* Display Response or Error */}
      {response && (
        <Typography variant="body1" style={{ marginTop: '20px' }}>
          <strong>Response:</strong> {response}
        </Typography>
      )}
      {error && (
        <Typography variant="body2" color="error" style={{ marginTop: '10px' }}>
          {error}
        </Typography>
      )}
    </Container>
  );
};

export default AIProcessing;
