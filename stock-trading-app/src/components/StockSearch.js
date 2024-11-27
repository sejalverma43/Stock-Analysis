// src/components/StockSearch.js

import React from 'react';
import { Box, TextField, Button, Card, CardContent } from '@mui/material';
import { cardStyle } from '../styles';

const StockSearch = ({ onSearch }) => {
  const [symbol, setSymbol] = React.useState('');

  const handleSearch = () => {
    if (symbol.trim() !== '') {
      onSearch(symbol.trim().toUpperCase());
      setSymbol('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card variant="outlined" sx={{ ...cardStyle, maxWidth: 500, mx: 'auto' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TextField
            label="Stock Symbol"
            variant="outlined"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mr: 2, width: '300px' }}
          />
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Search
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StockSearch;
