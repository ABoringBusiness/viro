/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroShoppingAR
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
  ViroShoppingService, 
  ShoppingAPIConfig, 
  DetectedProduct, 
  ProductSearchResult,
  PriceHistory,
  BuyingOptions
} from "./ViroShoppingService";

// Register animations for product indicators
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
   * Shopping API configuration
   */
  apiConfig: ShoppingAPIConfig;

  /**
   * Flag to enable/disable product detection
   */
  enabled?: boolean;

  /**
   * Minimum confidence level (0-1) for product detection
   */
  minConfidence?: number;

  /**
   * Maximum number of products to detect simultaneously
   */
  maxProducts?: number;

  /**
   * Callback when products are detected
   */
  onProductsDetected?: (products: DetectedProduct[]) => void;

  /**
   * Callback when a product is selected/tapped
   */
  onProductSelected?: (product: DetectedProduct, searchResults: ProductSearchResult[]) => void;

  /**
   * Flag to show/hide visual indicators for detected products
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
   * Flag to show/hide product labels
   */
  showLabels?: boolean;

  /**
   * Custom renderer for product indicators
   */
  renderIndicator?: (product: DetectedProduct) => React.ReactNode;

  /**
   * Custom renderer for product labels
   */
  renderLabel?: (product: DetectedProduct) => React.ReactNode;

  /**
   * Custom renderer for product details
   */
  renderProductDetails?: (
    product: DetectedProduct, 
    searchResults: ProductSearchResult[], 
    priceHistory?: PriceHistory,
    buyingOptions?: BuyingOptions
  ) => React.ReactNode;

  /**
   * Interval in milliseconds for capturing and analyzing images
   */
  captureInterval?: number;

  /**
   * Flag to enable/disable automatic image capture
   */
  autoCaptureEnabled?: boolean;

  /**
   * Callback when an image is captured
   */
  onImageCaptured?: (imageBase64: string) => void;

  /**
   * Flag to enable/disable price tracking
   */
  priceTrackingEnabled?: boolean;

  /**
   * Flag to enable/disable finding similar products
   */
  findSimilarProductsEnabled?: boolean;

  /**
   * Flag to enable/disable finding best deals
   */
  findBestDealsEnabled?: boolean;

  /**
   * Flag to enable/disable showing buying options
   */
  showBuyingOptionsEnabled?: boolean;

  /**
   * Flag to enable/disable showing price history
   */
  showPriceHistoryEnabled?: boolean;

  /**
   * Number of days of price history to show
   */
  priceHistoryDays?: number;
};

type State = {
  detectedProducts: DetectedProduct[];
  selectedProduct: DetectedProduct | null;
  searchResults: ProductSearchResult[];
  priceHistory: PriceHistory | null;
  buyingOptions: BuyingOptions | null;
  isProcessing: boolean;
  showProductDetails: boolean;
  capturedImageBase64: string | null;
  error: string | null;
};

/**
 * ViroShoppingAR is a component that uses Shopping API to detect products
 * in the camera view and display shopping information.
 */
export class ViroShoppingAR extends React.Component<Props, State> {
  _captureInterval: NodeJS.Timeout | null = null;
  _arScene: ViroARScene | null = null;
  _shoppingService: ViroShoppingService;

  constructor(props: Props) {
    super(props);
    this.state = {
      detectedProducts: [],
      selectedProduct: null,
      searchResults: [],
      priceHistory: null,
      buyingOptions: null,
      isProcessing: false,
      showProductDetails: false,
      capturedImageBase64: null,
      error: null,
    };
    this._shoppingService = ViroShoppingService.getInstance();
  }

  async componentDidMount() {
    // Initialize the Shopping service
    await this._shoppingService.initialize(this.props.apiConfig);

    if (this.props.enabled !== false) {
      this._startProductDetection();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.enabled !== this.props.enabled) {
      if (this.props.enabled) {
        this._startProductDetection();
      } else {
        this._stopProductDetection();
      }
    }

    if (prevProps.apiConfig !== this.props.apiConfig) {
      this._shoppingService.initialize(this.props.apiConfig);
    }

    if (prevProps.captureInterval !== this.props.captureInterval && this.props.autoCaptureEnabled) {
      this._stopProductDetection();
      this._startProductDetection();
    }
  }

  componentWillUnmount() {
    this._stopProductDetection();
    this._shoppingService.release();
  }

  _startProductDetection = () => {
    if (this.props.autoCaptureEnabled !== false) {
      const interval = this.props.captureInterval || 5000; // Default to 5 seconds
      this._captureInterval = setInterval(() => {
        if (this.state.isProcessing) {
          return;
        }
        this._captureAndAnalyzeImage();
      }, interval);
    }
  };

  _stopProductDetection = () => {
    if (this._captureInterval) {
      clearInterval(this._captureInterval);
      this._captureInterval = null;
    }
  };

