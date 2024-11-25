// src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import { Container, Box, Typography, Button, CssBaseline, AppBar, Toolbar, Grid, Alert } from '@mui/material';
import theme from './theme';
import StockSearch from './components/StockSearch';
import StockInfo from './components/StockInfo';
import Portfolio from './components/Portfolio';
import NewsFeed from './components/NewsFeed';
import HistoricalChart from './components/HistoricalChart';
import SentimentChart from './components/SentimentChart';
import ModelControls from './components/ModelControls';
import { fetchSentiment } from './utils/sentimentAnalysis';

const App = () => {
  const [stock, setStock] = useState(null);
  const [portfolio, setPortfolio] = useState({});
  const [sentiment, setSentiment] = useState(0);
  const [signal, setSignal] = useState('HOLD');
  const [sentimentHistory, setSentimentHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [algorithm, setAlgorithm] = useState('linear_regression');
  const [error, setError] = useState(null); // New state for error messages

  const fetchStockData = async (symbol) => {
    const apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

    const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data['Global Quote'];

      if (data && data['01. symbol']) {
        const stockData = {
          symbol: data['01. symbol'],
          price: parseFloat(data['05. price']),
          high: parseFloat(data['03. high']),
          low: parseFloat(data['04. low']),
        };
        setStock(stockData);
        setError(null); // Clear previous errors

        const sentimentScore = await fetchSentiment(
          `Latest news and updates about ${symbol}`
        );
        setSentiment(sentimentScore);

        // Update sentiment history
        setSentimentHistory((prevHistory) => [
          ...prevHistory,
          { time: new Date().toLocaleString(), sentiment: sentimentScore },
        ]);

        generateTradingSignal(sentimentScore, stockData);

        // Fetch prediction
        await fetchPrediction(symbol);
      } else {
        setStock(null);
        setError('Stock data not found. Please check the symbol.');
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setStock(null);
      setError('Failed to fetch stock data. Please try again.');
    }
  };

  const fetchPrediction = async (symbol) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/predict?symbol=${symbol}&algorithm=${algorithm}`
      );
      setPrediction(parseFloat(response.data.prediction).toFixed(2));
      setError(null); // Clear previous errors
    } catch (error) {
      console.error('Error fetching prediction:', error);
      if (error.response) {
        // Backend returned an error response
        setError(error.response.data.error || 'Error fetching prediction.');
      } else {
        setError('Error connecting to prediction service.');
      }
    }
  };

  const generateTradingSignal = (sentiment, stock) => {
    if (!stock) return;

    const priceChange = ((stock.high - stock.low) / stock.low) * 100;

    let generatedSignal = 'HOLD';
    if (sentiment > 0 && priceChange > 2) {
      generatedSignal = 'BUY';
    } else if (sentiment < 0 && priceChange < -2) {
      generatedSignal = 'SELL';
    }

    setSignal(generatedSignal);
  };

  const buyStock = () => {
    if (stock) {
      setPortfolio((prevPortfolio) => ({
        ...prevPortfolio,
        [stock.symbol]: {
          shares: (prevPortfolio[stock.symbol]?.shares || 0) + 1,
          price: stock.price,
        },
      }));
    }
  };

  const sellStock = () => {
    if (stock && portfolio[stock.symbol]) {
      setPortfolio((prevPortfolio) => {
        const updatedPortfolio = { ...prevPortfolio };
        if (updatedPortfolio[stock.symbol].shares > 1) {
          updatedPortfolio[stock.symbol].shares -= 1;
        } else {
          delete updatedPortfolio[stock.symbol];
        }
        return updatedPortfolio;
      });
    }
  };

  useEffect(() => {
    if (stock) {
      fetchPrediction(stock.symbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4">Stock Analysis</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <StockSearch onSearch={fetchStockData} />
          <ModelControls algorithm={algorithm} setAlgorithm={setAlgorithm} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <StockInfo
                stock={stock}
                sentiment={sentiment}
                signal={signal}
                prediction={prediction}
              />
              {stock && (
                <Box sx={{ mt: 2 }}>
                  <SentimentChart sentimentHistory={sentimentHistory} />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {stock && <HistoricalChart stockSymbol={stock.symbol} />}
            </Grid>
          </Grid>
          {stock && <NewsFeed stockSymbol={stock.symbol} />}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={buyStock}
              disabled={!stock}
              sx={{
                mx: 1,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              Buy
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={sellStock}
              disabled={!stock}
              sx={{
                mx: 1,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              Sell
            </Button>
          </Box>
          <Portfolio portfolio={portfolio} />
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
