// src/components/StockSearch.js

import React from 'react';
import { Box, TextField, Button } from '@mui/material';

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
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
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
  );
};

export default StockSearch;
