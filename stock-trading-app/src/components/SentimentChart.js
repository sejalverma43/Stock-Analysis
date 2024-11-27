// src/components/SentimentChart.js

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent } from '@mui/material';
import { cardStyle } from '../styles';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SentimentChart = ({ sentimentHistory }) => {
  // Prepare the data and options for the chart
  const data = {
    datasets: [
      {
        label: 'Sentiment Score',
        data: sentimentHistory.map((entry) => ({
          x: entry.time,
          y: entry.sentiment,
        })),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        tension: 0.4,
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
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        suggestedMin: -1,
        suggestedMax: 1,
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
    <Card variant="outlined" sx={cardStyle}>
      <CardContent>
        <Line data={data} options={options} />
      </CardContent>
    </Card>
  );
};

export default SentimentChart;
