from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.ensemble import RandomForestRegressor
import requests
import os
from dotenv import load_dotenv
import logging
import json

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

# Initialize Flask-Limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["500 per day", "5 per minute"]
)
limiter.init_app(app)

# Initialize Flask-Caching
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/predict', methods=['GET'])
@limiter.limit("5 per minute")  # Specific rate limit for this endpoint
def predict():
    symbol = request.args.get('symbol')
    algorithm = request.args.get('algorithm', 'linear_regression')

    logging.debug(f"Received request: symbol={symbol}, algorithm={algorithm}")

    if not symbol:
        logging.error("Symbol parameter is required.")
        return jsonify({'error': 'Symbol parameter is required.'}), 400

    # Check if data is cached
    cache_key = f"{symbol}_data"
    cached_data = cache.get(cache_key)
    if cached_data:
        logging.debug("Using cached data.")
        data = cached_data
    else:
        # Fetch historical data
        api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        if not api_key:
            logging.error("ALPHA_VANTAGE_API_KEY not set.")
            return jsonify({'error': 'ALPHA_VANTAGE_API_KEY not set.'}), 500

        # Using free endpoint (TIME_SERIES_INTRADAY)
        url = f'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=5min&apikey={api_key}'
        logging.debug("Fetching historical data from Alpha Vantage.")
        r = requests.get(url)
        data = r.json()

        if 'Information' in data and 'premium' in data['Information'].lower():
            logging.error("Premium endpoint accessed with free API key.")
            return jsonify({'error': 'This endpoint requires a premium subscription. Please upgrade or use a free endpoint.'}), 403

        if 'Time Series (5min)' not in data:
            logging.error(f"Failed to fetch data from Alpha Vantage. Response: {json.dumps(data)}")
            return jsonify({'error': 'Failed to fetch data from Alpha Vantage.'}), 400

        # Cache the data for 10 minutes
        cache.set(cache_key, data, timeout=600)  # 600 seconds = 10 minutes

    df = pd.DataFrame.from_dict(data['Time Series (5min)'], orient='index').astype(float)
    df = df.sort_index()

    # Prepare data for model
    df['Date'] = pd.to_datetime(df.index)
    df['Date_ordinal'] = df['Date'].map(pd.Timestamp.toordinal)

    X = df[['Date_ordinal']]
    y = df['4. close']

    # Select model based on algorithm
    if algorithm == 'linear_regression':
        model = LinearRegression()
    elif algorithm == 'svm':
        model = SVR()
    elif algorithm == 'random_forest':
        model = RandomForestRegressor()
    else:
        logging.error("Invalid algorithm selected.")
        return jsonify({'error': 'Invalid algorithm selected.'}), 400

    try:
        model.fit(X, y)
        logging.debug("Model training successful.")
    except Exception as e:
        logging.error(f"Model training failed: {str(e)}")
        return jsonify({'error': f'Model training failed: {str(e)}'}), 500

    # Predict future price
    from datetime import datetime, timedelta
    tomorrow_date = datetime.now() + timedelta(days=1)
    future_date = pd.Timestamp(tomorrow_date).toordinal()

    try:
        prediction = model.predict([[future_date]])
        logging.debug("Prediction successful.")
    except Exception as e:
        logging.error(f"Prediction failed: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

    return jsonify({'prediction': prediction[0]})


if __name__ == '__main__':
    app.run(debug=True)