// src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  Button,
  CssBaseline,
  AppBar,
  Toolbar,
  Grid,
  Alert,
} from '@mui/material';
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
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);

  const fetchStockData = async (symbol) => {
    const apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

    try {
      // Fetch stock data
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: apiKey,
        },
      });

      console.log('API Response:', response.data);

      const data = response.data['Global Quote'];

      if (data && data['01. symbol']) {
        setStock({
          symbol: data['01. symbol'],
          open: parseFloat(data['02. open']),
          high: parseFloat(data['03. high']),
          low: parseFloat(data['04. low']),
          price: parseFloat(data['05. price']),
          volume: parseInt(data['06. volume'], 10),
          latestTradingDay: data['07. latest trading day'],
          previousClose: parseFloat(data['08. previous close']),
          change: parseFloat(data['09. change']),
          changePercent: data['10. change percent'],
        });
        setError(null);

        // Fetch news articles using Finnhub API
        const fetchedArticles = await fetchNewsArticles(symbol);
        setArticles(fetchedArticles);

        if (fetchedArticles.length > 0) {
          // Concatenate headlines and summaries of the articles
          const newsContent = fetchedArticles
            .map((article) => `${article.headline}. ${article.summary}`)
            .join(' ');

          // Perform sentiment analysis on the news content
          const sentimentScore = await fetchSentiment(newsContent);
          setSentiment(sentimentScore);

          setSentimentHistory((prevHistory) => [
            ...prevHistory,
            { time: new Date().toISOString(), sentiment: sentimentScore },
          ]);

          generateTradingSignal(sentimentScore, {
            high: parseFloat(data['03. high']),
            low: parseFloat(data['04. low']),
          });
        } else {
          console.warn('No news articles found for', symbol);
          setSentiment(0); // Neutral sentiment if no news
        }

        await fetchPrediction(symbol);
      } else if (response.data.Note) {
        setError('API rate limit exceeded. Please wait and try again later.');
      } else {
        setError('Invalid stock symbol. Please check and try again.');
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError('Network error. Please try again.');
    }
  };

  const fetchNewsArticles = async (symbol) => {
    try {
      const response = await axios.get(`https://finnhub.io/api/v1/company-news`, {
        params: {
          symbol: symbol,
          from: getPastDate(7), // Fetch news from the past 7 days
          to: getCurrentDate(),
          token: process.env.REACT_APP_FINNHUB_API_KEY,
        },
      });

      // Limit to the latest 5 articles
      return response.data.slice(0, 5);
    } catch (error) {
      console.error('Error fetching news articles:', error);
      return [];
    }
  };

  // Helper functions to get dates in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getPastDate = (days) => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    return pastDate.toISOString().split('T')[0];
  };

  const fetchPrediction = async (symbol) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/predict?symbol=${symbol}&algorithm=${algorithm}`
      );
      setPrediction(parseFloat(response.data.prediction).toFixed(2));
      setError(null);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      if (error.response) {
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
          <Typography variant="h4">Stock Analysis Application</Typography>
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
          {stock && <NewsFeed stockSymbol={stock.symbol} articles={articles} />}
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
