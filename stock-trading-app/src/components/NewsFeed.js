// src/components/NewsFeed.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, List, ListItem, Link } from '@mui/material';

const NewsFeed = ({ stockSymbol }) => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!stockSymbol) return;

      try {
        const response = await axios.get(
          `https://finnhub.io/api/v1/company-news`,
          {
            params: {
              symbol: stockSymbol,
              from: '2023-01-01',
              to: '2024-12-31',
              token: process.env.REACT_APP_FINNHUB_API_KEY,
            },
          }
        );
        setArticles(response.data.slice(0, 5)); // Get latest 5 articles
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
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
        <Typography variant="h6">Latest News for {stockSymbol}</Typography>
        {articles.length > 0 ? (
          <List>
            {articles.map((article, index) => (
              <ListItem key={index} alignItems="flex-start">
                <Link href={article.url} target="_blank" rel="noopener">
                  <Typography variant="subtitle1" color="primary">
                    {article.headline}
                  </Typography>
                </Link>
                <Typography variant="body2">{article.summary}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(article.datetime * 1000).toLocaleString()}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1">No recent news available.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsFeed;
