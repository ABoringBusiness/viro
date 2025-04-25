/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroPriceTracker
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
  ViroPriceTrackerService, 
  PriceTrackerConfig, 
  Product, 
  PriceAlert,
  PriceHistory,
  PriceComparisonResult,
  ScanResult
} from "./ViroPriceTrackerService";

// Register animations for price tracker
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
  showProductCard: [
    ["fadeIn", "scaleUp"],
  ],
  hideProductCard: [
    ["fadeOut", "scaleDown"],
  ],
});

type Props = ViewProps & {
  /**
   * Price Tracker configuration
   */
  config: PriceTrackerConfig;

  /**
   * Flag to enable/disable price tracking
   */
  enabled?: boolean;

  /**
   * Callback when a barcode is scanned
   */
  onBarcodeScanned?: (result: ScanResult) => void;

  /**
   * Callback when a product is tracked
   */
  onProductTracked?: (product: Product) => void;

  /**
   * Callback when a price alert is created
   */
  onPriceAlertCreated?: (alert: PriceAlert) => void;

  /**
   * Callback when a price alert is triggered
   */
  onPriceAlertTriggered?: (alert: PriceAlert) => void;

  /**
   * Callback when prices are updated
   */
  onPricesUpdated?: (products: Product[]) => void;

  /**
   * Callback when price comparison is complete
   */
  onPriceComparisonComplete?: (result: PriceComparisonResult) => void;

  /**
   * Flag to show/hide visual indicators for price changes
   */
  showPriceIndicators?: boolean;

  /**
   * Color for price decrease indicators
   */
  priceDecreaseColor?: string;

  /**
   * Color for price increase indicators
   */
  priceIncreaseColor?: string;

  /**
   * Size of the price indicator
   */
  priceIndicatorSize?: number;

  /**
   * Animation name for the price indicator
   */
  priceIndicatorAnimation?: string | ViroAnimation;

  /**
   * Custom renderer for price indicators
   */
  renderPriceIndicator?: (product: Product, priceChange: number) => React.ReactNode;

  /**
   * Custom renderer for product details
   */
  renderProductDetails?: (
    product: Product, 
    priceHistory?: PriceHistory,
    priceComparison?: PriceComparisonResult
  ) => React.ReactNode;

  /**
   * Interval in milliseconds for checking price alerts
   */
  alertCheckInterval?: number;

  /**
   * Interval in milliseconds for updating prices
   */
  priceUpdateInterval?: number;

  /**
   * Flag to enable/disable automatic price updates
   */
  autoUpdatePrices?: boolean;

  /**
   * Flag to enable/disable automatic price alert checks
   */
  autoCheckAlerts?: boolean;

  /**
   * Number of days of price history to show
   */
  priceHistoryDays?: number;

  /**
   * Flag to enable/disable price comparison
   */
  enablePriceComparison?: boolean;

  /**
   * Flag to enable/disable price history
   */
  enablePriceHistory?: boolean;

  /**
   * Flag to enable/disable price alerts
   */
  enablePriceAlerts?: boolean;
};

type State = {
  scannedProducts: Map<string, Product>;
  trackedProducts: Product[];
  priceAlerts: PriceAlert[];
  selectedProduct: Product | null;
  priceHistory: PriceHistory | null;
  priceComparison: PriceComparisonResult | null;
  showProductDetails: boolean;
  isProcessing: boolean;
  error: string | null;
};

/**
 * ViroPriceTracker is a component that provides price tracking functionality
 * for products scanned in AR.
 */
export class ViroPriceTracker extends React.Component<Props, State> {
  _alertCheckInterval: NodeJS.Timeout | null = null;
  _priceUpdateInterval: NodeJS.Timeout | null = null;
  _arScene: ViroARScene | null = null;
  _priceTrackerService: ViroPriceTrackerService;

