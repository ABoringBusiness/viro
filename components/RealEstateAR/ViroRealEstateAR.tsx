/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroRealEstateAR
 */

"use strict";

import * as React from "react";
import {
  findNodeHandle,
  NativeModules,
  NativeSyntheticEvent,
  requireNativeComponent,
  ViewProps,
} from "react-native";
import { ViroAnimations, ViroAnimation } from "../Animation/ViroAnimations";
import { ViroNode } from "../ViroNode";
import { ViroSphere } from "../ViroSphere";
import { ViroText } from "../ViroText";
import { ViroFlexView } from "../ViroFlexView";
import { ViroImage } from "../ViroImage";
import { ViroARScene } from "../AR/ViroARScene";
import { Viro3DPoint } from "../Types/ViroUtils";
import { 
  ViroRealEstateService, 
  GeoLocation, 
  PropertyDetails, 
  PropertySummary, 
  RealEstateAPIConfig 
} from "./ViroRealEstateService";

// Register animations for property indicators
ViroAnimations.registerAnimations({
  scaleUp: {
    properties: {
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
    },
    duration: 500,
    easing: "bounce",
  },
  scaleDown: {
    properties: {
      scaleX: 0.5,
      scaleY: 0.5,
      scaleZ: 0.5,
    },
    duration: 500,
    easing: "bounce",
  },
  pulse: [
    ["scaleUp", "scaleDown"],
  ],
  rotate: {
    properties: {
      rotateY: "+=90",
    },
    duration: 1000,
  },
  fadeIn: {
    properties: {
      opacity: 1.0,
    },
    duration: 500,
  },
  fadeOut: {
    properties: {
      opacity: 0.0,
    },
    duration: 500,
  },
  showPropertyCard: [
    ["fadeIn", "scaleUp"],
  ],
  hidePropertyCard: [
    ["fadeOut", "scaleDown"],
  ],
});

type Props = ViewProps & {
  /**
   * Real Estate API configuration
   */
  apiConfig: RealEstateAPIConfig;

  /**
   * Flag to enable/disable property detection
   */
  enabled?: boolean;

  /**
   * Maximum distance in meters to show properties
   */
  maxDistance?: number;

  /**
   * Maximum number of properties to show
   */
  maxProperties?: number;

  /**
   * Callback when properties are detected
   */
  onPropertiesDetected?: (properties: PropertySummary[]) => void;

  /**
   * Callback when a property is selected/tapped
   */
  onPropertySelected?: (property: PropertyDetails) => void;

  /**
   * Flag to show/hide visual indicators for properties
   */
  showIndicators?: boolean;

  /**
   * Color of the indicator dot
   */
  indicatorColor?: string;

  /**
   * Size of the indicator dot
   */
  indicatorSize?: number;

  /**
   * Animation name for the indicator
   */
  indicatorAnimation?: string | ViroAnimation;

  /**
   * Flag to show/hide property labels
   */
  showLabels?: boolean;

  /**
   * Custom renderer for property indicators
   */
  renderIndicator?: (property: PropertySummary) => React.ReactNode;

  /**
   * Custom renderer for property labels
   */
  renderLabel?: (property: PropertySummary) => React.ReactNode;

  /**
   * Custom renderer for property details
   */
  renderPropertyDetails?: (property: PropertyDetails) => React.ReactNode;

  /**
   * Interval in milliseconds for updating property data
   */
  updateInterval?: number;

  /**
   * Flag to enable/disable automatic updates
   */
  autoUpdateEnabled?: boolean;

  /**
   * Flag to show properties for sale only
   */
  showForSaleOnly?: boolean;

  /**
   * Flag to show properties for rent only
   */
  showForRentOnly?: boolean;

  /**
   * Minimum price filter
   */
  minPrice?: number;

  /**
   * Maximum price filter
   */
  maxPrice?: number;

  /**
   * Minimum bedrooms filter
   */
  minBedrooms?: number;

  /**
   * Maximum bedrooms filter
   */
  maxBedrooms?: number;

  /**
   * Minimum bathrooms filter
   */
  minBathrooms?: number;

  /**
   * Maximum bathrooms filter
   */
  maxBathrooms?: number;

  /**
   * Property type filter
   */
  propertyTypes?: string[];
};

