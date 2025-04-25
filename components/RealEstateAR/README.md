# ViroRealEstateAR

The ViroRealEstateAR component integrates GPS and Real Estate API with ViroReact to display property information in AR. It allows users to see properties around them in augmented reality with detailed information and filtering options.

## Features

- **GPS Integration**: Uses device GPS to determine user location
- **Real Estate API**: Integrates with Real Estate API to fetch property data
- **AR Visualization**: Displays properties in AR with visual indicators
- **Property Details**: Shows detailed information about properties
- **Filtering**: Allows filtering properties by price, bedrooms, property type, etc.
- **Distance-Based**: Shows properties within a specified distance
- **Auto-Updates**: Automatically updates property data as user moves

## Usage

```jsx
import { 
  ViroARScene, 
  ViroARSceneNavigator, 
  ViroRealEstateAR 
} from '@reactvision/react-viro';

// Inside your AR scene component
<ViroRealEstateAR
  apiConfig={{
    apiKey: "your-realestate-api-key",
  }}
  enabled={true}
  maxDistance={1000}
  maxProperties={20}
  showIndicators={true}
  showLabels={true}
  indicatorColor="#FF5722"
  indicatorSize={0.2}
  indicatorAnimation="pulse"
  onPropertiesDetected={(properties) => {
    console.log('Detected properties:', properties);
  }}
  onPropertySelected={(property) => {
    console.log('Selected property:', property);
  }}
  updateInterval={30000}
  autoUpdateEnabled={true}
  showForSaleOnly={true}
  minPrice={500000}
  maxPrice={1000000}
  minBedrooms={2}
  maxBedrooms={4}
  propertyTypes={["Single Family", "Condo"]}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `apiConfig` | object | Real Estate API configuration |
| `enabled` | boolean | Flag to enable/disable property detection |
| `maxDistance` | number | Maximum distance in meters to show properties |
| `maxProperties` | number | Maximum number of properties to show |
| `onPropertiesDetected` | function | Callback when properties are detected |
| `onPropertySelected` | function | Callback when a property is selected/tapped |
| `showIndicators` | boolean | Flag to show/hide visual indicators for properties |
| `indicatorColor` | string | Color of the indicator dot |
| `indicatorSize` | number | Size of the indicator dot |
| `indicatorAnimation` | string | Animation name for the indicator |
| `showLabels` | boolean | Flag to show/hide property labels |
| `renderIndicator` | function | Custom renderer for property indicators |
| `renderLabel` | function | Custom renderer for property labels |
| `renderPropertyDetails` | function | Custom renderer for property details |
| `updateInterval` | number | Interval in milliseconds for updating property data |
| `autoUpdateEnabled` | boolean | Flag to enable/disable automatic updates |
| `showForSaleOnly` | boolean | Flag to show properties for sale only |
| `showForRentOnly` | boolean | Flag to show properties for rent only |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `minBedrooms` | number | Minimum bedrooms filter |
| `maxBedrooms` | number | Maximum bedrooms filter |
| `minBathrooms` | number | Minimum bathrooms filter |
| `maxBathrooms` | number | Maximum bathrooms filter |
| `propertyTypes` | string[] | Property type filter |

## Property Data

The `onPropertiesDetected` callback provides an array of property summaries with the following structure:

```typescript
type PropertySummary = {
  propertyId: string;
  address: Address;
  price: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: string;
  listingStatus: "for_sale" | "for_rent" | "sold" | "off_market";
  thumbnail: string;
  latitude: number;
  longitude: number;
};
```

The `onPropertySelected` callback provides detailed property information with the following structure:

```typescript
type PropertyDetails = {
  propertyId: string;
  address: Address;
  price: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: string;
  description: string;
  features: string[];
  images: string[];
  schools: School[];
  taxInfo: TaxInfo;
  zestimate?: number;
  rentZestimate?: number;
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;
  nearbyAmenities: Amenity[];
  saleHistory: SaleHistoryItem[];
  listingStatus: "for_sale" | "for_rent" | "sold" | "off_market";
  daysOnMarket?: number;
  virtualTourUrl?: string;
  contactInfo?: ContactInfo;
};
```

## Demo

Check out the `ViroRealEstateARDemo` component for a complete example of how to use the Real Estate AR integration.

```jsx
import { ViroRealEstateARDemo } from '@reactvision/react-viro';

// In your app
<ViroRealEstateARDemo apiKey="your-realestate-api-key" />
```

## Additional Services

The `ViroRealEstateService` provides additional methods for working with real estate data:

- `getPropertyDetails(propertyId)`: Get detailed information about a property
- `searchProperties(params)`: Search for properties based on parameters
- `getPropertiesNearLocation(location, radius, limit)`: Get properties near a location
- `getPropertiesNearCurrentLocation(radius, limit)`: Get properties near the current location
- `getPropertyDetailsByAddress(address)`: Get property details by address
- `geocodeAddress(address)`: Convert an address to coordinates
- `reverseGeocode(location)`: Convert coordinates to an address

## Requirements

- React Native 0.63+
- Viro React 2.20+
- iOS 11+ or Android API Level 24+
- Real Estate API key (e.g., from developer.realestateapi.com)
- Device with GPS capabilities

## Notes

- The current implementation uses simulated location updates for demonstration purposes
- For production use, you should implement the native module to get real GPS data
- API usage is subject to the Real Estate API's pricing and rate limits