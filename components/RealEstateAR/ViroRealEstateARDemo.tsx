/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroRealEstateARDemo
 */

import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert, Modal, ScrollView } from "react-native";
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroConstants,
  ViroARPlane,
  ViroMaterials,
  ViroNode,
  ViroAnimations,
  ViroFlexView,
  ViroImage,
  ViroButton,
} from "../..";
import { ViroRealEstateAR } from "./ViroRealEstateAR";
import { 
  ViroRealEstateService, 
  PropertyDetails, 
  PropertySummary, 
  GeoLocation 
} from "./ViroRealEstateService";

// Register materials for the demo
ViroMaterials.createMaterials({
  propertyCard: {
    diffuseColor: "#FFFFFF",
    diffuseTexture: require("../Resources/card_texture.jpg"),
  },
  filterButton: {
    diffuseColor: "#2196F3",
  },
  resetButton: {
    diffuseColor: "#F44336",
  },
});

// Register animations for the demo
ViroAnimations.registerAnimations({
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
  showPropertyCard: [
    ["fadeIn", "scaleUp"],
  ],
  hidePropertyCard: [
    ["fadeOut", "scaleDown"],
  ],
});

type Props = {
  apiKey: string;
};

type State = {
  trackingInitialized: boolean;
  selectedProperty: PropertyDetails | null;
  properties: PropertySummary[];
  showPropertyDetails: boolean;
  currentLocation: GeoLocation | null;
  showFilters: boolean;
  filters: {
    showForSaleOnly: boolean;
    showForRentOnly: boolean;
    minPrice: number | null;
    maxPrice: number | null;
    minBedrooms: number | null;
    maxBedrooms: number | null;
    propertyTypes: string[];
  };
};

/**
 * AR Scene component for Real Estate AR demo
 */
class RealEstateARScene extends React.Component<Props, State> {
  private realEstateService = ViroRealEstateService.getInstance();
  private realEstateARRef = React.createRef<ViroRealEstateAR>();

  constructor(props: Props) {
    super(props);
    this.state = {
      trackingInitialized: false,
      selectedProperty: null,
      properties: [],
      showPropertyDetails: false,
      currentLocation: null,
      showFilters: false,
      filters: {
        showForSaleOnly: true,
        showForRentOnly: false,
        minPrice: null,
        maxPrice: null,
        minBedrooms: null,
        maxBedrooms: null,
        propertyTypes: ["Single Family", "Condo", "Townhouse"],
      },
    };
  }

  componentDidMount() {
    // Initialize the Real Estate service
    this.realEstateService.initialize({
      apiKey: this.props.apiKey,
    });
  }

  _onInitialized = (state: string, reason: string) => {
    if (state === ViroConstants.TRACKING_NORMAL) {
      this.setState({
        trackingInitialized: true,
      });
    } else if (state === ViroConstants.TRACKING_NONE) {
      this.setState({
        trackingInitialized: false,
      });
    }
  };

  _onPropertiesDetected = (properties: PropertySummary[]) => {
    this.setState({
      properties,
    });
  };

  _onPropertySelected = (property: PropertyDetails) => {
    this.setState({
      selectedProperty: property,
      showPropertyDetails: true,
    });
  };

  _onLocationUpdate = (location: GeoLocation) => {
    this.setState({
      currentLocation: location,
    });
  };

  _toggleFilters = () => {
    this.setState({
      showFilters: !this.state.showFilters,
    });
  };

  _updateFilters = (filters: Partial<State["filters"]>) => {
    this.setState({
      filters: {
        ...this.state.filters,
        ...filters,
      },
    });
  };

  _resetFilters = () => {
    this.setState({
      filters: {
        showForSaleOnly: true,
        showForRentOnly: false,
        minPrice: null,
        maxPrice: null,
        minBedrooms: null,
        maxBedrooms: null,
        propertyTypes: ["Single Family", "Condo", "Townhouse"],
      },
    });
  };

