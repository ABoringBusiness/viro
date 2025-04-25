# ViroPriceTracker

The ViroPriceTracker component provides price tracking functionality for products scanned in AR. It allows users to scan barcodes, track products, set price alerts, compare prices across retailers, and view price history.

## Features

- **Barcode Scanning**: Scan barcodes to identify products
- **Price Tracking**: Track prices of products over time
- **Price Alerts**: Set alerts for price changes
- **Price Comparison**: Compare prices across different retailers
- **Price History**: View price history for tracked products
- **Visual Indicators**: Display visual indicators for price changes
- **Notifications**: Receive notifications for price alerts

## Usage

```jsx
import { 
  ViroARScene, 
  ViroARSceneNavigator, 
  ViroPriceTracker 
} from '@reactvision/react-viro';

// Inside your AR scene component
<ViroPriceTracker
  config={{
    notificationEmail: "user@example.com",
    notificationPhone: "+1234567890",
    enablePushNotifications: true,
  }}
  enabled={true}
  showPriceIndicators={true}
  priceDecreaseColor="#4CAF50"
  priceIncreaseColor="#F44336"
  priceIndicatorSize={0.1}
  priceIndicatorAnimation="pulse"
  onBarcodeScanned={(result) => {
    console.log('Scanned barcode:', result);
  }}
  onProductTracked={(product) => {
    console.log('Tracked product:', product);
  }}
  onPriceAlertCreated={(alert) => {
    console.log('Created price alert:', alert);
  }}
  onPriceAlertTriggered={(alert) => {
    console.log('Price alert triggered:', alert);
  }}
  alertCheckInterval={60000}
  priceUpdateInterval={3600000}
  autoUpdatePrices={true}
  autoCheckAlerts={true}
  priceHistoryDays={30}
  enablePriceComparison={true}
  enablePriceHistory={true}
  enablePriceAlerts={true}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | object | Price Tracker configuration |
| `enabled` | boolean | Flag to enable/disable price tracking |
| `onBarcodeScanned` | function | Callback when a barcode is scanned |
| `onProductTracked` | function | Callback when a product is tracked |
| `onPriceAlertCreated` | function | Callback when a price alert is created |
| `onPriceAlertTriggered` | function | Callback when a price alert is triggered |
| `onPricesUpdated` | function | Callback when prices are updated |
| `onPriceComparisonComplete` | function | Callback when price comparison is complete |
| `showPriceIndicators` | boolean | Flag to show/hide visual indicators for price changes |
| `priceDecreaseColor` | string | Color for price decrease indicators |
| `priceIncreaseColor` | string | Color for price increase indicators |
| `priceIndicatorSize` | number | Size of the price indicator |
| `priceIndicatorAnimation` | string | Animation name for the price indicator |
| `renderPriceIndicator` | function | Custom renderer for price indicators |
| `renderProductDetails` | function | Custom renderer for product details |
| `alertCheckInterval` | number | Interval in milliseconds for checking price alerts |
| `priceUpdateInterval` | number | Interval in milliseconds for updating prices |
| `autoUpdatePrices` | boolean | Flag to enable/disable automatic price updates |
| `autoCheckAlerts` | boolean | Flag to enable/disable automatic price alert checks |
| `priceHistoryDays` | number | Number of days of price history to show |
| `enablePriceComparison` | boolean | Flag to enable/disable price comparison |
| `enablePriceHistory` | boolean | Flag to enable/disable price history |
| `enablePriceAlerts` | boolean | Flag to enable/disable price alerts |

## Product Data

The `onProductTracked` callback provides product information with the following structure:

```typescript
type Product = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  currentPrice: number;
  currency: string;
  url?: string;
  retailer: string;
  category?: string;
  brand?: string;
  model?: string;
  sku?: string;
  barcode?: string;
  dateAdded: string;
  lastUpdated: string;
};
```

## Price Alert Data

The `onPriceAlertCreated` and `onPriceAlertTriggered` callbacks provide price alert information with the following structure:

```typescript
type PriceAlert = {
  id: string;
  productId: string;
  targetPrice: number;
  notifyOnPriceIncrease: boolean;
  notifyOnPriceDecrease: boolean;
  notifyOnPercentageChange?: number;
  notifyEmail?: string;
  notifyPhone?: string;
  notifyPush?: boolean;
  status: "active" | "triggered" | "paused" | "deleted";
  createdAt: string;
  lastTriggeredAt?: string;
};
```

## Demo

Check out the `ViroPriceTrackerDemo` component for a complete example of how to use the Price Tracker integration.

```jsx
import { ViroPriceTrackerDemo } from '@reactvision/react-viro';

// In your app
<ViroPriceTrackerDemo
  notificationEmail="user@example.com"
  notificationPhone="+1234567890"
  enablePushNotifications={true}
/>
```

## Additional Services

The `ViroPriceTrackerService` provides additional methods for working with price tracking:

- `scanBarcode(barcodeData)`: Scan a barcode to get product information
- `searchProducts(query, limit)`: Search for products by name
- `trackProduct(product)`: Track a product for price changes
- `untrackProduct(productId)`: Stop tracking a product
- `createPriceAlert(productId, targetPrice, options)`: Create a price alert for a product
- `updatePriceAlert(alertId, updates)`: Update a price alert
- `deletePriceAlert(alertId)`: Delete a price alert
- `getPriceAlerts(productId)`: Get all price alerts for a product
- `getAllPriceAlerts()`: Get all price alerts
- `getPriceHistory(productId, days)`: Get price history for a product
- `comparePrices(productId)`: Compare prices for a product across different retailers
- `checkPriceAlerts()`: Check if there are any price alerts that have been triggered
- `updatePrices()`: Update prices for all tracked products

## Requirements

- React Native 0.63+
- Viro React 2.20+
- iOS 11+ or Android API Level 24+
- @react-native-async-storage/async-storage package

## Notes

- The current implementation uses simulated data for demonstration purposes
- For production use, you would need to integrate with real barcode scanning and price tracking APIs
- Price alerts are stored locally using AsyncStorage