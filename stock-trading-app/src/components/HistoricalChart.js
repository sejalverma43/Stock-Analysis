import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Card, CardContent, Typography } from '@mui/material';
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

  useEffect(() => {
    const fetchHistoricalData = async () => {
        if (!stockSymbol) {
          setError('No stock symbol provided.');
          return;
        }
      
        try {
          console.log('Fetching data for stock symbol:', stockSymbol);
      
          const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
          const response = await axios.get(
            `https://www.alphavantage.co/query`,
            {
              params: {
                function: 'TIME_SERIES_INTRADAY',
                symbol: stockSymbol,
                interval: '5min', // Required for intraday data
                apikey: API_KEY,
              },
            }
          );
      
          console.log('Alpha Vantage API response:', response.data);
      
          const timeSeries = response.data['Time Series (5min)'];
      
          if (!timeSeries || Object.keys(timeSeries).length === 0) {
            setChartData(null);
            if (response.data.Note) {
              console.error('API Rate Limit Exceeded:', response.data.Note);
              setError('API rate limit exceeded. Please wait and try again later.');
            } else if (response.data.Information) {
              console.error('Premium Endpoint Accessed:', response.data.Information);
              setError(
                'This endpoint requires a premium subscription. Please upgrade or use a free endpoint.'
              );
            } else if (response.data['Error Message']) {
              console.error('Invalid Stock Symbol:', response.data['Error Message']);
              setError('Invalid stock symbol. Please try again.');
            } else {
              console.error('Empty or invalid API response:', response);
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
                fill: false,
              },
            ],
          });
      
          setError(null); // Clear any previous errors
        } catch (error) {
          console.error('Error fetching historical data:', error.response || error);
          setChartData(null);
          setError('Failed to fetch historical data.');
        }
      };
      

    fetchHistoricalData();
  }, [stockSymbol]);

  return (
    <Card
      variant="outlined"
      sx={{
        mt: 2,
        transition: '0.3s',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        {error && (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        )}
        {chartData ? (
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
                  display: true,
                  title: {
                    display: true,
                    text: 'Date',
                  },
                },
                y: {
                  display: true,
                  title: {
                    display: true,
                    text: 'Price ($)',
                  },
                },
              },
            }}
          />
        ) : (
          !error && (
            <Typography variant="body1">Loading historical chart...</Typography>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalChart;
