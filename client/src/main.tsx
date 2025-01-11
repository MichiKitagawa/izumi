import React from 'react';
import { createRoot } from 'react-dom/client'; // react-dom/client からインポート
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import UploadProduct from './pages/UploadProduct';
import Subscription from './pages/Subscription';
import AIProcessing from './pages/AIProcessing';
import RevenueReport from './pages/RevenueReport';
import ProductDetail from './pages/ProductDetail';
import './i18n';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

// ルート要素を取得
const container = document.getElementById('root');

// createRoot を使用してルートを作成
const root = createRoot(container!);

// アプリケーションをレンダリング
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/ai" element={<AIProcessing />} />
        <Route path="/revenue-report" element={<RevenueReport />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/upload" element={<UploadProduct />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
