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
import MyList from './pages/MyList';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import HeroSection from './components/HeroSection';
import ContentList from './components/ContentList';
import AdBanner from './components/AdBanner';
import './i18n';
import UserProducts from './pages/UserProducts';
import StripeProvider from './context/StripeProvider';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Subscribe from './pages/Subscribe';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <StripeProvider>
        <Router>
          <Routes>
            {/* 初回訪問時のトップページ */}
            <Route path="/welcome" element={<WelcomePage />} />

            {/* 認証が不要なルート */}
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

            {/* 認証が必要なルート */}
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

              {/* 商材詳細ページ (サブスク状態チェックは ProductDetail 内で実施) */}
              <Route
                path="product/:productId"
                element={
                  <ProtectedRoute>
                    <ProductDetail />
                  </ProtectedRoute>
                }
              />

              {/* サブスクリプション関連 */}
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />
            </Route>

            {/* 公開ルート */}
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* デフォルトルート */}
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
      </StripeProvider>
    </AuthProvider>
  </React.StrictMode>
);
