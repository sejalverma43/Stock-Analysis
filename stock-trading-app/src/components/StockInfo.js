import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";

const StockInfo = ({ stock, sentiment, signal, prediction }) => {
  const [latestPrice, setLatestPrice] = useState(null);

  useEffect(() => {
    let intervalId;

    const fetchLatestPrice = async () => {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${process.env.REACT_APP_FINNHUB_API_KEY}`
        );
        const data = await response.json();
        if (data && data.c) {
          setLatestPrice(data.c);
        } else {
          console.error("Invalid data:", data);
        }
      } catch (error) {
        console.error("Error fetching latest price:", error);
      }
    };

    if (stock) {
      fetchLatestPrice();

      // Update the price every minute (adjust as needed)
      intervalId = setInterval(fetchLatestPrice, 60000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [stock]);

  return (
    <Card
      variant="outlined"
      sx={{
        mt: 2,
        p: 2,
        border: '2px solid black',
        borderRadius: 2,
        transition: "0.3s",
        "&:hover": {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        {stock ? (
          <>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {stock.symbol}
            </Typography>
            <Typography variant="body1">
              <strong>Latest Price:</strong> $
              {latestPrice !== null ? latestPrice.toFixed(2) : "Loading..."}
            </Typography>
            <Typography variant="body1">
              <strong>Price:</strong> ${stock.price.toFixed(2)}
            </Typography>
            <Typography variant="body1">
              <strong>High:</strong> ${stock.high.toFixed(2)}
            </Typography>
            <Typography variant="body1">
              <strong>Low:</strong> ${stock.low.toFixed(2)}
            </Typography>
            {prediction && (
              <Typography variant="body1">
                <strong>Predicted Price for Tomorrow:</strong> ${prediction}
              </Typography>
            )}
            <Typography variant="body1">
              <strong>Sentiment:</strong>{" "}
              {sentiment === 1
                ? "Positive"
                : sentiment === -1
                ? "Negative"
                : "Neutral"}
            </Typography>
            <Typography variant="body1">
              <strong>Trading Signal:</strong>{" "}
              {signal}{" "}
              {signal === "BUY" && <TrendingUp color="success" />}
              {signal === "SELL" && <TrendingDown color="error" />}
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
