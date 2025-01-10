// src/components/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonGroup, Button } from '@mui/material';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <ButtonGroup variant="text" color="inherit">
      <Button onClick={() => changeLanguage('jp')}>JP</Button>
      <Button onClick={() => changeLanguage('en')}>EN</Button>
    </ButtonGroup>
  );
};

export default LanguageSwitcher;
