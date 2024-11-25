import axios from 'axios';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchSentiment = async (text) => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  if (!apiKey) {
    console.error('API Key is missing. Please set REACT_APP_OPENAI_API_KEY in your .env file.');
    return 0; // Default to neutral sentiment
  }

  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const data = {
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a financial sentiment analysis assistant.',
      },
      {
        role: 'user',
        content: `Analyze the sentiment of this text: "${text}" and provide a sentiment score (positive, negative, or neutral).`,
      },
    ],
  };

  try {
    console.log('Sending request to OpenAI API with endpoint:', endpoint);

    const response = await axios.post(endpoint, data, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('OpenAI API response:', response.data);

    const sentimentResponse = response.data.choices[0].message.content.trim().toLowerCase();
    if (sentimentResponse.includes('positive')) return 1; // Positive sentiment
    if (sentimentResponse.includes('negative')) return -1; // Negative sentiment
    return 0; // Neutral sentiment
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Retrying in 1 second...');
      await delay(1000); // Wait for 1 second before retrying
      return fetchSentiment(text); // Retry the request
    }
    console.error('Error fetching sentiment analysis:', error.response?.data || error);
    return 0; // Default to neutral sentiment
  }
};
