// src/components/SentimentChart.js

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SentimentChart = ({ sentimentHistory }) => {
  const data = {
    labels: sentimentHistory.map((entry) => entry.time),
    datasets: [
      {
        label: 'Sentiment Score',
        data: sentimentHistory.map((entry) => entry.sentiment),
        borderColor: 'rgba(255,99,132,1)',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Sentiment Over Time',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
        },
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Sentiment Score',
        },
        ticks: {
          stepSize: 1,
          callback: (value) => {
            if (value === -1) return 'Negative';
            if (value === 0) return 'Neutral';
            if (value === 1) return 'Positive';
            return value;
          },
        },
      },
    },
  };

  return (
    <Card
      variant="outlined"
      sx={{
        transition: '0.3s',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Line data={data} options={options} />
      </CardContent>
    </Card>
  );
};

export default SentimentChart;
