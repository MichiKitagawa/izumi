// client/src/context/AuthContext.tsx
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

interface User {
  name: string;
  profileImage: string;
  // 他のユーザー情報も必要に応じて追加
}

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  user: null,
  setUser: () => {},
  role: null,
  setRole: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('role');
      if (storedToken) {
        try {
          // トークンの検証APIエンドポイントを呼び出す
          const res = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (res.status === 200) {
            setToken(storedToken);
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
            if (storedRole) {
              setRole(storedRole);
            }
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          setToken(null);
          setUser(null);
          setRole(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
        }
      }
    };

    verifyToken();
  }, []);

  const updateToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setToken(newToken);
  };

  const updateUser = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
    setUser(newUser);
  };

  const updateRole = (newRole: string | null) => {
    if (newRole) {
      localStorage.setItem('role', newRole);
    } else {
      localStorage.removeItem('role');
    }
    setRole(newRole);
  };

  return (
    <AuthContext.Provider value={{ token, setToken: updateToken, user, setUser: updateUser, role, setRole: updateRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
