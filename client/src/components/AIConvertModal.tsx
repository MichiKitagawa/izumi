// src/components/AIConvertModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../api';

interface AIConvertModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  onConversionComplete: (convertedResult: unknown) => void;
}

const availableMediaTypes = [
  { value: 'video', label: '動画' },
  { value: 'audio', label: '音声' },
  { value: 'text', label: 'テキスト' },
] as const;

type MediaType = typeof availableMediaTypes[number]['value'];

const availableLanguages = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: '英語' },
  { value: 'es', label: 'スペイン語' },
  { value: 'fr', label: 'フランス語' },
  { value: 'de', label: 'ドイツ語' },
  { value: 'it', label: 'イタリア語' },
  { value: 'zh', label: '中国語' },
] as const;

type LanguageCode = typeof availableLanguages[number]['value'];

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AIConvertModal: React.FC<AIConvertModalProps> = ({
  open,
  onClose,
  productId,
  onConversionComplete,
}) => {
  const [targetType, setTargetType] = useState<MediaType>('audio');
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('en');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setTargetType(event.target.value as MediaType);
  };

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    setTargetLanguage(event.target.value as LanguageCode);
  };

  const handleConversion = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post(
        `${API_BASE_URL}/ai/convert/${productId}`,
        { targetType, targetLanguage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      onConversionComplete(res.data.convertedVersion);
      onClose();
    } catch (error: unknown) {
      setErrorMsg('変換に失敗しました。');
      console.error('Conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          商材変換の条件を選択
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="media-type-label">変換タイプ</InputLabel>
          <Select
            labelId="media-type-label"
            value={targetType}
            label="変換タイプ"
            onChange={handleTypeChange}
          >
            {availableMediaTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="language-label">言語</InputLabel>
          <Select
            labelId="language-label"
            value={targetLanguage}
            label="言語"
            onChange={handleLanguageChange}
          >
            {availableLanguages.map((lang) => (
              <MenuItem key={lang.value} value={lang.value}>
                {lang.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {errorMsg && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {errorMsg}
          </Typography>
        )}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 2 }}>
            キャンセル
          </Button>
          <Button variant="contained" onClick={handleConversion} disabled={loading}>
            {loading ? '変換中...' : '変換開始'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AIConvertModal;
