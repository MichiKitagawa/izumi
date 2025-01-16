// client/src/components/PublicRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { token } = useContext(AuthContext);

  // トークンの検証が完了するまで表示しない（仮に null が初期値なら不要）
  // ここでは簡単のためスキップ

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
