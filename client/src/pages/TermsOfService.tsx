// src/pages/TermsOfService.tsx
import React from 'react';
import { Container, Typography } from '@mui/material';

const TermsOfService: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        利用規約
      </Typography>
      <Typography variant="body1" paragraph>
        ここに利用規約の内容を記載します。
      </Typography>
      {/* 追加のセクション */}
    </Container>
  );
};

export default TermsOfService;
