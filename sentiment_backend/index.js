// server.js
const express = require('express');
const Sentiment = require('sentiment');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/sentiment', (req, res) => {
  const { text } = req.body;
  console.log('Received text for sentiment analysis:', text);

  const sentimentAnalyzer = new Sentiment();

  // Split the text into sentences to handle longer texts
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

  let totalScore = 0;
  sentences.forEach((sentence) => {
    const result = sentimentAnalyzer.analyze(sentence);
    totalScore += result.score;
  });

  // Normalize the score
  const sentimentScore = totalScore > 0 ? 1 : totalScore < 0 ? -1 : 0;
  console.log('Total Sentiment Score:', totalScore, 'Normalized Score:', sentimentScore);

  res.send({ sentiment: sentimentScore });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
