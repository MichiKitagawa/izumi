// client/src/pages/Downloads.tsx
import React, { useEffect, useState } from 'react';
import { Typography, List, ListItem, ListItemText } from '@mui/material';

interface DownloadedFile {
  id: number;
  title: string;
  fileType: string;
  data: string; // Data URL
}

const Downloads: React.FC = () => {
  const [downloadedFiles, setDownloadedFiles] = useState<DownloadedFile[]>([]);

  useEffect(() => {
    const files = JSON.parse(localStorage.getItem('downloadedFiles') || '[]');
    setDownloadedFiles(files);
  }, []);

  const renderFile = (file: DownloadedFile) => {
    switch (file.fileType.toLowerCase()) {
      case 'pdf':
        return <embed src={file.data} type="application/pdf" width="100%" height="600px" />;
      case 'mp4':
        return <video controls width="100%"><source src={file.data} type="video/mp4" />Your browser does not support the video tag.</video>;
      case 'mp3':
        return <audio controls><source src={file.data} type="audio/mpeg" />Your browser does not support the audio element.</audio>;
      default:
        return <Typography>プレビューがサポートされていません。</Typography>;
    }
  };

  return (
    <div>
      <Typography variant="h6">ダウンロードした作品</Typography>
      <List>
        {downloadedFiles.map(file => (
          <ListItem key={file.id}>
            <ListItemText
              primary={file.title}
              secondary={renderFile(file)}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Downloads;