type State = {
  properties: PropertySummary[];
  selectedProperty: PropertyDetails | null;
  isLoading: boolean;
  currentLocation: GeoLocation | null;
  showPropertyDetails: boolean;
  error: string | null;
};

/**
 * ViroRealEstateAR is a component that uses GPS and Real Estate API to display
 * property information in AR.
 */
export class ViroRealEstateAR extends React.Component<Props, State> {
  _updateInterval: NodeJS.Timeout | null = null;
  _arScene: ViroARScene | null = null;
  _realEstateService: ViroRealEstateService;
  _locationListener: ((location: GeoLocation) => void) | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      properties: [],
      selectedProperty: null,
      isLoading: false,
      currentLocation: null,
      showPropertyDetails: false,
      error: null,
    };
    this._realEstateService = ViroRealEstateService.getInstance();
  }

  async componentDidMount() {
    // Initialize the Real Estate service
    await this._realEstateService.initialize(this.props.apiConfig);

    // Start watching location
    this._locationListener = this._onLocationUpdate.bind(this);
    await this._realEstateService.startWatchingLocation(this._locationListener);

    if (this.props.enabled !== false) {
      this._startPropertyDetection();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.enabled !== this.props.enabled) {
      if (this.props.enabled) {
        this._startPropertyDetection();
      } else {
        this._stopPropertyDetection();
      }
    }

    if (prevProps.apiConfig !== this.props.apiConfig) {
      this._realEstateService.initialize(this.props.apiConfig);
    }

    if (prevProps.updateInterval !== this.props.updateInterval && this.props.autoUpdateEnabled) {
      this._stopPropertyDetection();
      this._startPropertyDetection();
    }

    // Check if any filter props have changed
    if (
      prevProps.maxDistance !== this.props.maxDistance ||
      prevProps.showForSaleOnly !== this.props.showForSaleOnly ||
      prevProps.showForRentOnly !== this.props.showForRentOnly ||
      prevProps.minPrice !== this.props.minPrice ||
      prevProps.maxPrice !== this.props.maxPrice ||
      prevProps.minBedrooms !== this.props.minBedrooms ||
      prevProps.maxBedrooms !== this.props.maxBedrooms ||
      prevProps.minBathrooms !== this.props.minBathrooms ||
      prevProps.maxBathrooms !== this.props.maxBathrooms ||
      JSON.stringify(prevProps.propertyTypes) !== JSON.stringify(this.props.propertyTypes)
    ) {
      // Update properties with new filters
      this._updateProperties();
    }
  }

  componentWillUnmount() {
    this._stopPropertyDetection();
    
    if (this._locationListener) {
      this._realEstateService.removeLocationListener(this._locationListener);
      this._locationListener = null;
    }
    
    this._realEstateService.stopWatchingLocation();
    this._realEstateService.release();
  }

  _onLocationUpdate(location: GeoLocation) {
    this.setState({ currentLocation: location });
    
    // Update properties when location changes significantly
    if (this.props.enabled !== false) {
      this._updateProperties();
    }
  }

  _startPropertyDetection = () => {
    if (this.props.autoUpdateEnabled !== false) {
      const interval = this.props.updateInterval || 30000; // Default to 30 seconds
      this._updateInterval = setInterval(() => {
        this._updateProperties();
      }, interval);
      
      // Initial update
      this._updateProperties();
    }
  };

  _stopPropertyDetection = () => {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  };

  _updateProperties = async () => {
    if (this.state.isLoading || !this.state.currentLocation) {
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      // Build search parameters based on props
      const searchParams: any = {
        location: this.state.currentLocation,
        radius: this.props.maxDistance || 1000, // Default to 1000 meters
        limit: this.props.maxProperties || 10,
      };
      
      // Add filters
      if (this.props.showForSaleOnly) {
        searchParams.listingStatus = ["for_sale"];
      } else if (this.props.showForRentOnly) {
        searchParams.listingStatus = ["for_rent"];
      }
      
      if (this.props.minPrice) {
        searchParams.minPrice = this.props.minPrice;
      }
      
      if (this.props.maxPrice) {
        searchParams.maxPrice = this.props.maxPrice;
      }
      
      if (this.props.minBedrooms) {
        searchParams.minBedrooms = this.props.minBedrooms;
      }
      
      if (this.props.maxBedrooms) {
        searchParams.maxBedrooms = this.props.maxBedrooms;
      }
      
      if (this.props.minBathrooms) {
        searchParams.minBathrooms = this.props.minBathrooms;
      }
      
      if (this.props.maxBathrooms) {
        searchParams.maxBathrooms = this.props.maxBathrooms;
      }
      
      if (this.props.propertyTypes && this.props.propertyTypes.length > 0) {
        searchParams.propertyType = this.props.propertyTypes;
      }
      
      // Search for properties
      const result = await this._realEstateService.searchProperties(searchParams);
      
      this.setState({
        properties: result.properties,
        isLoading: false,
      });
      
      if (this.props.onPropertiesDetected) {
        this.props.onPropertiesDetected(result.properties);
      }
    } catch (error) {
      console.error("Error updating properties:", error);
      this.setState({
        isLoading: false,
        error: "Failed to update properties",
      });
    }
  };

  _onPropertySelected = async (property: PropertySummary) => {
    try {
      this.setState({ isLoading: true, error: null });
      
      // Get full property details
      const propertyDetails = await this._realEstateService.getPropertyDetails(property.propertyId);
      
      this.setState({
        selectedProperty: propertyDetails,
        showPropertyDetails: true,
        isLoading: false,
      });
      
      if (this.props.onPropertySelected) {
        this.props.onPropertySelected(propertyDetails);
      }
    } catch (error) {
      console.error("Error getting property details:", error);
      this.setState({
        isLoading: false,
        error: "Failed to get property details",
      });
    }
  };

  _getPositionForProperty(property: PropertySummary): Viro3DPoint {
    if (!this.state.currentLocation) {
      // Default position if no current location
      return [0, 0, -5];
    }
    
    // Calculate relative position based on GPS coordinates
    // This is a simplified calculation and would need to be adjusted for accuracy
    const latDiff = property.latitude - this.state.currentLocation.latitude;
    const lngDiff = property.longitude - this.state.currentLocation.longitude;
    
    // Convert to approximate meters (very rough approximation)
    // 1 degree of latitude is approximately 111,000 meters
    // 1 degree of longitude varies with latitude, but at the equator it's also about 111,000 meters
    const metersPerDegree = 111000;
    
    // Calculate x (east-west) and z (north-south) in meters
    const x = lngDiff * metersPerDegree * Math.cos(this.state.currentLocation.latitude * Math.PI / 180);
    const z = -latDiff * metersPerDegree; // Negative because north is negative z in AR
    
    // Scale down for AR (1 meter in real world = 1 unit in AR)
    // Limit the distance to make it visible in AR
    const maxDistance = 50; // Maximum distance in AR units
    const distance = Math.sqrt(x * x + z * z);
    
    if (distance > maxDistance) {
      const scale = maxDistance / distance;
      return [x * scale, 0, z * scale];
    }
    
    return [x, 0, z];
  }

  _renderPropertyIndicators() {
    const { showIndicators = true, indicatorColor = "#FF5722", indicatorSize = 0.2 } = this.props;
    
    if (!showIndicators) {
      return null;
    }
    
    return this.state.properties.map((property, index) => {
      // If custom renderer is provided, use it
      if (this.props.renderIndicator) {
        return (
          <ViroNode
            key={`indicator-${property.propertyId}`}
            position={this._getPositionForProperty(property)}
            onClick={() => this._onPropertySelected(property)}
          >
            {this.props.renderIndicator(property)}
          </ViroNode>
        );
      }
      
      // Default indicator is an orange sphere with pulse animation
      const animation = this.props.indicatorAnimation || "pulse";
      
      return (
        <ViroNode
          key={`indicator-${property.propertyId}`}
          position={this._getPositionForProperty(property)}
          onClick={() => this._onPropertySelected(property)}
        >
          <ViroSphere
            radius={indicatorSize}
            materials={["propertyIndicator"]}
            animation={{
              name: typeof animation === "string" ? animation : animation.name,
              run: true,
              loop: true,
            }}
            physicsBody={{
              type: "Kinematic",
            }}
          />
          
          {this.props.showLabels && this._renderLabel(property, index)}
        </ViroNode>
      );
    });
  }
  
  _renderLabel(property: PropertySummary, index: number) {
    // If custom label renderer is provided, use it
    if (this.props.renderLabel) {
      return this.props.renderLabel(property);
    }
    
    // Default label is a text with property price and basic info
    return (
      <ViroNode position={[0, indicatorSize + 0.2, 0]}>
        <ViroFlexView
          style={{
            padding: 0.05,
            backgroundColor: "#000000AA",
            borderRadius: 0.05,
          }}
          width={1.5}
          height={0.5}
        >
          <ViroText
            text={property.price}
            style={{
              fontFamily: "Arial",
              fontSize: 14,
              color: "#FFFFFF",
              textAlignVertical: "center",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
          <ViroText
            text={`${property.bedrooms} bed, ${property.bathrooms} bath`}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#CCCCCC",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          <ViroText
            text={`${property.squareFeet} sq ft`}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#CCCCCC",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
        </ViroFlexView>
      </ViroNode>
    );
  }

  _renderPropertyDetails() {
    const { selectedProperty, showPropertyDetails } = this.state;
    
    if (!selectedProperty || !showPropertyDetails) {
      return null;
    }
    
    // If custom property details renderer is provided, use it
    if (this.props.renderPropertyDetails) {
      return (
        <ViroNode
          position={[0, 0, -2]}
          animation={{
            name: "showPropertyCard",
            run: showPropertyDetails,
            loop: false,
          }}
        >
          {this.props.renderPropertyDetails(selectedProperty)}
        </ViroNode>
      );
    }
    
    // Default property details card
    return (
      <ViroNode
        position={[0, 0, -2]}
        animation={{
          name: "showPropertyCard",
          run: showPropertyDetails,
          loop: false,
        }}
      >
        <ViroFlexView
          style={{
            padding: 0.1,
            backgroundColor: "#FFFFFF",
            borderRadius: 0.05,
          }}
          width={2.5}
          height={2}
          materials={["propertyCard"]}
        >
          <ViroImage
            source={{ uri: selectedProperty.images[0] || "" }}
            width={2.3}
            height={1}
            style={{ borderRadius: 0.05 }}
          />
          
          <ViroText
            text={selectedProperty.price}
            style={{
              fontFamily: "Arial",
              fontSize: 20,
              color: "#000000",
              textAlignVertical: "center",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
          
          <ViroText
            text={selectedProperty.address.formattedAddress}
            style={{
              fontFamily: "Arial",
              fontSize: 16,
              color: "#333333",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          
          <ViroText
            text={`${selectedProperty.bedrooms} bed, ${selectedProperty.bathrooms} bath, ${selectedProperty.squareFeet} sq ft`}
            style={{
              fontFamily: "Arial",
              fontSize: 14,
              color: "#666666",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          
          <ViroText
            text={`Year Built: ${selectedProperty.yearBuilt} | Lot Size: ${selectedProperty.lotSize} sq ft`}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#666666",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          
          <ViroText
            text="Tap anywhere to dismiss"
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#999999",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
        </ViroFlexView>
      </ViroNode>
    );
  }

  _onSceneTap = () => {
    if (this.state.showPropertyDetails) {
      this.setState({
        showPropertyDetails: false,
      });
    }
  };

  render() {
    return (
      <>
        {this._renderPropertyIndicators()}
        {this._renderPropertyDetails()}
      </>
    );
  }
}