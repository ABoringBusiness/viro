# ViroShoppingAR

The ViroShoppingAR component integrates a Python AI agent with ViroReact to enable product detection and shopping recommendations in AR. It allows users to see product information, prices, and shopping options for products detected in the camera view.

## Features

- **Product Detection**: Detect products in the camera view using AI
- **Shopping Information**: Display prices, ratings, and availability for detected products
- **Price Tracking**: Track prices and set up price alerts
- **Price History**: View price history for products
- **Similar Products**: Find similar products to detected products
- **Best Deals**: Find the best deals across multiple shopping platforms
- **Buying Options**: Compare new, used, and refurbished options

## Usage

```jsx
import { 
  ViroARScene, 
  ViroARSceneNavigator, 
  ViroShoppingAR 
} from '@reactvision/react-viro';

// Inside your AR scene component
<ViroShoppingAR
  apiConfig={{
    apiKey: "your-api-key",
    apiUrl: "http://your-api-server:5000",
  }}
  enabled={true}
  minConfidence={0.7}
  maxProducts={5}
  showIndicators={true}
  showLabels={true}
  indicatorColor="#4CAF50"
  indicatorSize={0.1}
  indicatorAnimation="pulse"
  onProductsDetected={(products) => {
    console.log('Detected products:', products);
  }}
  onProductSelected={(product, searchResults) => {
    console.log('Selected product:', product);
    console.log('Search results:', searchResults);
  }}
  captureInterval={5000}
  autoCaptureEnabled={true}
  priceTrackingEnabled={true}
  findSimilarProductsEnabled={true}
  findBestDealsEnabled={true}
  showBuyingOptionsEnabled={true}
  showPriceHistoryEnabled={true}
  priceHistoryDays={30}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `apiConfig` | object | Shopping API configuration |
| `enabled` | boolean | Flag to enable/disable product detection |
| `minConfidence` | number | Minimum confidence level (0-1) for product detection |
| `maxProducts` | number | Maximum number of products to detect simultaneously |
| `onProductsDetected` | function | Callback when products are detected |
| `onProductSelected` | function | Callback when a product is selected/tapped |
| `showIndicators` | boolean | Flag to show/hide visual indicators for detected products |
| `indicatorColor` | string | Color of the indicator dot |
| `indicatorSize` | number | Size of the indicator dot |
| `indicatorAnimation` | string | Animation name for the indicator |
| `showLabels` | boolean | Flag to show/hide product labels |
| `renderIndicator` | function | Custom renderer for product indicators |
| `renderLabel` | function | Custom renderer for product labels |
| `renderProductDetails` | function | Custom renderer for product details |
| `captureInterval` | number | Interval in milliseconds for capturing and analyzing images |
| `autoCaptureEnabled` | boolean | Flag to enable/disable automatic image capture |
| `onImageCaptured` | function | Callback when an image is captured |
| `priceTrackingEnabled` | boolean | Flag to enable/disable price tracking |
| `findSimilarProductsEnabled` | boolean | Flag to enable/disable finding similar products |
| `findBestDealsEnabled` | boolean | Flag to enable/disable finding best deals |
| `showBuyingOptionsEnabled` | boolean | Flag to enable/disable showing buying options |
| `showPriceHistoryEnabled` | boolean | Flag to enable/disable showing price history |
| `priceHistoryDays` | number | Number of days of price history to show |

## Product Data

The `onProductsDetected` callback provides an array of detected products with the following structure:

```typescript
type DetectedProduct = {
  id?: string;
  name: string;
  confidence: number;
  type: string;
  boundingBox?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  attributes: Record<string, any>;
};
```

The `onProductSelected` callback provides the selected product and search results:

```typescript
type ProductSearchResult = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  url: string;
  image_url: string;
  platform: string;
  rating: number;
  reviews_count: number;
  relevance: number;
  category: string;
  brand: string;
  availability: string;
  shipping: {
    price: number;
    is_free: boolean;
    estimated_delivery: string;
  };
};
```

## Demo

Check out the `ViroShoppingARDemo` component for a complete example of how to use the Shopping AR integration.

```jsx
import { ViroShoppingARDemo } from '@reactvision/react-viro';

// In your app
<ViroShoppingARDemo 
  apiKey="your-api-key" 
  apiUrl="http://your-api-server:5000" 
/>
```

## Python AI Agent

The Shopping AR integration includes a Python AI agent that provides product detection and shopping recommendations. The agent uses computer vision APIs and shopping platform APIs to detect products and provide shopping information.

### Setting Up the Python Agent

1. Install the required dependencies:
   ```
   cd python/shopping_agent
   pip install -r requirements.txt
   ```

2. Configure the API keys in `config.json`:
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
     }
   }
   ```

3. Start the API server:
   ```
   python api_server.py
   ```

4. Configure the ViroShoppingAR component to use the API server:
   ```jsx
   <ViroShoppingAR
     apiConfig={{
       apiUrl: "http://localhost:5000",
     }}
     // ...
   />
   ```

## Requirements

- React Native 0.63+
- Viro React 2.20+
- iOS 11+ or Android API Level 24+
- Python 3.7+ for the AI agent
- API keys for OpenAI, Google Cloud Vision, and shopping platforms (optional)

## Notes

- The current implementation uses simulated product detection for demonstration purposes
- For production use, you should implement the native module to capture images from the AR camera
- API usage is subject to the pricing and rate limits of the respective APIs