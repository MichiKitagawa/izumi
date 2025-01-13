// client/src/index.tsx
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
import { AuthProvider } from './context/AuthContext';
import './i18n';

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
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AIProcessing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revenue-report"
            element={
              <ProtectedRoute>
                <RevenueReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:productId"
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            }
          />
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
