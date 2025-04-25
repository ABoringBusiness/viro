/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroPriceTrackerDemo
 */

import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert, Modal, ScrollView, TextInput, Switch } from "react-native";
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
import { ViroPriceTracker } from "./ViroPriceTracker";
import { 
  ViroPriceTrackerService, 
  Product, 
  PriceAlert,
  PriceHistory,
  PriceComparisonResult,
  ScanResult
} from "./ViroPriceTrackerService";

// Register materials for the demo
ViroMaterials.createMaterials({
  productCard: {
    diffuseColor: "#FFFFFF",
    diffuseTexture: require("../Resources/card_texture.jpg"),
  },
  scanButton: {
    diffuseColor: "#2196F3",
  },
  alertButton: {
    diffuseColor: "#FFC107",
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
  notificationEmail?: string;
  notificationPhone?: string;
  enablePushNotifications?: boolean;
};

type State = {
  trackingInitialized: boolean;
  scannedProducts: Product[];
  trackedProducts: Product[];
  priceAlerts: PriceAlert[];
  selectedProduct: Product | null;
  priceHistory: PriceHistory | null;
  priceComparison: PriceComparisonResult | null;
  showProductDetails: boolean;
  showScanModal: boolean;
  showAlertModal: boolean;
  showTrackedProductsModal: boolean;
  showAlertsModal: boolean;
  barcodeInput: string;
  targetPriceInput: string;
  notifyOnPriceDecrease: boolean;
  notifyOnPriceIncrease: boolean;
  notifyOnPercentageChange: string;
  notifyEmail: string;
  notifyPhone: string;
  notifyPush: boolean;
};

/**
 * AR Scene component for Price Tracker demo
 */
class PriceTrackerARScene extends React.Component<Props, State> {
  private priceTrackerService = ViroPriceTrackerService.getInstance();
  private priceTrackerRef = React.createRef<ViroPriceTracker>();

  constructor(props: Props) {
    super(props);
    this.state = {
      trackingInitialized: false,
      scannedProducts: [],
      trackedProducts: [],
      priceAlerts: [],
      selectedProduct: null,
      priceHistory: null,
      priceComparison: null,
      showProductDetails: false,
      showScanModal: false,
      showAlertModal: false,
      showTrackedProductsModal: false,
      showAlertsModal: false,
      barcodeInput: "",
      targetPriceInput: "",
      notifyOnPriceDecrease: true,
      notifyOnPriceIncrease: false,
      notifyOnPercentageChange: "5",
      notifyEmail: props.notificationEmail || "",
      notifyPhone: props.notificationPhone || "",
      notifyPush: props.enablePushNotifications || false,
    };
  }

  componentDidMount() {
    // Initialize the Price Tracker service
    this.priceTrackerService.initialize({
      notificationEmail: this.props.notificationEmail,
      notificationPhone: this.props.notificationPhone,
      enablePushNotifications: this.props.enablePushNotifications,
    });

    // Load tracked products and price alerts
    this._loadTrackedProducts();
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

  _loadTrackedProducts = async () => {
    try {
      const trackedProducts = await this.priceTrackerService.getTrackedProducts();
      const priceAlerts = await this.priceTrackerService.getAllPriceAlerts();
      
      this.setState({
        trackedProducts,
        priceAlerts,
      });
    } catch (error) {
      console.error("Failed to load tracked products:", error);
      Alert.alert("Error", "Failed to load tracked products");
    }
  };

  _onBarcodeScanned = (result: ScanResult) => {
    if (result.product) {
      this.setState(prevState => ({
        scannedProducts: [...prevState.scannedProducts, result.product!],
      }));
      
      Alert.alert(
        "Product Scanned",
        `Scanned ${result.product.name}. Would you like to track this product?`,
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => this._trackProduct(result.product!),
          },
        ]
      );
    }
  };

  _onProductTracked = (product: Product) => {
    Alert.alert(
      "Product Tracked",
      `Now tracking ${product.name}. Would you like to set a price alert?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => this._showAlertModal(product),
        },
      ]
    );
  };

  _onPriceAlertCreated = (alert: PriceAlert) => {
    const product = this.state.trackedProducts.find(p => p.id === alert.productId);
    
    if (product) {
      Alert.alert(
        "Price Alert Created",
        `You will be notified when the price of ${product.name} reaches ${alert.targetPrice} ${product.currency}.`
      );
    }
  };

  _onPriceAlertTriggered = (alert: PriceAlert) => {
    const product = this.state.trackedProducts.find(p => p.id === alert.productId);
    
    if (product) {
      Alert.alert(
        "Price Alert Triggered",
        `The price of ${product.name} has reached your target price of ${alert.targetPrice} ${product.currency}!`
      );
    }
  };

  _onPricesUpdated = (products: Product[]) => {
    Alert.alert(
      "Prices Updated",
      `Updated prices for ${products.length} products.`
    );
  };

  _onPriceComparisonComplete = (result: PriceComparisonResult) => {
    Alert.alert(
      "Price Comparison Complete",
      `Best price for ${result.product.name} is ${result.lowestPrice.price} ${result.product.currency} at ${result.lowestPrice.retailer}.`
    );
  };

  _scanBarcode = async () => {
    const { barcodeInput } = this.state;
    
    if (!barcodeInput) {
      Alert.alert("Error", "Please enter a barcode");
      return;
    }
    
    try {
      const result = await this.priceTrackerService.scanBarcode(barcodeInput);
      
      if (result.product) {
        this.setState(prevState => ({
          scannedProducts: [...prevState.scannedProducts, result.product!],
          showScanModal: false,
          barcodeInput: "",
        }));
        
        Alert.alert(
          "Product Scanned",
          `Scanned ${result.product.name}. Would you like to track this product?`,
          [
            {
              text: "No",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: () => this._trackProduct(result.product!),
            },
          ]
        );
      } else {
        Alert.alert("Error", "Product not found");
      }
    } catch (error) {
      console.error("Failed to scan barcode:", error);
      Alert.alert("Error", "Failed to scan barcode");
    }
  };

  _trackProduct = async (product: Product) => {
    try {
      const trackedProduct = await this.priceTrackerService.trackProduct(product);
      
      this.setState(prevState => ({
        trackedProducts: [...prevState.trackedProducts.filter(p => p.id !== trackedProduct.id), trackedProduct],
      }));
      
      Alert.alert(
        "Product Tracked",
        `Now tracking ${trackedProduct.name}. Would you like to set a price alert?`,
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => this._showAlertModal(trackedProduct),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to track product:", error);
      Alert.alert("Error", "Failed to track product");
    }
  };

  _untrackProduct = async (productId: string) => {
    try {
      const success = await this.priceTrackerService.untrackProduct(productId);
      
      if (success) {
        this.setState(prevState => ({
          trackedProducts: prevState.trackedProducts.filter(p => p.id !== productId),
          priceAlerts: prevState.priceAlerts.filter(a => a.productId !== productId),
        }));
        
        Alert.alert("Success", "Product untracked");
      }
    } catch (error) {
      console.error("Failed to untrack product:", error);
      Alert.alert("Error", "Failed to untrack product");
    }
  };

  _createPriceAlert = async () => {
    const { 
      selectedProduct, 
      targetPriceInput, 
      notifyOnPriceDecrease, 
      notifyOnPriceIncrease,
      notifyOnPercentageChange,
      notifyEmail,
      notifyPhone,
      notifyPush
    } = this.state;
    
    if (!selectedProduct) {
      Alert.alert("Error", "No product selected");
      return;
    }
    
    if (!targetPriceInput) {
      Alert.alert("Error", "Please enter a target price");
      return;
    }
    
    const targetPrice = parseFloat(targetPriceInput);
    
    if (isNaN(targetPrice) || targetPrice <= 0) {
      Alert.alert("Error", "Please enter a valid target price");
      return;
    }
    
    try {
      const alert = await this.priceTrackerService.createPriceAlert(
        selectedProduct.id,
        targetPrice,
        {
          notifyOnPriceDecrease,
          notifyOnPriceIncrease,
          notifyOnPercentageChange: notifyOnPercentageChange ? parseFloat(notifyOnPercentageChange) : undefined,
          notifyEmail: notifyEmail || undefined,
          notifyPhone: notifyPhone || undefined,
          notifyPush,
        }
      );
      
      this.setState(prevState => ({
        priceAlerts: [...prevState.priceAlerts, alert],
        showAlertModal: false,
        targetPriceInput: "",
      }));
      
      Alert.alert(
        "Price Alert Created",
        `You will be notified when the price of ${selectedProduct.name} reaches ${targetPrice} ${selectedProduct.currency}.`
      );
    } catch (error) {
      console.error("Failed to create price alert:", error);
      Alert.alert("Error", "Failed to create price alert");
    }
  };

  _deletePriceAlert = async (alertId: string) => {
    try {
      const success = await this.priceTrackerService.deletePriceAlert(alertId);
      
      if (success) {
        this.setState(prevState => ({
          priceAlerts: prevState.priceAlerts.filter(a => a.id !== alertId),
        }));
        
        Alert.alert("Success", "Price alert deleted");
      }
    } catch (error) {
      console.error("Failed to delete price alert:", error);
      Alert.alert("Error", "Failed to delete price alert");
    }
  };

  _updatePrices = async () => {
    try {
      const updatedProducts = await this.priceTrackerService.updatePrices();
      
      this.setState({
        trackedProducts: updatedProducts,
      });
      
      Alert.alert("Success", `Updated prices for ${updatedProducts.length} products`);
    } catch (error) {
      console.error("Failed to update prices:", error);
      Alert.alert("Error", "Failed to update prices");
    }
  };

  _checkPriceAlerts = async () => {
    try {
      const triggeredAlerts = await this.priceTrackerService.checkPriceAlerts();
      
      if (triggeredAlerts.length > 0) {
        this.setState(prevState => ({
          priceAlerts: prevState.priceAlerts.map(a => {
            const triggeredAlert = triggeredAlerts.find(ta => ta.id === a.id);
            return triggeredAlert || a;
          }),
        }));
        
        Alert.alert("Price Alerts", `${triggeredAlerts.length} price alerts have been triggered!`);
      } else {
        Alert.alert("Price Alerts", "No price alerts have been triggered");
      }
    } catch (error) {
      console.error("Failed to check price alerts:", error);
      Alert.alert("Error", "Failed to check price alerts");
    }
  };

  _showScanModal = () => {
    this.setState({
      showScanModal: true,
      barcodeInput: "",
    });
  };

  _showAlertModal = (product: Product) => {
    this.setState({
      selectedProduct: product,
      showAlertModal: true,
      targetPriceInput: product.currentPrice.toString(),
      notifyOnPriceDecrease: true,
      notifyOnPriceIncrease: false,
      notifyOnPercentageChange: "5",
      notifyEmail: this.props.notificationEmail || "",
      notifyPhone: this.props.notificationPhone || "",
      notifyPush: this.props.enablePushNotifications || false,
    });
  };

  _showTrackedProductsModal = () => {
    this.setState({
      showTrackedProductsModal: true,
    });
  };

  _showAlertsModal = () => {
    this.setState({
      showAlertsModal: true,
    });
  };

  _renderScanModal() {
    const { showScanModal, barcodeInput } = this.state;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showScanModal}
        onRequestClose={() => this.setState({ showScanModal: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Scan Barcode</Text>
            
            <Text style={styles.inputLabel}>Enter Barcode:</Text>
            <TextInput
              style={styles.textInput}
              value={barcodeInput}
              onChangeText={text => this.setState({ barcodeInput: text })}
              placeholder="Enter barcode"
              keyboardType="numeric"
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => this.setState({ showScanModal: false })}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.scanButton]}
                onPress={this._scanBarcode}
              >
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  _renderAlertModal() {
    const { 
      showAlertModal, 
      selectedProduct, 
      targetPriceInput,
      notifyOnPriceDecrease,
      notifyOnPriceIncrease,
      notifyOnPercentageChange,
      notifyEmail,
      notifyPhone,
      notifyPush
    } = this.state;
    
    if (!selectedProduct) {
      return null;
    }
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAlertModal}
        onRequestClose={() => this.setState({ showAlertModal: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Price Alert</Text>
            
            <Text style={styles.productName}>{selectedProduct.name}</Text>
            <Text style={styles.productPrice}>{selectedProduct.currentPrice} {selectedProduct.currency}</Text>
            
            <Text style={styles.inputLabel}>Target Price:</Text>
            <TextInput
              style={styles.textInput}
              value={targetPriceInput}
              onChangeText={text => this.setState({ targetPriceInput: text })}
              placeholder="Enter target price"
              keyboardType="numeric"
            />
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Notify on price decrease:</Text>
              <Switch
                value={notifyOnPriceDecrease}
                onValueChange={value => this.setState({ notifyOnPriceDecrease: value })}
                trackColor={{ false: "#CCCCCC", true: "#81C784" }}
                thumbColor={notifyOnPriceDecrease ? "#4CAF50" : "#F5F5F5"}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Notify on price increase:</Text>
              <Switch
                value={notifyOnPriceIncrease}
                onValueChange={value => this.setState({ notifyOnPriceIncrease: value })}
                trackColor={{ false: "#CCCCCC", true: "#81C784" }}
                thumbColor={notifyOnPriceIncrease ? "#4CAF50" : "#F5F5F5"}
              />
            </View>
            
            <Text style={styles.inputLabel}>Notify on percentage change (%):</Text>
            <TextInput
              style={styles.textInput}
              value={notifyOnPercentageChange}
              onChangeText={text => this.setState({ notifyOnPercentageChange: text })}
              placeholder="Enter percentage"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Notification Email:</Text>
            <TextInput
              style={styles.textInput}
              value={notifyEmail}
              onChangeText={text => this.setState({ notifyEmail: text })}
              placeholder="Enter email"
              keyboardType="email-address"
            />
            
            <Text style={styles.inputLabel}>Notification Phone:</Text>
            <TextInput
              style={styles.textInput}
              value={notifyPhone}
              onChangeText={text => this.setState({ notifyPhone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Push Notifications:</Text>
              <Switch
                value={notifyPush}
                onValueChange={value => this.setState({ notifyPush: value })}
                trackColor={{ false: "#CCCCCC", true: "#81C784" }}
                thumbColor={notifyPush ? "#4CAF50" : "#F5F5F5"}
              />
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => this.setState({ showAlertModal: false })}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={this._createPriceAlert}
              >
                <Text style={styles.buttonText}>Create Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  _renderTrackedProductsModal() {
    const { showTrackedProductsModal, trackedProducts } = this.state;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTrackedProductsModal}
        onRequestClose={() => this.setState({ showTrackedProductsModal: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tracked Products</Text>
            
            <ScrollView style={styles.scrollView}>
              {trackedProducts.length === 0 ? (
                <Text style={styles.emptyText}>No tracked products</Text>
              ) : (
                trackedProducts.map(product => (
                  <View key={product.id} style={styles.productItem}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productItemName}>{product.name}</Text>
                      <Text style={styles.productItemPrice}>{product.currentPrice} {product.currency}</Text>
                      <Text style={styles.productItemRetailer}>{product.retailer}</Text>
                    </View>
                    
                    <View style={styles.productActions}>
                      <TouchableOpacity
                        style={[styles.productButton, styles.alertButton]}
                        onPress={() => {
                          this.setState({ showTrackedProductsModal: false });
                          this._showAlertModal(product);
                        }}
                      >
                        <Text style={styles.productButtonText}>Alert</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.productButton, styles.untrackButton]}
                        onPress={() => this._untrackProduct(product.id)}
                      >
                        <Text style={styles.productButtonText}>Untrack</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => this.setState({ showTrackedProductsModal: false })}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  _renderAlertsModal() {
    const { showAlertsModal, priceAlerts, trackedProducts } = this.state;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAlertsModal}
        onRequestClose={() => this.setState({ showAlertsModal: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Price Alerts</Text>
            
            <ScrollView style={styles.scrollView}>
              {priceAlerts.length === 0 ? (
                <Text style={styles.emptyText}>No price alerts</Text>
              ) : (
                priceAlerts.map(alert => {
                  const product = trackedProducts.find(p => p.id === alert.productId);
                  
                  if (!product) {
                    return null;
                  }
                  
                  return (
                    <View key={alert.id} style={styles.alertItem}>
                      <View style={styles.alertInfo}>
                        <Text style={styles.alertItemProduct}>{product.name}</Text>
                        <Text style={styles.alertItemPrice}>
                          Target: {alert.targetPrice} {product.currency}
                        </Text>
                        <Text style={styles.alertItemCurrent}>
                          Current: {product.currentPrice} {product.currency}
                        </Text>
                        <Text style={styles.alertItemStatus}>
                          Status: {alert.status}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        style={[styles.alertDeleteButton]}
                        onPress={() => this._deletePriceAlert(alert.id)}
                      >
                        <Text style={styles.alertDeleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => this.setState({ showAlertsModal: false })}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  _renderControlButtons() {
    return (
      <View style={styles.controlButtonsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={this._showScanModal}
        >
          <Text style={styles.controlButtonText}>Scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={this._showTrackedProductsModal}
        >
          <Text style={styles.controlButtonText}>Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={this._showAlertsModal}
        >
          <Text style={styles.controlButtonText}>Alerts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={this._updatePrices}
        >
          <Text style={styles.controlButtonText}>Update</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={this._checkPriceAlerts}
        >
          <Text style={styles.controlButtonText}>Check</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderStatusBar() {
    const { trackedProducts, priceAlerts } = this.state;
    
    return (
      <View style={styles.statusBarContainer}>
        <Text style={styles.statusBarText}>
          {trackedProducts.length} products | {priceAlerts.length} alerts
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
          
          {/* Price Tracker component */}
          <ViroPriceTracker
            ref={this.priceTrackerRef}
            config={{
              notificationEmail: this.props.notificationEmail,
              notificationPhone: this.props.notificationPhone,
              enablePushNotifications: this.props.enablePushNotifications,
            }}
            enabled={this.state.trackingInitialized}
            showPriceIndicators={true}
            priceDecreaseColor="#4CAF50"
            priceIncreaseColor="#F44336"
            priceIndicatorSize={0.1}
            priceIndicatorAnimation="pulse"
            onBarcodeScanned={this._onBarcodeScanned}
            onProductTracked={this._onProductTracked}
            onPriceAlertCreated={this._onPriceAlertCreated}
            onPriceAlertTriggered={this._onPriceAlertTriggered}
            onPricesUpdated={this._onPricesUpdated}
            onPriceComparisonComplete={this._onPriceComparisonComplete}
            alertCheckInterval={60000}
            priceUpdateInterval={3600000}
            autoUpdatePrices={true}
            autoCheckAlerts={true}
            priceHistoryDays={30}
            enablePriceComparison={true}
            enablePriceHistory={true}
            enablePriceAlerts={true}
          />
        </ViroARScene>
        
        {this._renderControlButtons()}
        {this._renderStatusBar()}
        {this._renderScanModal()}
        {this._renderAlertModal()}
        {this._renderTrackedProductsModal()}
        {this._renderAlertsModal()}
      </View>
    );
  }
}

/**
 * Main component for the Price Tracker demo
 */
export class ViroPriceTrackerDemo extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <ViroARSceneNavigator
          initialScene={{
            scene: PriceTrackerARScene,
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
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  scanButton: {
    backgroundColor: '#2196F3',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
  },
  scrollView: {
    maxHeight: 300,
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999999',
    marginVertical: 20,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
  },
  productInfo: {
    flex: 1,
  },
  productItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productItemPrice: {
    fontSize: 14,
    color: '#4CAF50',
  },
  productItemRetailer: {
    fontSize: 12,
    color: '#999999',
  },
  productActions: {
    flexDirection: 'column',
  },
  productButton: {
    padding: 5,
    borderRadius: 5,
    marginBottom: 5,
    width: 70,
    alignItems: 'center',
  },
  alertButton: {
    backgroundColor: '#FFC107',
  },
  untrackButton: {
    backgroundColor: '#F44336',
  },
  productButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingVertical: 10,
  },
  alertInfo: {
    flex: 1,
  },
  alertItemProduct: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertItemPrice: {
    fontSize: 14,
    color: '#4CAF50',
  },
  alertItemCurrent: {
    fontSize: 14,
    color: '#2196F3',
  },
  alertItemStatus: {
    fontSize: 12,
    color: '#FFC107',
    fontWeight: 'bold',
  },
  alertDeleteButton: {
    backgroundColor: '#F44336',
    padding: 5,
    borderRadius: 5,
    width: 70,
    alignItems: 'center',
  },
  alertDeleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});