  _captureAndAnalyzeImage = async () => {
    this.setState({ isProcessing: true });

    try {
      // In a real implementation, this would capture an image from the AR camera
      // const imageBase64 = await NativeModules.ViroARCameraModule.captureImage(findNodeHandle(this._arScene));
      
      // For demo purposes, we'll use a mock image
      const mockImageBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."; // This would be a real base64 image in production
      
      if (this.props.onImageCaptured) {
        this.props.onImageCaptured(mockImageBase64);
      }
      
      this.setState({ capturedImageBase64: mockImageBase64 });
      
      // Detect products using the Shopping API
      const products = await this._shoppingService.detectProducts(
        mockImageBase64,
        {
          confidence_threshold: this.props.minConfidence || 0.7,
          max_results: this.props.maxProducts || 5,
        }
      );
      
      this.setState({
        detectedProducts: products,
        isProcessing: false,
      });
      
      if (this.props.onProductsDetected) {
        this.props.onProductsDetected(products);
      }
    } catch (error) {
      console.error("Error in image capture and analysis:", error);
      this.setState({ 
        isProcessing: false,
        error: "Failed to capture and analyze image"
      });
    }
  };

  _onProductSelected = async (product: DetectedProduct) => {
    this.setState({ 
      isProcessing: true,
      selectedProduct: product,
      searchResults: [],
      priceHistory: null,
      buyingOptions: null,
      error: null,
    });

    try {
      // Search for the product
      const searchResults = await this._shoppingService.searchProducts(
        product.name,
        {
          category: product.attributes.category,
          max_results: 5,
        }
      );
      
      let priceHistory = null;
      let buyingOptions = null;
      
      // Get price history if enabled and we have search results
      if (this.props.showPriceHistoryEnabled && searchResults.length > 0) {
        priceHistory = await this._shoppingService.getPriceHistory(
          searchResults[0].id,
          searchResults[0].platform,
          this.props.priceHistoryDays || 30
        );
      }
      
      // Get buying options if enabled
      if (this.props.showBuyingOptionsEnabled) {
        buyingOptions = await this._shoppingService.getBuyingOptions(product.name);
      }
      
      this.setState({
        searchResults,
        priceHistory,
        buyingOptions,
        isProcessing: false,
        showProductDetails: true,
      });
      
      if (this.props.onProductSelected) {
        this.props.onProductSelected(product, searchResults);
      }
    } catch (error) {
      console.error("Error getting product information:", error);
      this.setState({ 
        isProcessing: false,
        error: "Failed to get product information",
        showProductDetails: true,
      });
    }
  };

  _trackPrice = async (productId: string, platform: string, targetPrice?: number) => {
    if (!this.props.priceTrackingEnabled) {
      return;
    }

    try {
      await this._shoppingService.trackPrice(productId, platform, {
        target_price: targetPrice,
      });
      
      // Show success message or update UI
    } catch (error) {
      console.error("Error tracking price:", error);
      this.setState({ error: "Failed to track price" });
    }
  };

  _findSimilarProducts = async (productId: string, platform: string) => {
    if (!this.props.findSimilarProductsEnabled) {
      return;
    }

    try {
      const similarProducts = await this._shoppingService.findSimilarProducts(
        productId,
        platform
      );
      
      this.setState({ searchResults: similarProducts });
    } catch (error) {
      console.error("Error finding similar products:", error);
      this.setState({ error: "Failed to find similar products" });
    }
  };

  _findBestDeal = async (productName: string) => {
    if (!this.props.findBestDealsEnabled) {
      return;
    }

    try {
      const bestDeal = await this._shoppingService.findBestDeal(productName);
      
      // Update search results with best deal
      this.setState({ 
        searchResults: [bestDeal, ...this.state.searchResults.filter(r => r.id !== bestDeal.id)],
      });
    } catch (error) {
      console.error("Error finding best deal:", error);
      this.setState({ error: "Failed to find best deal" });
    }
  };

  _getPositionFromBoundingBox(boundingBox?: DetectedProduct["boundingBox"]): Viro3DPoint {
    if (!boundingBox) {
      // Default position if no bounding box is provided
      return [0, 0, -1];
    }
    
    // Convert normalized bounding box coordinates to 3D space
    // This is a simplified conversion and would need to be adjusted based on the AR scene
    const centerX = (boundingBox.minX + boundingBox.maxX) / 2;
    const centerY = (boundingBox.minY + boundingBox.maxY) / 2;
    
    // Map from [0,1] to [-1,1] range for X and Y
    const x = (centerX - 0.5) * 2;
    const y = (centerY - 0.5) * -2; // Invert Y axis
    
    // Z position is fixed at a distance from the camera
    const z = -1.5;
    
    return [x, y, z];
  }

