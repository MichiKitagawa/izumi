// client/src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import WelcomePage from './pages/WelcomePage';
import MyList from './pages/MyList'; // 追加
import Settings from './pages/Settings'; // 追加
import { AuthProvider } from './context/AuthContext';
import HeroSection from './components/HeroSection';
import ContentList from './components/ContentList';
import AdBanner from './components/AdBanner';
import './i18n';
import UserProducts from './pages/UserProducts';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          {/* 初回訪問時のトップページ */}
          <Route path="/welcome" element={<WelcomePage />} />

          {/* 認証が不要なルートに PublicRoute を適用 */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* 認証が必要なルートに ProtectedRoute を適用 */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          >
            {/* ネストされた子ルート */}
            <Route
              index
              element={
                <>
                  <HeroSection />
                  <ContentList title="あなたにおすすめの商材" />
                  <ContentList title="最近見た商材" />
                  <ContentList title="人気の商材" />
                  <AdBanner />
                </>
              }
            />
            <Route path="/user-products" element={<UserProducts />} />
            <Route path="mylist" element={<MyList />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
            <Route path="upload" element={<UploadProduct />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="ai" element={<AIProcessing />} />
            <Route path="revenue-report" element={<RevenueReport />} />
            <Route path="product/:productId" element={<ProductDetail />} />
            {/* その他の認証が必要なルート */}
          </Route>

          {/* 公開ルート */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* デフォルトルートのリダイレクト設定 */}
          <Route
            path="*"
            element={
              localStorage.getItem('token') ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/welcome" replace />
              )
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
