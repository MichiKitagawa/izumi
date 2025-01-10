// src/pages/RevenueReport.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography } from '@mui/material';

const RevenueReport: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/api/analytics/revenue-report', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReport(res.data);
      } catch (error: any) {
        setMessage(error.response?.data?.message || 'Failed to fetch revenue report.');
      }
    };

    fetchReport();
  }, []);

  if (!report) {
    return (
      <Container>
        <Typography variant="h6">{message || 'Loading...'}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Revenue Report
      </Typography>
      <Typography variant="h6">Subscription Revenue: ¥{report.subscriptionRevenue}</Typography>
      <Typography variant="h6">Transaction Fees: ¥{report.transactionFees}</Typography>
      <Typography variant="h5" style={{ marginTop: '20px' }}>
        Total Revenue: ¥{report.totalRevenue}
      </Typography>
    </Container>
  );
};

export default RevenueReport;
