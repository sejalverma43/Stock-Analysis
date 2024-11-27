// src/components/NewsFeed.js

import React from 'react';
import { Card, CardContent, Typography, List, ListItem, Link, Divider } from '@mui/material';

const NewsFeed = ({ stockSymbol, articles }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        mt: 2,
        p: 2,
        border: '2px solid black',
        borderRadius: 2,
        transition: '0.3s',
        maxWidth: 800,
        mx: 'auto',
        '&:hover': {
          boxShadow: 8,
        },
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontWeight: 'bold',
          }}
        >
          Latest News for {stockSymbol}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {articles && articles.length > 0 ? (
          <List>
            {articles.map((article, index) => (
              <ListItem
                key={index}
                alignItems="flex-start"
                sx={{
                  display: 'block',
                  mb: 2,
                }}
              >
                <Link
                  href={article.url}
                  target="_blank"
                  rel="noopener"
                  sx={{
                    textDecoration: 'none',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    sx={{ fontWeight: 'bold' }}
                  >
                    {article.headline}
                  </Typography>
                </Link>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    mb: 1,
                    color: 'text.secondary',
                  }}
                >
                  {article.summary}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'text.disabled',
                  }}
                >
                  {new Date(article.datetime * 1000).toLocaleString()}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
            No recent news available.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsFeed;
