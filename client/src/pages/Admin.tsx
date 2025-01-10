// src/pages/Admin.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Admin: React.FC = () => {
  interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    banned: boolean;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get<User[]>('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data?.message || 'Failed to fetch users.');
        } else {
          setMessage('Failed to fetch users.');
        }
      }
    };

    fetchUsers();
  }, []);

  const handleBan = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post<{ message: string }>(`/api/admin/ban/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(res.data.message);
      const updatedUsers = users.map((user) =>
        user.id === id ? { ...user, banned: true } : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || 'Failed to ban user.');
      } else {
        setMessage('Failed to ban user.');
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      <Button component={Link} to="/revenue-report" variant="contained" color="primary" style={{ marginBottom: '20px' }}>
        View Revenue Report
      </Button>
      {message && <Typography variant="body1">{message}</Typography>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button variant="contained" color="secondary" onClick={() => handleBan(user.id)}>
                  BAN
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};
export default Admin;
