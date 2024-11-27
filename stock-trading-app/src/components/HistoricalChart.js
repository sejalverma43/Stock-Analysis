import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Card, CardContent, Typography, Divider, CircularProgress } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
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
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HistoricalChart = ({ stockSymbol }) => {
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!stockSymbol) {
        setError('No stock symbol provided.');
        return;
      }

      try {
        setLoading(true);
        const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
        const response = await axios.get(`https://www.alphavantage.co/query`, {
          params: {
            function: 'TIME_SERIES_INTRADAY',
            symbol: stockSymbol,
            interval: '5min',
            apikey: API_KEY,
          },
        });

        const timeSeries = response.data['Time Series (5min)'];
        if (!timeSeries || Object.keys(timeSeries).length === 0) {
          setChartData(null);
          if (response.data.Note) {
            setError('API rate limit exceeded. Please wait and try again later.');
          } else if (response.data['Error Message']) {
            setError('Invalid stock symbol. Please try again.');
          } else {
            setError('Failed to fetch historical data.');
          }
          return;
        }

        const dates = Object.keys(timeSeries).reverse();
        const prices = dates.map((date) => parseFloat(timeSeries[date]['4. close']));

        setChartData({
          labels: dates,
          datasets: [
            {
              label: `${stockSymbol} Closing Prices`,
              data: prices,
              borderColor: 'rgba(75,192,192,1)',
              backgroundColor: 'rgba(75,192,192,0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        });

        setError(null);
      } catch (error) {
        setError('Failed to fetch historical data.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [stockSymbol]);

  return (
    <Card
      variant="outlined"
      sx={{
        mt: 2,
        p: 2,
        border: '2px solid black',
        borderRadius: 2,
        maxWidth: 800,
        mx: 'auto',
        transition: '0.3s',
        '&:hover': {
          boxShadow: 8,
        },
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            mb: 2,
            color: 'primary.main',
          }}
        >
          Historical Stock Chart
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <CircularProgress
            sx={{
              display: 'block',
              mx: 'auto',
              my: 4,
            }}
          />
        ) : error ? (
          <Typography variant="body1" color="error" sx={{ textAlign: 'center' }}>
            {error}
          </Typography>
        ) : chartData ? (
          <Line
            data={chartData}
            options={{
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
                  text: `Historical Closing Prices for ${stockSymbol}`,
                  font: {
                    size: 18,
                  },
                },
              },
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: 'day',
                  },
                  title: {
                    display: true,
                    text: 'Date',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Price ($)',
                  },
                },
              },
            }}
          />
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            No historical data available.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalChart;
