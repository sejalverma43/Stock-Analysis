import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StockInfo = ({ stock, sentiment, signal, prediction }) => {
  const [realTimePrice, setRealTimePrice] = useState(stock?.price || null);

  useEffect(() => {
    if (stock) {
      const socket = new WebSocket(
        'wss://ws.finnhub.io?token=' + process.env.REACT_APP_FINNHUB_API_KEY
      );

      const subscribeMessage = JSON.stringify({
        type: 'subscribe',
        symbol: stock.symbol,
      });

      socket.addEventListener('open', () => {
        console.log('WebSocket connection opened.');
        socket.send(subscribeMessage); // Send subscribe message after connection opens
      });

      socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'trade') {
          setRealTimePrice(data.data[0].p);
        }
      });

      socket.addEventListener('close', () => {
        console.log('WebSocket connection closed.');
      });

      socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
      });

      return () => {
        // Clean up WebSocket connection
        if (socket.readyState === WebSocket.OPEN) {
          const unsubscribeMessage = JSON.stringify({
            type: 'unsubscribe',
            symbol: stock.symbol,
          });
          socket.send(unsubscribeMessage);
        }
        socket.close();
      };
    }
  }, [stock]);

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
        {stock ? (
          <>
            <Typography variant="h5" component="div">
              {stock.symbol}
            </Typography>
            <Typography variant="body1">
              Real-Time Price: ${realTimePrice !== null ? realTimePrice.toFixed(2) : 'Loading...'}
            </Typography>
            <Typography variant="body1">Price: ${stock.price.toFixed(2)}</Typography>
            <Typography variant="body1">High: ${stock.high.toFixed(2)}</Typography>
            <Typography variant="body1">Low: ${stock.low.toFixed(2)}</Typography>
            {prediction && (
              <Typography variant="body1">
                Predicted Price for Tomorrow: ${prediction}
              </Typography>
            )}
            <Typography variant="body1">
              Sentiment:{' '}
              {sentiment === 1
                ? 'Positive'
                : sentiment === -1
                ? 'Negative'
                : 'Neutral'}
            </Typography>
            <Typography variant="body1">
              Trading Signal:{' '}
              <strong>
                {signal}{' '}
                {signal === 'BUY' && <TrendingUp color="success" />}
                {signal === 'SELL' && <TrendingDown color="error" />}
              </strong>
            </Typography>
          </>
        ) : (
          <Typography variant="body1">No stock selected.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StockInfo;
