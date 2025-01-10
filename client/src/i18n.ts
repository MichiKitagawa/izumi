// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationJP from './locales/jp/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  jp: {
    translation: translationJP,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'jp', // 初期言語
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
