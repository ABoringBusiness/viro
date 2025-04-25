/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroShoppingARDemo
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
import { ViroShoppingAR } from "./ViroShoppingAR";
import { 
  ViroShoppingService, 
  DetectedProduct, 
  ProductSearchResult,
  PriceHistory,
  BuyingOptions
} from "./ViroShoppingService";

// Register materials for the demo
ViroMaterials.createMaterials({
  productCard: {
    diffuseColor: "#FFFFFF",
    diffuseTexture: require("../Resources/card_texture.jpg"),
  },
  captureButton: {
    diffuseColor: "#2196F3",
  },
  settingsButton: {
    diffuseColor: "#4CAF50",
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
  showProductCard: [
    ["fadeIn", "scaleUp"],
  ],
  hideProductCard: [
    ["fadeOut", "scaleDown"],
  ],
});

type Props = {
  apiKey: string;
  apiUrl?: string;
};

type State = {
  trackingInitialized: boolean;
  selectedProduct: DetectedProduct | null;
  searchResults: ProductSearchResult[];
  priceHistory: PriceHistory | null;
  buyingOptions: BuyingOptions | null;
  detectedProducts: DetectedProduct[];
  showProductDetails: boolean;
  showSettings: boolean;
  settings: {
    minConfidence: number;
    maxProducts: number;
    captureInterval: number;
    priceHistoryDays: number;
    priceTrackingEnabled: boolean;
    findSimilarProductsEnabled: boolean;
    findBestDealsEnabled: boolean;
    showBuyingOptionsEnabled: boolean;
    showPriceHistoryEnabled: boolean;
  };
  capturedImageBase64: string | null;
};

/**
 * AR Scene component for Shopping AR demo
 */
class ShoppingARScene extends React.Component<Props, State> {
  private shoppingService = ViroShoppingService.getInstance();
  private shoppingARRef = React.createRef<ViroShoppingAR>();

  constructor(props: Props) {
    super(props);
    this.state = {
      trackingInitialized: false,
      selectedProduct: null,
      searchResults: [],
      priceHistory: null,
      buyingOptions: null,
      detectedProducts: [],
      showProductDetails: false,
      showSettings: false,
      settings: {
        minConfidence: 0.7,
        maxProducts: 5,
        captureInterval: 5000,
        priceHistoryDays: 30,
        priceTrackingEnabled: true,
        findSimilarProductsEnabled: true,
        findBestDealsEnabled: true,
        showBuyingOptionsEnabled: true,
        showPriceHistoryEnabled: true,
      },
      capturedImageBase64: null,
    };
  }

  componentDidMount() {
    // Initialize the Shopping service
    this.shoppingService.initialize({
      apiKey: this.props.apiKey,
      apiUrl: this.props.apiUrl,
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

  _onProductsDetected = (products: DetectedProduct[]) => {
    this.setState({
      detectedProducts: products,
    });
  };

  _onProductSelected = (product: DetectedProduct, searchResults: ProductSearchResult[]) => {
    this.setState({
      selectedProduct: product,
      searchResults,
      showProductDetails: true,
    });
  };

  _onImageCaptured = (imageBase64: string) => {
    this.setState({
      capturedImageBase64: imageBase64,
    });
  };

  _captureImage = () => {
    if (this.shoppingARRef.current) {
      // Manually trigger image capture
      this.shoppingARRef.current._captureAndAnalyzeImage();
    }
  };

  _toggleSettings = () => {
    this.setState({
      showSettings: !this.state.showSettings,
    });
  };

  _updateSettings = (settings: Partial<State["settings"]>) => {
    this.setState({
      settings: {
        ...this.state.settings,
        ...settings,
      },
    });
  };

  _renderSettingsModal() {
    const { showSettings, settings } = this.state;
    
    if (!showSettings) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettings}
        onRequestClose={this._toggleSettings}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Shopping AR Settings</Text>
            
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Detection Settings</Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Minimum Confidence:</Text>
                <View style={styles.settingSliderContainer}>
                  <Text style={styles.settingValue}>{settings.minConfidence.toFixed(1)}</Text>
                  <Slider
                    style={styles.settingSlider}
                    minimumValue={0.1}
                    maximumValue={1.0}
                    step={0.1}
                    value={settings.minConfidence}
                    onValueChange={(value) => this._updateSettings({ minConfidence: value })}
                    minimumTrackTintColor="#2196F3"
                    maximumTrackTintColor="#CCCCCC"
                  />
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Max Products:</Text>
                <View style={styles.settingSliderContainer}>
                  <Text style={styles.settingValue}>{settings.maxProducts}</Text>
                  <Slider
                    style={styles.settingSlider}
                    minimumValue={1}
                    maximumValue={10}
                    step={1}
                    value={settings.maxProducts}
                    onValueChange={(value) => this._updateSettings({ maxProducts: value })}
                    minimumTrackTintColor="#2196F3"
                    maximumTrackTintColor="#CCCCCC"
                  />
                </View>
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Capture Interval (ms):</Text>
                <View style={styles.settingSliderContainer}>
                  <Text style={styles.settingValue}>{settings.captureInterval}</Text>
                  <Slider
                    style={styles.settingSlider}
                    minimumValue={1000}
                    maximumValue={10000}
                    step={1000}
                    value={settings.captureInterval}
                    onValueChange={(value) => this._updateSettings({ captureInterval: value })}
                    minimumTrackTintColor="#2196F3"
                    maximumTrackTintColor="#CCCCCC"
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Feature Settings</Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Price Tracking:</Text>
                <Switch
                  value={settings.priceTrackingEnabled}
                  onValueChange={(value) => this._updateSettings({ priceTrackingEnabled: value })}
                  trackColor={{ false: "#CCCCCC", true: "#81C784" }}
                  thumbColor={settings.priceTrackingEnabled ? "#4CAF50" : "#F5F5F5"}
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Find Similar Products:</Text>
                <Switch
                  value={settings.findSimilarProductsEnabled}
                  onValueChange={(value) => this._updateSettings({ findSimilarProductsEnabled: value })}
                  trackColor={{ false: "#CCCCCC", true: "#81C784" }}
                  thumbColor={settings.findSimilarProductsEnabled ? "#4CAF50" : "#F5F5F5"}
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Find Best Deals:</Text>
                <Switch
                  value={settings.findBestDealsEnabled}
                  onValueChange={(value) => this._updateSettings({ findBestDealsEnabled: value })}
                  trackColor={{ false: "#CCCCCC", true: "#81C784" }}
                  thumbColor={settings.findBestDealsEnabled ? "#4CAF50" : "#F5F5F5"}
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Show Buying Options:</Text>
                <Switch
                  value={settings.showBuyingOptionsEnabled}
                  onValueChange={(value) => this._updateSettings({ showBuyingOptionsEnabled: value })}
                  trackColor={{ false: "#CCCCCC", true: "#81C784" }}
                  thumbColor={settings.showBuyingOptionsEnabled ? "#4CAF50" : "#F5F5F5"}
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Show Price History:</Text>
                <Switch
                  value={settings.showPriceHistoryEnabled}
                  onValueChange={(value) => this._updateSettings({ showPriceHistoryEnabled: value })}
                  trackColor={{ false: "#CCCCCC", true: "#81C784" }}
                  thumbColor={settings.showPriceHistoryEnabled ? "#4CAF50" : "#F5F5F5"}
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Price History Days:</Text>
                <View style={styles.settingSliderContainer}>
                  <Text style={styles.settingValue}>{settings.priceHistoryDays}</Text>
                  <Slider
                    style={styles.settingSlider}
                    minimumValue={7}
                    maximumValue={90}
                    step={7}
                    value={settings.priceHistoryDays}
                    onValueChange={(value) => this._updateSettings({ priceHistoryDays: value })}
                    minimumTrackTintColor="#2196F3"
                    maximumTrackTintColor="#CCCCCC"
                  />
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={this._toggleSettings}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  _renderProductDetails() {
    const { selectedProduct, searchResults, showProductDetails } = this.state;
    
    if (!selectedProduct || !showProductDetails) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProductDetails}
        onRequestClose={() => this.setState({ showProductDetails: false })}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.productDetailsScrollView}>
            <View style={styles.productDetailsContent}>
              <Text style={styles.productDetailsTitle}>{selectedProduct.name}</Text>
              
              {selectedProduct.attributes.brand && (
                <Text style={styles.productDetailsBrand}>{selectedProduct.attributes.brand}</Text>
              )}
              
              {searchResults.length > 0 && (
                <>
                  <Text style={styles.productDetailsSectionTitle}>Shopping Results</Text>
                  {searchResults.map((result, index) => (
                    <View key={`result-${index}`} style={styles.productDetailsResultItem}>
                      <Text style={styles.productDetailsResultName}>{result.name}</Text>
                      <Text style={styles.productDetailsResultPrice}>
                        {result.price} {result.currency} - {result.platform}
                      </Text>
                      <Text style={styles.productDetailsResultRating}>
                        Rating: {result.rating.toFixed(1)} ({result.reviews_count} reviews)
                      </Text>
                      <Text style={styles.productDetailsResultAvailability}>
                        {result.availability} - {result.shipping.is_free ? "Free Shipping" : `Shipping: ${result.shipping.price} ${result.currency}`}
                      </Text>
                      <View style={styles.productDetailsResultButtons}>
                        <TouchableOpacity
                          style={styles.productDetailsResultButton}
                          onPress={() => {
                            // Open product URL in browser
                            Alert.alert("Open URL", `Would open ${result.url} in browser`);
                          }}
                        >
                          <Text style={styles.productDetailsResultButtonText}>View</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.productDetailsResultButton}
                          onPress={() => {
                            // Track price
                            if (this.state.settings.priceTrackingEnabled) {
                              this.shoppingService.trackPrice(result.id, result.platform);
                              Alert.alert("Price Tracking", `Started tracking price for ${result.name}`);
                            }
                          }}
                        >
                          <Text style={styles.productDetailsResultButtonText}>Track Price</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              )}
              
              <View style={styles.productDetailsButtonRow}>
                {this.state.settings.findSimilarProductsEnabled && searchResults.length > 0 && (
                  <TouchableOpacity
                    style={styles.productDetailsButton}
                    onPress={() => {
                      // Find similar products
                      this.shoppingService.findSimilarProducts(
                        searchResults[0].id,
                        searchResults[0].platform
                      ).then(similarProducts => {
                        this.setState({ searchResults: similarProducts });
                      });
                    }}
                  >
                    <Text style={styles.productDetailsButtonText}>Similar Products</Text>
                  </TouchableOpacity>
                )}
                
                {this.state.settings.findBestDealsEnabled && (
                  <TouchableOpacity
                    style={styles.productDetailsButton}
                    onPress={() => {
                      // Find best deal
                      this.shoppingService.findBestDeal(selectedProduct.name)
                        .then(bestDeal => {
                          this.setState({ 
                            searchResults: [bestDeal, ...this.state.searchResults.filter(r => r.id !== bestDeal.id)],
                          });
                        });
                    }}
                  >
                    <Text style={styles.productDetailsButtonText}>Best Deal</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => this.setState({ showProductDetails: false })}
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
          onPress={this._captureImage}
        >
          <Text style={styles.controlButtonText}>Capture</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={this._toggleSettings}
        >
          <Text style={styles.controlButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderStatusBar() {
    const { detectedProducts } = this.state;
    
    return (
      <View style={styles.statusBarContainer}>
        <Text style={styles.statusBarText}>
          {detectedProducts.length} products detected
        </Text>
      </View>
    );
  }

  _onSceneTap = () => {
    if (this.state.showProductDetails) {
      this.setState({
        showProductDetails: false,
      });
    }
  };

  render() {
    const { settings } = this.state;
    
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
          
          {/* Shopping AR component */}
          <ViroShoppingAR
            ref={this.shoppingARRef}
            apiConfig={{
              apiKey: this.props.apiKey,
              apiUrl: this.props.apiUrl,
            }}
            enabled={this.state.trackingInitialized}
            minConfidence={settings.minConfidence}
            maxProducts={settings.maxProducts}
            showIndicators={true}
            showLabels={true}
            indicatorColor="#4CAF50"
            indicatorSize={0.1}
            indicatorAnimation="pulse"
            onProductsDetected={this._onProductsDetected}
            onProductSelected={this._onProductSelected}
            onImageCaptured={this._onImageCaptured}
            captureInterval={settings.captureInterval}
            autoCaptureEnabled={true}
            priceTrackingEnabled={settings.priceTrackingEnabled}
            findSimilarProductsEnabled={settings.findSimilarProductsEnabled}
            findBestDealsEnabled={settings.findBestDealsEnabled}
            showBuyingOptionsEnabled={settings.showBuyingOptionsEnabled}
            showPriceHistoryEnabled={settings.showPriceHistoryEnabled}
            priceHistoryDays={settings.priceHistoryDays}
          />
        </ViroARScene>
        
        {this._renderControlButtons()}
        {this._renderStatusBar()}
        {this._renderSettingsModal()}
        {this._renderProductDetails()}
      </View>
    );
  }
}

/**
 * Main component for the Shopping AR demo
 */
export class ViroShoppingARDemo extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <ViroARSceneNavigator
          initialScene={{
            scene: ShoppingARScene,
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
  settingSection: {
    marginBottom: 20,
  },
  settingSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 14,
    flex: 1,
  },
  settingSliderContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingSlider: {
    flex: 1,
    height: 40,
  },
  settingValue: {
    width: 40,
    textAlign: 'right',
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  productDetailsScrollView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
  },
  productDetailsContent: {
    padding: 20,
  },
  productDetailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDetailsBrand: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 15,
  },
  productDetailsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  productDetailsResultItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  productDetailsResultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDetailsResultPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 5,
  },
  productDetailsResultRating: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  productDetailsResultAvailability: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  productDetailsResultButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  productDetailsResultButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  productDetailsResultButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  productDetailsButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  productDetailsButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  productDetailsButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});