  _renderProductIndicators() {
    const { showIndicators = true, indicatorColor = "#4CAF50", indicatorSize = 0.1 } = this.props;
    
    if (!showIndicators) {
      return null;
    }
    
    return this.state.detectedProducts.map((product, index) => {
      // If custom renderer is provided, use it
      if (this.props.renderIndicator) {
        return (
          <ViroNode
            key={`indicator-${index}`}
            position={this._getPositionFromBoundingBox(product.boundingBox)}
            onClick={() => this._onProductSelected(product)}
          >
            {this.props.renderIndicator(product)}
          </ViroNode>
        );
      }
      
      // Default indicator is a green sphere with pulse animation
      const animation = this.props.indicatorAnimation || "pulse";
      
      return (
        <ViroNode
          key={`indicator-${index}`}
          position={this._getPositionFromBoundingBox(product.boundingBox)}
          onClick={() => this._onProductSelected(product)}
        >
          <ViroSphere
            radius={indicatorSize}
            materials={["productIndicator"]}
            animation={{
              name: typeof animation === "string" ? animation : animation.name,
              run: true,
              loop: true,
            }}
            physicsBody={{
              type: "Kinematic",
            }}
          />
          
          {this.props.showLabels && this._renderLabel(product, index)}
        </ViroNode>
      );
    });
  }
  
  _renderLabel(product: DetectedProduct, index: number) {
    // If custom label renderer is provided, use it
    if (this.props.renderLabel) {
      return this.props.renderLabel(product);
    }
    
    // Default label is a text with product name and confidence
    return (
      <ViroNode position={[0, 0.15, 0]}>
        <ViroFlexView
          style={{
            padding: 0.05,
            backgroundColor: "#000000AA",
            borderRadius: 0.05,
          }}
          width={0.5}
          height={0.3}
        >
          <ViroText
            text={product.name}
            style={{
              fontFamily: "Arial",
              fontSize: 12,
              color: "#FFFFFF",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          <ViroText
            text={`${Math.round(product.confidence * 100)}%`}
            style={{
              fontFamily: "Arial",
              fontSize: 10,
              color: "#CCCCCC",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
          {product.attributes.brand && (
            <ViroText
              text={product.attributes.brand}
              style={{
                fontFamily: "Arial",
                fontSize: 10,
                color: "#CCCCCC",
                textAlignVertical: "center",
                textAlign: "center",
              }}
            />
          )}
        </ViroFlexView>
      </ViroNode>
    );
  }

  _renderProductDetails() {
    const { 
      selectedProduct, 
      searchResults, 
      priceHistory, 
      buyingOptions, 
      showProductDetails 
    } = this.state;
    
    if (!selectedProduct || !showProductDetails) {
      return null;
    }
    
    // If custom product details renderer is provided, use it
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
          {this.props.renderProductDetails(selectedProduct, searchResults, priceHistory, buyingOptions)}
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
          
          {selectedProduct.attributes.brand && (
            <ViroText
              text={`Brand: ${selectedProduct.attributes.brand}`}
              style={{
                fontFamily: "Arial",
                fontSize: 16,
                color: "#333333",
                textAlignVertical: "center",
                textAlign: "center",
              }}
            />
          )}
          
          {searchResults.length > 0 && (
            <>
              <ViroText
                text="Shopping Results"
                style={{
                  fontFamily: "Arial",
                  fontSize: 18,
                  color: "#000000",
                  textAlignVertical: "center",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              />
              
              {searchResults.slice(0, 3).map((result, index) => (
                <ViroFlexView
                  key={`result-${index}`}
                  style={{
                    padding: 0.05,
                    backgroundColor: "#F5F5F5",
                    borderRadius: 0.05,
                    margin: 0.05,
                  }}
                  width={2.3}
                  height={0.3}
                >
                  <ViroText
                    text={result.name}
                    style={{
                      fontFamily: "Arial",
                      fontSize: 14,
                      color: "#000000",
                      textAlignVertical: "center",
                      textAlign: "left",
                    }}
                  />
                  <ViroText
                    text={`${result.price} ${result.currency} - ${result.platform}`}
                    style={{
                      fontFamily: "Arial",
                      fontSize: 12,
                      color: "#4CAF50",
                      textAlignVertical: "center",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  />
                  <ViroText
                    text={`Rating: ${result.rating.toFixed(1)} (${result.reviews_count} reviews)`}
                    style={{
                      fontFamily: "Arial",
                      fontSize: 10,
                      color: "#666666",
                      textAlignVertical: "center",
                      textAlign: "left",
                    }}
                  />
                </ViroFlexView>
              ))}
            </>
          )}
          
          {priceHistory && (
            <ViroText
              text={`Price Range: $${priceHistory.lowest_price.toFixed(2)} - $${priceHistory.highest_price.toFixed(2)}`}
              style={{
                fontFamily: "Arial",
                fontSize: 14,
                color: "#333333",
                textAlignVertical: "center",
                textAlign: "center",
              }}
            />
          )}
          
          {buyingOptions && (
            <ViroText
              text={`Best Value: ${buyingOptions.best_value} ($${buyingOptions.options[buyingOptions.best_value as keyof typeof buyingOptions.options]?.price.toFixed(2)})`}
              style={{
                fontFamily: "Arial",
                fontSize: 14,
                color: "#4CAF50",
                textAlignVertical: "center",
                textAlign: "center",
                fontWeight: "bold",
              }}
            />
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
        {this._renderProductIndicators()}
        {this._renderProductDetails()}
      </>
    );
  }
}