  constructor(props: Props) {
    super(props);
    this.state = {
      scannedProducts: new Map(),
      trackedProducts: [],
      priceAlerts: [],
      selectedProduct: null,
      priceHistory: null,
      priceComparison: null,
      showProductDetails: false,
      isProcessing: false,
      error: null,
    };
    this._priceTrackerService = ViroPriceTrackerService.getInstance();
  }

  async componentDidMount() {
    // Initialize the Price Tracker service
    await this._priceTrackerService.initialize(this.props.config);

    if (this.props.enabled !== false) {
      this._startPriceTracking();
    }

    // Load tracked products and price alerts
    this._loadTrackedProducts();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.enabled !== this.props.enabled) {
      if (this.props.enabled) {
        this._startPriceTracking();
      } else {
        this._stopPriceTracking();
      }
    }

    if (prevProps.config !== this.props.config) {
      this._priceTrackerService.initialize(this.props.config);
    }

    if (
      prevProps.alertCheckInterval !== this.props.alertCheckInterval ||
      prevProps.autoCheckAlerts !== this.props.autoCheckAlerts
    ) {
      this._stopPriceTracking();
      this._startPriceTracking();
    }

    if (
      prevProps.priceUpdateInterval !== this.props.priceUpdateInterval ||
      prevProps.autoUpdatePrices !== this.props.autoUpdatePrices
    ) {
      this._stopPriceTracking();
      this._startPriceTracking();
    }
  }

  componentWillUnmount() {
    this._stopPriceTracking();
    this._priceTrackerService.release();
  }

  _startPriceTracking = () => {
    // Start checking price alerts
    if (this.props.autoCheckAlerts !== false && this.props.enablePriceAlerts !== false) {
      const alertInterval = this.props.alertCheckInterval || 60000; // Default to 1 minute
      this._alertCheckInterval = setInterval(() => {
        this._checkPriceAlerts();
      }, alertInterval);
    }

    // Start updating prices
    if (this.props.autoUpdatePrices !== false) {
      const updateInterval = this.props.priceUpdateInterval || 3600000; // Default to 1 hour
      this._priceUpdateInterval = setInterval(() => {
        this._updatePrices();
      }, updateInterval);
    }
  };

  _stopPriceTracking = () => {
    if (this._alertCheckInterval) {
      clearInterval(this._alertCheckInterval);
      this._alertCheckInterval = null;
    }

    if (this._priceUpdateInterval) {
      clearInterval(this._priceUpdateInterval);
      this._priceUpdateInterval = null;
    }
  };

  _loadTrackedProducts = async () => {
    try {
      const trackedProducts = await this._priceTrackerService.getTrackedProducts();
      const priceAlerts = await this._priceTrackerService.getAllPriceAlerts();
      
      this.setState({
        trackedProducts,
        priceAlerts,
      });
    } catch (error) {
      console.error("Failed to load tracked products:", error);
      this.setState({
        error: "Failed to load tracked products",
      });
    }
  };

  _scanBarcode = async (barcodeData: string) => {
    this.setState({ isProcessing: true });

    try {
      const result = await this._priceTrackerService.scanBarcode(barcodeData);
      
      if (result.product) {
        // Add to scanned products
        this.setState(prevState => ({
          scannedProducts: new Map(prevState.scannedProducts).set(result.product!.id, result.product!),
          isProcessing: false,
        }));
      } else {
        this.setState({ isProcessing: false });
      }
      
      if (this.props.onBarcodeScanned) {
        this.props.onBarcodeScanned(result);
      }
      
      return result;
    } catch (error) {
      console.error("Failed to scan barcode:", error);
      this.setState({
        isProcessing: false,
        error: "Failed to scan barcode",
      });
      throw error;
    }
  };

  _trackProduct = async (product: Product) => {
    this.setState({ isProcessing: true });

    try {
      const trackedProduct = await this._priceTrackerService.trackProduct(product);
      
      // Update tracked products
      this.setState(prevState => ({
        trackedProducts: [...prevState.trackedProducts.filter(p => p.id !== trackedProduct.id), trackedProduct],
        isProcessing: false,
      }));
      
      if (this.props.onProductTracked) {
        this.props.onProductTracked(trackedProduct);
      }
      
      return trackedProduct;
    } catch (error) {
      console.error("Failed to track product:", error);
      this.setState({
        isProcessing: false,
        error: "Failed to track product",
      });
      throw error;
    }
  };

  _untrackProduct = async (productId: string) => {
    this.setState({ isProcessing: true });

    try {
      const success = await this._priceTrackerService.untrackProduct(productId);
      
      if (success) {
        // Update tracked products
        this.setState(prevState => ({
          trackedProducts: prevState.trackedProducts.filter(p => p.id !== productId),
          priceAlerts: prevState.priceAlerts.filter(a => a.productId !== productId),
          isProcessing: false,
        }));
      } else {
        this.setState({ isProcessing: false });
      }
      
      return success;
    } catch (error) {
      console.error("Failed to untrack product:", error);
      this.setState({
        isProcessing: false,
        error: "Failed to untrack product",
      });
      throw error;
    }
  };

  _createPriceAlert = async (
    productId: string,
    targetPrice: number,
    options: Parameters<ViroPriceTrackerService["createPriceAlert"]>[2] = {}
  ) => {
    if (this.props.enablePriceAlerts === false) {
      return null;
    }

    this.setState({ isProcessing: true });

    try {
      const alert = await this._priceTrackerService.createPriceAlert(productId, targetPrice, options);
      
      // Update price alerts
      this.setState(prevState => ({
        priceAlerts: [...prevState.priceAlerts, alert],
        isProcessing: false,
      }));
      
      if (this.props.onPriceAlertCreated) {
        this.props.onPriceAlertCreated(alert);
      }
      
      return alert;
    } catch (error) {
      console.error("Failed to create price alert:", error);
      this.setState({
        isProcessing: false,
        error: "Failed to create price alert",
      });
      throw error;
    }
  };

  _updatePriceAlert = async (
    alertId: string,
    updates: Parameters<ViroPriceTrackerService["updatePriceAlert"]>[1]
  ) => {
    this.setState({ isProcessing: true });

    try {
      const updatedAlert = await this._priceTrackerService.updatePriceAlert(alertId, updates);
      
      if (updatedAlert) {
        // Update price alerts
        this.setState(prevState => ({
          priceAlerts: prevState.priceAlerts.map(a => a.id === alertId ? updatedAlert : a),
          isProcessing: false,
        }));
      } else {
        this.setState({ isProcessing: false });
      }
      
      return updatedAlert;
    } catch (error) {
      console.error("Failed to update price alert:", error);
      this.setState({
        isProcessing: false,
        error: "Failed to update price alert",
      });
      throw error;
    }
  };

  _deletePriceAlert = async (alertId: string) => {
    this.setState({ isProcessing: true });

    try {
      const success = await this._priceTrackerService.deletePriceAlert(alertId);
      
      if (success) {
        // Update price alerts
        this.setState(prevState => ({
          priceAlerts: prevState.priceAlerts.filter(a => a.id !== alertId),
          isProcessing: false,
        }));
      } else {
        this.setState({ isProcessing: false });
      }
      
      return success;
    } catch (error) {
      console.error("Failed to delete price alert:", error);
      this.setState({
        isProcessing: false,
        error: "Failed to delete price alert",
      });
      throw error;
    }
  };

  _getPriceHistory = async (productId: string) => {
    if (this.props.enablePriceHistory === false) {
      return null;
    }

    this.setState({ isProcessing: true });

    try {
      const priceHistory = await this._priceTrackerService.getPriceHistory(
        productId,
        this.props.priceHistoryDays || 30
      );
      
      this.setState({
        priceHistory,
        isProcessing: false,
      });
      
      return priceHistory;
    } catch (error) {
      console.error("Failed to get price history:", error);
      this.setState({
        isProcessing: false,
        error: "Failed to get price history",
      });
      throw error;
    }
  };

  _comparePrices = async (productId: string) => {
    if (this.props.enablePriceComparison === false) {
      return null;
    }

    this.setState({ isProcessing: true });

    try {
      const priceComparison = await this._priceTrackerService.comparePrices(productId);
      
      this.setState({
        priceComparison,
        isProcessing: false,
      });
      
      if (this.props.onPriceComparisonComplete) {
        this.props.onPriceComparisonComplete(priceComparison);
      }
      
      return priceComparison;
    } catch (error) {
      console.error("Failed to compare prices:", error);
      this.setState({
        isProcessing: false,
        error: "Failed to compare prices",
      });
      throw error;
    }
  };

  _checkPriceAlerts = async () => {
    if (this.props.enablePriceAlerts === false) {
      return [];
    }

    try {
      const triggeredAlerts = await this._priceTrackerService.checkPriceAlerts();
      
      if (triggeredAlerts.length > 0) {
        // Update price alerts
        this.setState(prevState => ({
          priceAlerts: prevState.priceAlerts.map(a => {
            const triggeredAlert = triggeredAlerts.find(ta => ta.id === a.id);
            return triggeredAlert || a;
          }),
        }));
        
        // Notify about triggered alerts
        for (const alert of triggeredAlerts) {
          if (this.props.onPriceAlertTriggered) {
            this.props.onPriceAlertTriggered(alert);
          }
        }
      }
      
      return triggeredAlerts;
    } catch (error) {
      console.error("Failed to check price alerts:", error);
      this.setState({
        error: "Failed to check price alerts",
      });
      return [];
    }
  };

  _updatePrices = async () => {
    try {
      const updatedProducts = await this._priceTrackerService.updatePrices();
      
      if (updatedProducts.length > 0) {
        // Update tracked products
        this.setState({
          trackedProducts: updatedProducts,
        });
        
        if (this.props.onPricesUpdated) {
          this.props.onPricesUpdated(updatedProducts);
        }
      }
      
      return updatedProducts;
    } catch (error) {
      console.error("Failed to update prices:", error);
      this.setState({
        error: "Failed to update prices",
      });
      return [];
    }
  };

  _selectProduct = async (product: Product) => {
    this.setState({
      selectedProduct: product,
      priceHistory: null,
      priceComparison: null,
      showProductDetails: true,
    });

    // Get price history if enabled
    if (this.props.enablePriceHistory !== false) {
      try {
        const priceHistory = await this._getPriceHistory(product.id);
        this.setState({ priceHistory });
      } catch (error) {
        console.error("Failed to get price history:", error);
      }
    }

    // Compare prices if enabled
    if (this.props.enablePriceComparison !== false) {
      try {
        const priceComparison = await this._comparePrices(product.id);
        this.setState({ priceComparison });
      } catch (error) {
        console.error("Failed to compare prices:", error);
      }
    }
  };

  _renderPriceIndicators() {
    const { showPriceIndicators = true, priceDecreaseColor = "#4CAF50", priceIncreaseColor = "#F44336", priceIndicatorSize = 0.1 } = this.props;
    
    if (!showPriceIndicators) {
      return null;
    }
    
    return this.state.trackedProducts.map((product, index) => {
      // Calculate position based on index
      const position: Viro3DPoint = [
        (index % 3 - 1) * 0.5,
        0.5 + Math.floor(index / 3) * 0.3,
        -2,
      ];
      
      // Determine if price has increased or decreased
      const priceChange = 0; // In a real implementation, this would be calculated from price history
      const color = priceChange < 0 ? priceDecreaseColor : priceChange > 0 ? priceIncreaseColor : "#FFFFFF";
      
      // If custom renderer is provided, use it
      if (this.props.renderPriceIndicator) {
        return (
          <ViroNode
            key={`price-indicator-${product.id}`}
            position={position}
            onClick={() => this._selectProduct(product)}
          >
            {this.props.renderPriceIndicator(product, priceChange)}
          </ViroNode>
        );
      }
      
      // Default indicator is a colored sphere with pulse animation
      const animation = this.props.priceIndicatorAnimation || "pulse";
      
      return (
        <ViroNode
          key={`price-indicator-${product.id}`}
          position={position}
          onClick={() => this._selectProduct(product)}
        >
          <ViroSphere
            radius={priceIndicatorSize}
            materials={[priceChange < 0 ? "priceDecreaseIndicator" : priceChange > 0 ? "priceIncreaseIndicator" : "priceUnchangedIndicator"]}
            animation={{
              name: typeof animation === "string" ? animation : animation.name,
              run: true,
              loop: true,
            }}
          />
          
          <ViroText
            text={product.name}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#FFFFFF",
              textAlignVertical: "center",
              textAlign: "center",
            }}
            position={[0, priceIndicatorSize + 0.05, 0]}
            width={0.5}
            height={0.1}
          />
          
          <ViroText
            text={`${product.currentPrice} ${product.currency}`}
            style={{
              fontFamily: "Arial",
              fontSize: 10,
              color,
              textAlignVertical: "center",
              textAlign: "center",
              fontWeight: "bold",
            }}
            position={[0, priceIndicatorSize + 0.15, 0]}
            width={0.5}
            height={0.1}
          />
        </ViroNode>
      );
    });
  }

  _renderProductDetails() {
    const { selectedProduct, priceHistory, priceComparison, showProductDetails } = this.state;
    
    if (!selectedProduct || !showProductDetails) {
      return null;
    }
    
    // If custom renderer is provided, use it
    if (this.props.renderProductDetails) {
      return (
        <ViroNode
          position={[0, 0, -2]}
          animation={{
            name: "showProductCard",
            run: showProductDetails,
            loop: false,
          }}
        >
          {this.props.renderProductDetails(selectedProduct, priceHistory || undefined, priceComparison || undefined)}
        </ViroNode>
      );
    }
    
    // Default product details card
    return (
      <ViroNode
        position={[0, 0, -2]}
        animation={{
          name: "showProductCard",
          run: showProductDetails,
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
          materials={["productCard"]}
        >
          <ViroText
            text={selectedProduct.name}
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
            text={`${selectedProduct.currentPrice} ${selectedProduct.currency}`}
            style={{
              fontFamily: "Arial",
              fontSize: 18,
              color: "#4CAF50",
              textAlignVertical: "center",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
          
          <ViroText
            text={`Retailer: ${selectedProduct.retailer}`}
            style={{
              fontFamily: "Arial",
              fontSize: 14,
              color: "#666666",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          
          {priceHistory && (
            <ViroText
              text={`Price Range: ${priceHistory.lowestPrice} - ${priceHistory.highestPrice} ${selectedProduct.currency}`}
              style={{
                fontFamily: "Arial",
                fontSize: 14,
                color: "#666666",
                textAlignVertical: "center",
                textAlign: "center",
              }}
            />
          )}
          
          {priceComparison && (
            <>
              <ViroText
                text="Best Price"
                style={{
                  fontFamily: "Arial",
                  fontSize: 16,
                  color: "#000000",
                  textAlignVertical: "center",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
              
              <ViroText
                text={`${priceComparison.lowestPrice.retailer}: ${priceComparison.lowestPrice.price} ${selectedProduct.currency}`}
                style={{
                  fontFamily: "Arial",
                  fontSize: 14,
                  color: "#4CAF50",
                  textAlignVertical: "center",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
              
              <ViroText
                text={`Save up to ${priceComparison.priceRange.percentageDifference}%`}
                style={{
                  fontFamily: "Arial",
                  fontSize: 14,
                  color: "#4CAF50",
                  textAlignVertical: "center",
                  textAlign: "center",
                }}
              />
            </>
          )}
          
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
    if (this.state.showProductDetails) {
      this.setState({
        showProductDetails: false,
      });
    }
  };

  render() {
    return (
      <>
        {this._renderPriceIndicators()}
        {this._renderProductDetails()}
      </>
    );
  }
}