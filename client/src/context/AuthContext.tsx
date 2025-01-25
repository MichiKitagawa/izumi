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
  loading: boolean; // 追加
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  user: null,
  setUser: () => {},
  role: null,
  setRole: () => {},
  loading: true, // 初期値
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // 追加

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('role');
      console.log('Stored Token:', storedToken);
      console.log('Stored User:', storedUser);
      console.log('Stored Role:', storedRole);
      if (storedToken) {
        try {
          const res = await axios.get(`${API_BASE_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          console.log('Token Verification Response:', res.data);
          if (res.status === 200) {
            setToken(storedToken);
            console.log('Token set in context:', storedToken); // 追加
            if (storedUser) {
              setUser(JSON.parse(storedUser));
              console.log('User set in context:', JSON.parse(storedUser)); // 追加
            }
            if (storedRole) {
              setRole(storedRole);
              console.log('Role set in context:', storedRole); // 追加
            }
          }
        } catch (error: unknown) {
          console.error('Token verification failed:', error);
          setToken(null);
          setUser(null);
          setRole(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
        }
      }
      setLoading(false); // トークン検証完了
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
    <AuthContext.Provider value={{ token, setToken: updateToken, user, setUser: updateUser, role, setRole: updateRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
