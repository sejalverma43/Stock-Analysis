import axios from 'axios';

export const fetchSentiment = async (text) => {
  try {
    console.log('Sending text to backend for sentiment analysis:', text);
    const response = await axios.post('http://localhost:5000/api/sentiment', { text });
    console.log('Response from sentiment analysis:', response.data);
    return response.data.sentiment;
  } catch (error) {
    console.error('Error fetching sentiment analysis:', error.response?.data || error);
    return 0; // Default to neutral sentiment
  }
};
