//src/components/RevenueChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { RevenueData } from '../pages/RevenueReport';

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => item.amount),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  return <Bar data={chartData} />;
};

export default RevenueChart;
