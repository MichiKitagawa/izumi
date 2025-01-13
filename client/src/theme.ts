// src/theme.ts
import { createTheme } from '@mui/material/styles';

// テーマのカスタマイズ
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // ブランドカラーに合わせて変更
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    // フォントやサイズのカスタマイズ
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    // 他のバリアントも必要に応じてカスタマイズ
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

export default theme;
