# Shopping Agent AI

This Python module provides an AI agent for product detection and shopping recommendations. It can detect products in images, search for products across multiple shopping platforms, track prices, find similar products, and recommend the best deals.

## Features

- **Product Detection**: Detect products in images using Google Cloud Vision API and OpenAI
- **Product Search**: Search for products across multiple shopping platforms
- **Price Tracking**: Track product prices and set up price alerts
- **Price History**: View price history for products
- **Similar Products**: Find similar products to a given product
- **Best Deals**: Find the best deals for a product across multiple platforms
- **Buying Options**: Get buying options for a product (new, used, refurbished)

## Installation

1. Clone the repository
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Set up your API keys in `config.json`

## Usage

### Command Line

```bash
# Detect products in an image
python product_detection.py --image path/to/image.jpg

# Search for products
python product_detection.py --search "iPhone 13"

# Track price for a product
python product_detection.py --track "B08L5TNJHG" --platform "Amazon"

# Get price history for a product
python product_detection.py --history "B08L5TNJHG" --platform "Amazon"

# Find similar products
python product_detection.py --similar "B08L5TNJHG" --platform "Amazon"

# Find the best deal for a product
python product_detection.py --best-deal "iPhone 13"

# Get buying options for a product
python product_detection.py --buying-options "iPhone 13"

# Save output to a file
python product_detection.py --search "iPhone 13" --output results.json
```

### Python API

```python
from product_detection import ProductDetectionAgent, load_config

# Load configuration
config = load_config("config.json")

# Initialize agent
agent = ProductDetectionAgent(config)

# Detect products in an image
products = agent.detect_products("path/to/image.jpg")

# Search for products
results = agent.search_products("iPhone 13")

# Find the best deal
best_deal = agent.find_best_deal("iPhone 13")

# Get buying options
options = agent.get_buying_options("iPhone 13")
```

## Configuration

Create a `config.json` file with your API keys and settings:

```json
{
  "api_keys": {
    "openai": "YOUR_OPENAI_API_KEY",
    "google_cloud_vision": "path/to/google-cloud-credentials.json",
    "amazon_product_api": {
      "access_key": "YOUR_AMAZON_ACCESS_KEY",
      "secret_key": "YOUR_AMAZON_SECRET_KEY",
      "partner_tag": "YOUR_AMAZON_PARTNER_TAG"
    }
  },
  "settings": {
    "confidence_threshold": 0.7,
    "max_results": 5
  }
}
```

## Integration with ViroReact

This Python agent can be integrated with ViroReact to provide product detection and shopping recommendations in AR applications. The ViroReact components can call this agent via a REST API or directly through React Native's native modules.

## License

MIT