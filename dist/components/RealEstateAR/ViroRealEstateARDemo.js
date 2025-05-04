"use strict";
/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroRealEstateARDemo
 */
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
exports.ViroRealEstateARDemo = void 0;
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const __1 = require("../..");
const ViroRealEstateAR_1 = require("./ViroRealEstateAR");
const ViroRealEstateService_1 = require("./ViroRealEstateService");
// Register materials for the demo
__1.ViroMaterials.createMaterials({
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
__1.ViroAnimations.registerAnimations({
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
/**
 * AR Scene component for Real Estate AR demo
 */
class RealEstateARScene extends React.Component {
    realEstateService = ViroRealEstateService_1.ViroRealEstateService.getInstance();
    realEstateARRef = React.createRef();
    constructor(props) {
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
    _onInitialized = (state, reason) => {
        if (state === __1.ViroConstants.TRACKING_NORMAL) {
            this.setState({
                trackingInitialized: true,
            });
        }
        else if (state === __1.ViroConstants.TRACKING_NONE) {
            this.setState({
                trackingInitialized: false,
            });
        }
    };
    _onPropertiesDetected = (properties) => {
        this.setState({
            properties,
        });
    };
    _onPropertySelected = (property) => {
        this.setState({
            selectedProperty: property,
            showPropertyDetails: true,
        });
    };
    _onLocationUpdate = (location) => {
        this.setState({
            currentLocation: location,
        });
    };
    _toggleFilters = () => {
        this.setState({
            showFilters: !this.state.showFilters,
        });
    };
    _updateFilters = (filters) => {
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
        return (<react_native_1.Modal animationType="slide" transparent={true} visible={showFilters} onRequestClose={this._toggleFilters}>
        <react_native_1.View style={styles.modalContainer}>
          <react_native_1.View style={styles.modalContent}>
            <react_native_1.Text style={styles.modalTitle}>Property Filters</react_native_1.Text>
            
            <react_native_1.View style={styles.filterSection}>
              <react_native_1.Text style={styles.filterSectionTitle}>Listing Type</react_native_1.Text>
              <react_native_1.View style={styles.filterRow}>
                <react_native_1.TouchableOpacity style={[
                styles.filterButton,
                filters.showForSaleOnly && styles.filterButtonSelected,
            ]} onPress={() => this._updateFilters({
                showForSaleOnly: true,
                showForRentOnly: false,
            })}>
                  <react_native_1.Text style={styles.filterButtonText}>For Sale</react_native_1.Text>
                </react_native_1.TouchableOpacity>
                
                <react_native_1.TouchableOpacity style={[
                styles.filterButton,
                filters.showForRentOnly && styles.filterButtonSelected,
            ]} onPress={() => this._updateFilters({
                showForSaleOnly: false,
                showForRentOnly: true,
            })}>
                  <react_native_1.Text style={styles.filterButtonText}>For Rent</react_native_1.Text>
                </react_native_1.TouchableOpacity>
                
                <react_native_1.TouchableOpacity style={[
                styles.filterButton,
                !filters.showForSaleOnly && !filters.showForRentOnly && styles.filterButtonSelected,
            ]} onPress={() => this._updateFilters({
                showForSaleOnly: false,
                showForRentOnly: false,
            })}>
                  <react_native_1.Text style={styles.filterButtonText}>All</react_native_1.Text>
                </react_native_1.TouchableOpacity>
              </react_native_1.View>
            </react_native_1.View>
            
            <react_native_1.View style={styles.filterSection}>
              <react_native_1.Text style={styles.filterSectionTitle}>Price Range</react_native_1.Text>
              <react_native_1.View style={styles.filterRow}>
                <react_native_1.TouchableOpacity style={styles.filterButton} onPress={() => this._updateFilters({
                minPrice: 0,
                maxPrice: 500000,
            })}>
                  <react_native_1.Text style={styles.filterButtonText}>Under $500k</react_native_1.Text>
                </react_native_1.TouchableOpacity>
                
                <react_native_1.TouchableOpacity style={styles.filterButton} onPress={() => this._updateFilters({
                minPrice: 500000,
                maxPrice: 1000000,
            })}>
                  <react_native_1.Text style={styles.filterButtonText}>$500k-$1M</react_native_1.Text>
                </react_native_1.TouchableOpacity>
                
                <react_native_1.TouchableOpacity style={styles.filterButton} onPress={() => this._updateFilters({
                minPrice: 1000000,
                maxPrice: null,
            })}>
                  <react_native_1.Text style={styles.filterButtonText}>$1M+</react_native_1.Text>
                </react_native_1.TouchableOpacity>
              </react_native_1.View>
            </react_native_1.View>
            
            <react_native_1.View style={styles.filterSection}>
              <react_native_1.Text style={styles.filterSectionTitle}>Bedrooms</react_native_1.Text>
              <react_native_1.View style={styles.filterRow}>
                <react_native_1.TouchableOpacity style={styles.filterButton} onPress={() => this._updateFilters({
                minBedrooms: 1,
                maxBedrooms: 2,
            })}>
                  <react_native_1.Text style={styles.filterButtonText}>1-2</react_native_1.Text>
                </react_native_1.TouchableOpacity>
                
                <react_native_1.TouchableOpacity style={styles.filterButton} onPress={() => this._updateFilters({
                minBedrooms: 3,
                maxBedrooms: 4,
            })}>
                  <react_native_1.Text style={styles.filterButtonText}>3-4</react_native_1.Text>
                </react_native_1.TouchableOpacity>
                
                <react_native_1.TouchableOpacity style={styles.filterButton} onPress={() => this._updateFilters({
                minBedrooms: 5,
                maxBedrooms: null,
            })}>
                  <react_native_1.Text style={styles.filterButtonText}>5+</react_native_1.Text>
                </react_native_1.TouchableOpacity>
              </react_native_1.View>
            </react_native_1.View>
            
            <react_native_1.View style={styles.filterSection}>
              <react_native_1.Text style={styles.filterSectionTitle}>Property Type</react_native_1.Text>
              <react_native_1.View style={styles.filterRow}>
                <react_native_1.TouchableOpacity style={[
                styles.filterButton,
                filters.propertyTypes.includes("Single Family") && styles.filterButtonSelected,
            ]} onPress={() => {
                const newTypes = [...filters.propertyTypes];
                const index = newTypes.indexOf("Single Family");
                if (index === -1) {
                    newTypes.push("Single Family");
                }
                else {
                    newTypes.splice(index, 1);
                }
                this._updateFilters({ propertyTypes: newTypes });
            }}>
                  <react_native_1.Text style={styles.filterButtonText}>Single Family</react_native_1.Text>
                </react_native_1.TouchableOpacity>
                
                <react_native_1.TouchableOpacity style={[
                styles.filterButton,
                filters.propertyTypes.includes("Condo") && styles.filterButtonSelected,
            ]} onPress={() => {
                const newTypes = [...filters.propertyTypes];
                const index = newTypes.indexOf("Condo");
                if (index === -1) {
                    newTypes.push("Condo");
                }
                else {
                    newTypes.splice(index, 1);
                }
                this._updateFilters({ propertyTypes: newTypes });
            }}>
                  <react_native_1.Text style={styles.filterButtonText}>Condo</react_native_1.Text>
                </react_native_1.TouchableOpacity>
                
                <react_native_1.TouchableOpacity style={[
                styles.filterButton,
                filters.propertyTypes.includes("Townhouse") && styles.filterButtonSelected,
            ]} onPress={() => {
                const newTypes = [...filters.propertyTypes];
                const index = newTypes.indexOf("Townhouse");
                if (index === -1) {
                    newTypes.push("Townhouse");
                }
                else {
                    newTypes.splice(index, 1);
                }
                this._updateFilters({ propertyTypes: newTypes });
            }}>
                  <react_native_1.Text style={styles.filterButtonText}>Townhouse</react_native_1.Text>
                </react_native_1.TouchableOpacity>
              </react_native_1.View>
            </react_native_1.View>
            
            <react_native_1.View style={styles.buttonRow}>
              <react_native_1.TouchableOpacity style={[styles.button, styles.resetButton]} onPress={this._resetFilters}>
                <react_native_1.Text style={styles.buttonText}>Reset</react_native_1.Text>
              </react_native_1.TouchableOpacity>
              
              <react_native_1.TouchableOpacity style={[styles.button, styles.applyButton]} onPress={this._toggleFilters}>
                <react_native_1.Text style={styles.buttonText}>Apply</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.Modal>);
    }
    _renderPropertyDetails() {
        const { selectedProperty, showPropertyDetails } = this.state;
        if (!selectedProperty || !showPropertyDetails) {
            return null;
        }
        return (<react_native_1.Modal animationType="slide" transparent={true} visible={showPropertyDetails} onRequestClose={() => this.setState({ showPropertyDetails: false })}>
        <react_native_1.View style={styles.modalContainer}>
          <react_native_1.ScrollView style={styles.propertyDetailsScrollView}>
            <react_native_1.View style={styles.propertyDetailsContent}>
              <react_native_1.Text style={styles.propertyDetailsTitle}>{selectedProperty.address.formattedAddress}</react_native_1.Text>
              
              <react_native_1.Text style={styles.propertyDetailsPrice}>{selectedProperty.price}</react_native_1.Text>
              
              <react_native_1.View style={styles.propertyDetailsImageContainer}>
                {selectedProperty.images.map((image, index) => (<Image key={`image-${index}`} source={{ uri: image }} style={styles.propertyDetailsImage} resizeMode="cover"/>))}
              </react_native_1.View>
              
              <react_native_1.View style={styles.propertyDetailsInfoRow}>
                <react_native_1.View style={styles.propertyDetailsInfoItem}>
                  <react_native_1.Text style={styles.propertyDetailsInfoValue}>{selectedProperty.bedrooms}</react_native_1.Text>
                  <react_native_1.Text style={styles.propertyDetailsInfoLabel}>Beds</react_native_1.Text>
                </react_native_1.View>
                
                <react_native_1.View style={styles.propertyDetailsInfoItem}>
                  <react_native_1.Text style={styles.propertyDetailsInfoValue}>{selectedProperty.bathrooms}</react_native_1.Text>
                  <react_native_1.Text style={styles.propertyDetailsInfoLabel}>Baths</react_native_1.Text>
                </react_native_1.View>
                
                <react_native_1.View style={styles.propertyDetailsInfoItem}>
                  <react_native_1.Text style={styles.propertyDetailsInfoValue}>{selectedProperty.squareFeet}</react_native_1.Text>
                  <react_native_1.Text style={styles.propertyDetailsInfoLabel}>Sq Ft</react_native_1.Text>
                </react_native_1.View>
                
                <react_native_1.View style={styles.propertyDetailsInfoItem}>
                  <react_native_1.Text style={styles.propertyDetailsInfoValue}>{selectedProperty.yearBuilt}</react_native_1.Text>
                  <react_native_1.Text style={styles.propertyDetailsInfoLabel}>Year Built</react_native_1.Text>
                </react_native_1.View>
              </react_native_1.View>
              
              <react_native_1.Text style={styles.propertyDetailsSectionTitle}>Description</react_native_1.Text>
              <react_native_1.Text style={styles.propertyDetailsDescription}>{selectedProperty.description}</react_native_1.Text>
              
              <react_native_1.Text style={styles.propertyDetailsSectionTitle}>Features</react_native_1.Text>
              <react_native_1.View style={styles.propertyDetailsFeatures}>
                {selectedProperty.features.map((feature, index) => (<react_native_1.View key={`feature-${index}`} style={styles.propertyDetailsFeatureItem}>
                    <react_native_1.Text style={styles.propertyDetailsFeatureText}>{feature}</react_native_1.Text>
                  </react_native_1.View>))}
              </react_native_1.View>
              
              <react_native_1.Text style={styles.propertyDetailsSectionTitle}>Schools</react_native_1.Text>
              {selectedProperty.schools.map((school, index) => (<react_native_1.View key={`school-${index}`} style={styles.propertyDetailsSchoolItem}>
                  <react_native_1.Text style={styles.propertyDetailsSchoolName}>{school.name}</react_native_1.Text>
                  <react_native_1.Text style={styles.propertyDetailsSchoolInfo}>
                    {school.type.charAt(0).toUpperCase() + school.type.slice(1)} | Grades: {school.grades} | Rating: {school.rating}/10
                  </react_native_1.Text>
                  <react_native_1.Text style={styles.propertyDetailsSchoolDistance}>{school.distance} miles away</react_native_1.Text>
                </react_native_1.View>))}
              
              <react_native_1.Text style={styles.propertyDetailsSectionTitle}>Nearby Amenities</react_native_1.Text>
              <react_native_1.View style={styles.propertyDetailsAmenities}>
                {selectedProperty.nearbyAmenities.map((amenity, index) => (<react_native_1.View key={`amenity-${index}`} style={styles.propertyDetailsAmenityItem}>
                    <react_native_1.Text style={styles.propertyDetailsAmenityName}>{amenity.name}</react_native_1.Text>
                    <react_native_1.Text style={styles.propertyDetailsAmenityInfo}>
                      {amenity.type.charAt(0).toUpperCase() + amenity.type.slice(1)} | {amenity.distance} miles away
                    </react_native_1.Text>
                  </react_native_1.View>))}
              </react_native_1.View>
              
              <react_native_1.View style={styles.propertyDetailsContactContainer}>
                <react_native_1.Text style={styles.propertyDetailsContactTitle}>Contact Information</react_native_1.Text>
                {selectedProperty.contactInfo && (<>
                    <react_native_1.Text style={styles.propertyDetailsContactName}>{selectedProperty.contactInfo.agentName}</react_native_1.Text>
                    <react_native_1.Text style={styles.propertyDetailsContactInfo}>{selectedProperty.contactInfo.brokerageName}</react_native_1.Text>
                    <react_native_1.Text style={styles.propertyDetailsContactInfo}>{selectedProperty.contactInfo.agentPhone}</react_native_1.Text>
                    <react_native_1.Text style={styles.propertyDetailsContactInfo}>{selectedProperty.contactInfo.agentEmail}</react_native_1.Text>
                  </>)}
              </react_native_1.View>
              
              <react_native_1.TouchableOpacity style={styles.closeButton} onPress={() => this.setState({ showPropertyDetails: false })}>
                <react_native_1.Text style={styles.closeButtonText}>Close</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>
          </react_native_1.ScrollView>
        </react_native_1.View>
      </react_native_1.Modal>);
    }
    _renderControlButtons() {
        return (<react_native_1.View style={styles.controlButtonsContainer}>
        <react_native_1.TouchableOpacity style={styles.controlButton} onPress={this._toggleFilters}>
          <react_native_1.Text style={styles.controlButtonText}>Filters</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        
        <react_native_1.TouchableOpacity style={styles.controlButton} onPress={() => {
                if (this.realEstateARRef.current) {
                    this.realEstateARRef.current._updateProperties();
                }
            }}>
          <react_native_1.Text style={styles.controlButtonText}>Refresh</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>);
    }
    _renderStatusBar() {
        const { properties, currentLocation } = this.state;
        return (<react_native_1.View style={styles.statusBarContainer}>
        <react_native_1.Text style={styles.statusBarText}>
          {properties.length} properties found
          {currentLocation && ` | Lat: ${currentLocation.latitude.toFixed(4)}, Lng: ${currentLocation.longitude.toFixed(4)}`}
        </react_native_1.Text>
      </react_native_1.View>);
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
        return (<react_native_1.View style={styles.container}>
        <__1.ViroARScene onTrackingUpdated={this._onInitialized} onClick={this._onSceneTap}>
          {/* Show loading text if tracking not initialized */}
          {!this.state.trackingInitialized && (<__1.ViroText text="Initializing AR..." position={[0, 0, -1]} style={{
                    fontSize: 20,
                    color: "#ffffff",
                    textAlignVertical: "center",
                    textAlign: "center",
                }}/>)}
          
          {/* Real Estate AR component */}
          <ViroRealEstateAR_1.ViroRealEstateAR ref={this.realEstateARRef} apiConfig={{
                apiKey: this.props.apiKey,
            }} enabled={this.state.trackingInitialized} maxDistance={1000} maxProperties={20} showIndicators={true} showLabels={true} indicatorColor="#FF5722" indicatorSize={0.2} indicatorAnimation="pulse" onPropertiesDetected={this._onPropertiesDetected} onPropertySelected={this._onPropertySelected} updateInterval={30000} autoUpdateEnabled={true} showForSaleOnly={filters.showForSaleOnly} showForRentOnly={filters.showForRentOnly} minPrice={filters.minPrice || undefined} maxPrice={filters.maxPrice || undefined} minBedrooms={filters.minBedrooms || undefined} maxBedrooms={filters.maxBedrooms || undefined} propertyTypes={filters.propertyTypes}/>
        </__1.ViroARScene>
        
        {this._renderControlButtons()}
        {this._renderStatusBar()}
        {this._renderFiltersModal()}
        {this._renderPropertyDetails()}
      </react_native_1.View>);
    }
}
/**
 * Main component for the Real Estate AR demo
 */
class ViroRealEstateARDemo extends React.Component {
    render() {
        return (<react_native_1.View style={styles.container}>
        <__1.ViroARSceneNavigator initialScene={{
                scene: RealEstateARScene,
            }} viroAppProps={this.props} autofocus={true} style={styles.arView}/>
      </react_native_1.View>);
    }
}
exports.ViroRealEstateARDemo = ViroRealEstateARDemo;
const styles = react_native_1.StyleSheet.create({
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