  _renderFiltersModal() {
    const { showFilters, filters } = this.state;
    
    if (!showFilters) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilters}
        onRequestClose={this._toggleFilters}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Property Filters</Text>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Listing Type</Text>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.showForSaleOnly && styles.filterButtonSelected,
                  ]}
                  onPress={() => this._updateFilters({
                    showForSaleOnly: true,
                    showForRentOnly: false,
                  })}
                >
                  <Text style={styles.filterButtonText}>For Sale</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.showForRentOnly && styles.filterButtonSelected,
                  ]}
                  onPress={() => this._updateFilters({
                    showForSaleOnly: false,
                    showForRentOnly: true,
                  })}
                >
                  <Text style={styles.filterButtonText}>For Rent</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    !filters.showForSaleOnly && !filters.showForRentOnly && styles.filterButtonSelected,
                  ]}
                  onPress={() => this._updateFilters({
                    showForSaleOnly: false,
                    showForRentOnly: false,
                  })}
                >
                  <Text style={styles.filterButtonText}>All</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => this._updateFilters({
                    minPrice: 0,
                    maxPrice: 500000,
                  })}
                >
                  <Text style={styles.filterButtonText}>Under $500k</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => this._updateFilters({
                    minPrice: 500000,
                    maxPrice: 1000000,
                  })}
                >
                  <Text style={styles.filterButtonText}>$500k-$1M</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => this._updateFilters({
                    minPrice: 1000000,
                    maxPrice: null,
                  })}
                >
                  <Text style={styles.filterButtonText}>$1M+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Bedrooms</Text>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => this._updateFilters({
                    minBedrooms: 1,
                    maxBedrooms: 2,
                  })}
                >
                  <Text style={styles.filterButtonText}>1-2</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => this._updateFilters({
                    minBedrooms: 3,
                    maxBedrooms: 4,
                  })}
                >
                  <Text style={styles.filterButtonText}>3-4</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => this._updateFilters({
                    minBedrooms: 5,
                    maxBedrooms: null,
                  })}
                >
                  <Text style={styles.filterButtonText}>5+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Property Type</Text>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.propertyTypes.includes("Single Family") && styles.filterButtonSelected,
                  ]}
                  onPress={() => {
                    const newTypes = [...filters.propertyTypes];
                    const index = newTypes.indexOf("Single Family");
                    if (index === -1) {
                      newTypes.push("Single Family");
                    } else {
                      newTypes.splice(index, 1);
                    }
                    this._updateFilters({ propertyTypes: newTypes });
                  }}
                >
                  <Text style={styles.filterButtonText}>Single Family</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.propertyTypes.includes("Condo") && styles.filterButtonSelected,
                  ]}
                  onPress={() => {
                    const newTypes = [...filters.propertyTypes];
                    const index = newTypes.indexOf("Condo");
                    if (index === -1) {
                      newTypes.push("Condo");
                    } else {
                      newTypes.splice(index, 1);
                    }
                    this._updateFilters({ propertyTypes: newTypes });
                  }}
                >
                  <Text style={styles.filterButtonText}>Condo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.propertyTypes.includes("Townhouse") && styles.filterButtonSelected,
                  ]}
                  onPress={() => {
                    const newTypes = [...filters.propertyTypes];
                    const index = newTypes.indexOf("Townhouse");
                    if (index === -1) {
                      newTypes.push("Townhouse");
                    } else {
                      newTypes.splice(index, 1);
                    }
                    this._updateFilters({ propertyTypes: newTypes });
                  }}
                >
                  <Text style={styles.filterButtonText}>Townhouse</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={this._resetFilters}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.applyButton]}
                onPress={this._toggleFilters}
              >
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  _renderPropertyDetails() {
    const { selectedProperty, showPropertyDetails } = this.state;
    
    if (!selectedProperty || !showPropertyDetails) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPropertyDetails}
        onRequestClose={() => this.setState({ showPropertyDetails: false })}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.propertyDetailsScrollView}>
            <View style={styles.propertyDetailsContent}>
              <Text style={styles.propertyDetailsTitle}>{selectedProperty.address.formattedAddress}</Text>
              
              <Text style={styles.propertyDetailsPrice}>{selectedProperty.price}</Text>
              
              <View style={styles.propertyDetailsImageContainer}>
                {selectedProperty.images.map((image, index) => (
                  <Image
                    key={`image-${index}`}
                    source={{ uri: image }}
                    style={styles.propertyDetailsImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
              
              <View style={styles.propertyDetailsInfoRow}>
                <View style={styles.propertyDetailsInfoItem}>
                  <Text style={styles.propertyDetailsInfoValue}>{selectedProperty.bedrooms}</Text>
                  <Text style={styles.propertyDetailsInfoLabel}>Beds</Text>
                </View>
                
                <View style={styles.propertyDetailsInfoItem}>
                  <Text style={styles.propertyDetailsInfoValue}>{selectedProperty.bathrooms}</Text>
                  <Text style={styles.propertyDetailsInfoLabel}>Baths</Text>
                </View>
                
                <View style={styles.propertyDetailsInfoItem}>
                  <Text style={styles.propertyDetailsInfoValue}>{selectedProperty.squareFeet}</Text>
                  <Text style={styles.propertyDetailsInfoLabel}>Sq Ft</Text>
                </View>
                
                <View style={styles.propertyDetailsInfoItem}>
                  <Text style={styles.propertyDetailsInfoValue}>{selectedProperty.yearBuilt}</Text>
                  <Text style={styles.propertyDetailsInfoLabel}>Year Built</Text>
                </View>
              </View>
              
              <Text style={styles.propertyDetailsSectionTitle}>Description</Text>
              <Text style={styles.propertyDetailsDescription}>{selectedProperty.description}</Text>
              
              <Text style={styles.propertyDetailsSectionTitle}>Features</Text>
              <View style={styles.propertyDetailsFeatures}>
                {selectedProperty.features.map((feature, index) => (
                  <View key={`feature-${index}`} style={styles.propertyDetailsFeatureItem}>
                    <Text style={styles.propertyDetailsFeatureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              <Text style={styles.propertyDetailsSectionTitle}>Schools</Text>
              {selectedProperty.schools.map((school, index) => (
                <View key={`school-${index}`} style={styles.propertyDetailsSchoolItem}>
                  <Text style={styles.propertyDetailsSchoolName}>{school.name}</Text>
                  <Text style={styles.propertyDetailsSchoolInfo}>
                    {school.type.charAt(0).toUpperCase() + school.type.slice(1)} | Grades: {school.grades} | Rating: {school.rating}/10
                  </Text>
                  <Text style={styles.propertyDetailsSchoolDistance}>{school.distance} miles away</Text>
                </View>
              ))}
              
              <Text style={styles.propertyDetailsSectionTitle}>Nearby Amenities</Text>
              <View style={styles.propertyDetailsAmenities}>
                {selectedProperty.nearbyAmenities.map((amenity, index) => (
                  <View key={`amenity-${index}`} style={styles.propertyDetailsAmenityItem}>
                    <Text style={styles.propertyDetailsAmenityName}>{amenity.name}</Text>
                    <Text style={styles.propertyDetailsAmenityInfo}>
                      {amenity.type.charAt(0).toUpperCase() + amenity.type.slice(1)} | {amenity.distance} miles away
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.propertyDetailsContactContainer}>
                <Text style={styles.propertyDetailsContactTitle}>Contact Information</Text>
                {selectedProperty.contactInfo && (
                  <>
                    <Text style={styles.propertyDetailsContactName}>{selectedProperty.contactInfo.agentName}</Text>
                    <Text style={styles.propertyDetailsContactInfo}>{selectedProperty.contactInfo.brokerageName}</Text>
                    <Text style={styles.propertyDetailsContactInfo}>{selectedProperty.contactInfo.agentPhone}</Text>
                    <Text style={styles.propertyDetailsContactInfo}>{selectedProperty.contactInfo.agentEmail}</Text>
                  </>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => this.setState({ showPropertyDetails: false })}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }

  _renderControlButtons() {
    return (
      <View style={styles.controlButtonsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={this._toggleFilters}
        >
          <Text style={styles.controlButtonText}>Filters</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (this.realEstateARRef.current) {
              this.realEstateARRef.current._updateProperties();
            }
          }}
        >
          <Text style={styles.controlButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderStatusBar() {
    const { properties, currentLocation } = this.state;
    
    return (
      <View style={styles.statusBarContainer}>
        <Text style={styles.statusBarText}>
          {properties.length} properties found
          {currentLocation && ` | Lat: ${currentLocation.latitude.toFixed(4)}, Lng: ${currentLocation.longitude.toFixed(4)}`}
        </Text>
      </View>
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
    const { filters } = this.state;
    
    return (
      <View style={styles.container}>
        <ViroARScene onTrackingUpdated={this._onInitialized} onClick={this._onSceneTap}>
          {/* Show loading text if tracking not initialized */}
          {!this.state.trackingInitialized && (
            <ViroText
              text="Initializing AR..."
              position={[0, 0, -1]}
              style={{
                fontSize: 20,
                color: "#ffffff",
                textAlignVertical: "center",
                textAlign: "center",
              }}
            />
          )}
          
          {/* Real Estate AR component */}
          <ViroRealEstateAR
            ref={this.realEstateARRef}
            apiConfig={{
              apiKey: this.props.apiKey,
            }}
            enabled={this.state.trackingInitialized}
            maxDistance={1000}
            maxProperties={20}
            showIndicators={true}
            showLabels={true}
            indicatorColor="#FF5722"
            indicatorSize={0.2}
            indicatorAnimation="pulse"
            onPropertiesDetected={this._onPropertiesDetected}
            onPropertySelected={this._onPropertySelected}
            updateInterval={30000}
            autoUpdateEnabled={true}
            showForSaleOnly={filters.showForSaleOnly}
            showForRentOnly={filters.showForRentOnly}
            minPrice={filters.minPrice || undefined}
            maxPrice={filters.maxPrice || undefined}
            minBedrooms={filters.minBedrooms || undefined}
            maxBedrooms={filters.maxBedrooms || undefined}
            propertyTypes={filters.propertyTypes}
          />
        </ViroARScene>
        
        {this._renderControlButtons()}
        {this._renderStatusBar()}
        {this._renderFiltersModal()}
        {this._renderPropertyDetails()}
      </View>
    );
  }
}

/**
 * Main component for the Real Estate AR demo
 */
export class ViroRealEstateARDemo extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <ViroARSceneNavigator
          initialScene={{
            scene: RealEstateARScene,
          }}
          viroAppProps={this.props}
          autofocus={true}
          style={styles.arView}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  controlButtonsContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
  },
  controlButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  statusBarText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 15,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterButton: {
    backgroundColor: '#EEEEEE',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    minWidth: '30%',
  },
  filterButtonSelected: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: '45%',
  },
  resetButton: {
    backgroundColor: '#F44336',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  propertyDetailsScrollView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
  },
  propertyDetailsContent: {
    padding: 20,
  },
  propertyDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  propertyDetailsPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 15,
  },
  propertyDetailsImageContainer: {
    marginBottom: 15,
  },
  propertyDetailsImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  propertyDetailsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 10,
    padding: 10,
  },
  propertyDetailsInfoItem: {
    alignItems: 'center',
  },
  propertyDetailsInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  propertyDetailsInfoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  propertyDetailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },
  propertyDetailsDescription: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 15,
    lineHeight: 20,
  },
  propertyDetailsFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  propertyDetailsFeatureItem: {
    backgroundColor: '#EEEEEE',
    padding: 8,
    borderRadius: 5,
    margin: 5,
  },
  propertyDetailsFeatureText: {
    fontSize: 12,
  },
  propertyDetailsSchoolItem: {
    marginBottom: 10,
  },
  propertyDetailsSchoolName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  propertyDetailsSchoolInfo: {
    fontSize: 12,
    color: '#666666',
  },
  propertyDetailsSchoolDistance: {
    fontSize: 12,
    color: '#999999',
  },
  propertyDetailsAmenities: {
    marginBottom: 15,
  },
  propertyDetailsAmenityItem: {
    marginBottom: 10,
  },
  propertyDetailsAmenityName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  propertyDetailsAmenityInfo: {
    fontSize: 12,
    color: '#666666',
  },
  propertyDetailsContactContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  propertyDetailsContactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  propertyDetailsContactName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  propertyDetailsContactInfo: {
    fontSize: 14,
    color: '#666666',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});