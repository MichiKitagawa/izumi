// src/components/AdVideoSlot.tsx
import React from 'react';
import { Card, CardMedia, CardContent, Typography } from '@mui/material';

interface AdVideoSlotProps {
  ad: {
    id: string;
    adType: string;
    contentUrl: string;
    targetUrl: string;
  };
  onAdFinished: () => void;
}

const AdVideoSlot: React.FC<AdVideoSlotProps> = ({ ad, onAdFinished }) => {
  return (
    <Card style={{ margin: '20px 0' }} role="region" aria-label="Video Advertisement">
      <CardMedia
        component="video"
        src={ad.contentUrl}
        controls
        autoPlay
        onEnded={onAdFinished}
        style={{ width: '100%' }}
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="a" href={ad.targetUrl} target="_blank" rel="noopener noreferrer">
          広告の詳細はこちら
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AdVideoSlot;
