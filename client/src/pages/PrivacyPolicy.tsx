// src/pages/PrivacyPolicy.tsx
import React from 'react';
import { Container, Typography } from '@mui/material';

const PrivacyPolicy: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        プライバシーポリシー
      </Typography>
      <Typography variant="body1" paragraph>
        ここにプライバシーポリシーの内容を記載します。
      </Typography>
      {/* 追加のセクション */}
    </Container>
  );
};

export default PrivacyPolicy;
