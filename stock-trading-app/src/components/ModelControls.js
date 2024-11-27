// src/components/ModelControls.js

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Divider,
} from '@mui/material';
import { cardStyle } from '../styles';

const ModelControls = ({ algorithm, setAlgorithm }) => {
  return (
    <Card variant="outlined" sx={{ ...cardStyle, maxWidth: 500, mx: 'auto' }}>
      <CardContent>
        <Typography
          variant="h5"
          sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}
        >
          Machine Learning Model Selector
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <FormControl fullWidth variant="outlined">
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
