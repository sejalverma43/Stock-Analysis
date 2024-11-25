// src/components/ModelControls.js

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Card, CardContent, Typography } from '@mui/material';

const ModelControls = ({ algorithm, setAlgorithm }) => {
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
        <Typography variant="h6">Machine Learning Model</Typography>
        <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
          <InputLabel>Algorithm</InputLabel>
          <Select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            label="Algorithm"
          >
            <MenuItem value="linear_regression">Linear Regression</MenuItem>
            <MenuItem value="svm">Support Vector Machine</MenuItem>
            <MenuItem value="random_forest">Random Forest</MenuItem>
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );
};

export default ModelControls;
