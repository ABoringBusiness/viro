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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViroRealEstateAR = void 0;
const React = __importStar(require("react"));
const ViroAnimations_1 = require("../Animation/ViroAnimations");
const ViroNode_1 = require("../ViroNode");
const ViroSphere_1 = require("../ViroSphere");
const ViroText_1 = require("../ViroText");
const ViroFlexView_1 = require("../ViroFlexView");
const ViroImage_1 = require("../ViroImage");
const ViroRealEstateService_1 = require("./ViroRealEstateService");
// Register animations for property indicators
ViroAnimations_1.ViroAnimations.registerAnimations({
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
/**
 * ViroRealEstateAR is a component that uses GPS and Real Estate API to display
 * property information in AR.
 */
class ViroRealEstateAR extends React.Component {
    _updateInterval = null;
    _arScene = null;
    _realEstateService;
    _locationListener = null;
    constructor(props) {
        super(props);
        this.state = {
            properties: [],
            selectedProperty: null,
            isLoading: false,
            currentLocation: null,
            showPropertyDetails: false,
            error: null,
        };
        this._realEstateService = ViroRealEstateService_1.ViroRealEstateService.getInstance();
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
    componentDidUpdate(prevProps) {
        if (prevProps.enabled !== this.props.enabled) {
            if (this.props.enabled) {
                this._startPropertyDetection();
            }
            else {
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
        if (prevProps.maxDistance !== this.props.maxDistance ||
            prevProps.showForSaleOnly !== this.props.showForSaleOnly ||
            prevProps.showForRentOnly !== this.props.showForRentOnly ||
            prevProps.minPrice !== this.props.minPrice ||
            prevProps.maxPrice !== this.props.maxPrice ||
            prevProps.minBedrooms !== this.props.minBedrooms ||
            prevProps.maxBedrooms !== this.props.maxBedrooms ||
            prevProps.minBathrooms !== this.props.minBathrooms ||
            prevProps.maxBathrooms !== this.props.maxBathrooms ||
            JSON.stringify(prevProps.propertyTypes) !== JSON.stringify(this.props.propertyTypes)) {
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
    _onLocationUpdate(location) {
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
            const searchParams = {
                location: this.state.currentLocation,
                radius: this.props.maxDistance || 1000, // Default to 1000 meters
                limit: this.props.maxProperties || 10,
            };
            // Add filters
            if (this.props.showForSaleOnly) {
                searchParams.listingStatus = ["for_sale"];
            }
            else if (this.props.showForRentOnly) {
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
        }
        catch (error) {
            console.error("Error updating properties:", error);
            this.setState({
                isLoading: false,
                error: "Failed to update properties",
            });
        }
    };
    _onPropertySelected = async (property) => {
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
        }
        catch (error) {
            console.error("Error getting property details:", error);
            this.setState({
                isLoading: false,
                error: "Failed to get property details",
            });
        }
    };
    _getPositionForProperty(property) {
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
                return (<ViroNode_1.ViroNode key={`indicator-${property.propertyId}`} position={this._getPositionForProperty(property)} onClick={() => this._onPropertySelected(property)}>
            {this.props.renderIndicator(property)}
          </ViroNode_1.ViroNode>);
            }
            // Default indicator is an orange sphere with pulse animation
            const animation = this.props.indicatorAnimation || "pulse";
            return (<ViroNode_1.ViroNode key={`indicator-${property.propertyId}`} position={this._getPositionForProperty(property)} onClick={() => this._onPropertySelected(property)}>
          <ViroSphere_1.ViroSphere radius={indicatorSize} materials={["propertyIndicator"]} animation={{
                    name: typeof animation === "string" ? animation : animation.name,
                    run: true,
                    loop: true,
                }} physicsBody={{
                    type: "Kinematic",
                }}/>
          
          {this.props.showLabels && this._renderLabel(property, index)}
        </ViroNode_1.ViroNode>);
        });
    }
    _renderLabel(property, index) {
        // If custom label renderer is provided, use it
        if (this.props.renderLabel) {
            return this.props.renderLabel(property);
        }
        // Default label is a text with property price and basic info
        return (<ViroNode_1.ViroNode position={[0, indicatorSize + 0.2, 0]}>
        <ViroFlexView_1.ViroFlexView style={{
                padding: 0.05,
                backgroundColor: "#000000AA",
                borderRadius: 0.05,
            }} width={1.5} height={0.5}>
          <ViroText_1.ViroText text={property.price} style={{
                fontFamily: "Arial",
                fontSize: 14,
                color: "#FFFFFF",
                textAlignVertical: "center",
                textAlign: "center",
                fontWeight: "bold",
            }}/>
          <ViroText_1.ViroText text={`${property.bedrooms} bed, ${property.bathrooms} bath`} style={{
                fontFamily: "Arial",
                fontSize: 12,
                color: "#CCCCCC",
                textAlignVertical: "center",
                textAlign: "center",
            }}/>
          <ViroText_1.ViroText text={`${property.squareFeet} sq ft`} style={{
                fontFamily: "Arial",
                fontSize: 12,
                color: "#CCCCCC",
                textAlignVertical: "center",
                textAlign: "center",
            }}/>
        </ViroFlexView_1.ViroFlexView>
      </ViroNode_1.ViroNode>);
    }
    _renderPropertyDetails() {
        const { selectedProperty, showPropertyDetails } = this.state;
        if (!selectedProperty || !showPropertyDetails) {
            return null;
        }
        // If custom property details renderer is provided, use it
        if (this.props.renderPropertyDetails) {
            return (<ViroNode_1.ViroNode position={[0, 0, -2]} animation={{
                    name: "showPropertyCard",
                    run: showPropertyDetails,
                    loop: false,
                }}>
          {this.props.renderPropertyDetails(selectedProperty)}
        </ViroNode_1.ViroNode>);
        }
        // Default property details card
        return (<ViroNode_1.ViroNode position={[0, 0, -2]} animation={{
                name: "showPropertyCard",
                run: showPropertyDetails,
                loop: false,
            }}>
        <ViroFlexView_1.ViroFlexView style={{
                padding: 0.1,
                backgroundColor: "#FFFFFF",
                borderRadius: 0.05,
            }} width={2.5} height={2} materials={["propertyCard"]}>
          <ViroImage_1.ViroImage source={{ uri: selectedProperty.images[0] || "" }} width={2.3} height={1} style={{ borderRadius: 0.05 }}/>
          
          <ViroText_1.ViroText text={selectedProperty.price} style={{
                fontFamily: "Arial",
                fontSize: 20,
                color: "#000000",
                textAlignVertical: "center",
                textAlign: "center",
                fontWeight: "bold",
            }}/>
          
          <ViroText_1.ViroText text={selectedProperty.address.formattedAddress} style={{
                fontFamily: "Arial",
                fontSize: 16,
                color: "#333333",
                textAlignVertical: "center",
                textAlign: "center",
            }}/>
          
          <ViroText_1.ViroText text={`${selectedProperty.bedrooms} bed, ${selectedProperty.bathrooms} bath, ${selectedProperty.squareFeet} sq ft`} style={{
                fontFamily: "Arial",
                fontSize: 14,
                color: "#666666",
                textAlignVertical: "center",
                textAlign: "center",
            }}/>
          
          <ViroText_1.ViroText text={`Year Built: ${selectedProperty.yearBuilt} | Lot Size: ${selectedProperty.lotSize} sq ft`} style={{
                fontFamily: "Arial",
                fontSize: 12,
                color: "#666666",
                textAlignVertical: "center",
                textAlign: "center",
            }}/>
          
          <ViroText_1.ViroText text="Tap anywhere to dismiss" style={{
                fontFamily: "Arial",
                fontSize: 12,
                color: "#999999",
                textAlignVertical: "center",
                textAlign: "center",
            }}/>
        </ViroFlexView_1.ViroFlexView>
      </ViroNode_1.ViroNode>);
    }
    _onSceneTap = () => {
        if (this.state.showPropertyDetails) {
            this.setState({
                showPropertyDetails: false,
            });
        }
    };
    render() {
        return (<>
        {this._renderPropertyIndicators()}
        {this._renderPropertyDetails()}
      </>);
    }
}
exports.ViroRealEstateAR = ViroRealEstateAR;
