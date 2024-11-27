// src/components/Portfolio.js

import React from 'react';
import { Card, CardContent, Typography, List, ListItem } from '@mui/material';

const Portfolio = ({ portfolio }) => {
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
        <Typography variant="h5" component="div">
          Portfolio
        </Typography>
        {Object.keys(portfolio).length > 0 ? (
          <List>
            {Object.entries(portfolio).map(([symbol, data]) => (
              <ListItem key={symbol}>
                {symbol}: {data.shares} shares at ${data.price.toFixed(2)} each
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1">No stocks bought yet.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default Portfolio;