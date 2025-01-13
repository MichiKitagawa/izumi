// src/pages/RevenueReport.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography } from '@mui/material';

const RevenueReport: React.FC = () => {
  interface ReportData {
    subscriptionRevenue: number;
    transactionFees: number;
    totalRevenue: number;
  }

  const [report, setReport] = useState<ReportData | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get<ReportData>('/api/analytics/revenue-report', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReport(res.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data?.message || 'Failed to fetch revenue report.');
        } else {
          setMessage('An unexpected error occurred.');
        }
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
