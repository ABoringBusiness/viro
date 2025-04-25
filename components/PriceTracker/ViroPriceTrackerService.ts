/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroPriceTrackerService
 */

import { NativeModules, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// This would be the actual native module in a real implementation
// const PriceTrackerModule = NativeModules.ViroPriceTrackerModule;

export type PriceTrackerConfig = {
  apiKey?: string;
  apiUrl?: string;
  notificationEmail?: string;
  notificationPhone?: string;
  enablePushNotifications?: boolean;
};

export type Product = {
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

export type PriceAlert = {
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

export type PriceHistory = {
  productId: string;
  prices: {
    date: string;
    price: number;
    retailer: string;
    inStock: boolean;
  }[];
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
};

export type PriceComparisonResult = {
  product: Product;
  retailers: {
    name: string;
    price: number;
    currency: string;
    url?: string;
    inStock: boolean;
    shippingCost?: number;
    totalPrice: number;
    lastUpdated: string;
  }[];
  lowestPrice: {
    retailer: string;
    price: number;
    totalPrice: number;
    url?: string;
  };
  priceRange: {
    min: number;
    max: number;
    difference: number;
    percentageDifference: number;
  };
};

export type ScanResult = {
  barcode?: string;
  product?: Product;
  confidence: number;
};

/**
 * Service class for handling price tracking functionality
 */
export class ViroPriceTrackerService {
  private static instance: ViroPriceTrackerService;
  private isInitialized: boolean = false;
  private config: PriceTrackerConfig | null = null;
  private trackedProducts: Map<string, Product> = new Map();
  private priceAlerts: Map<string, PriceAlert[]> = new Map();
  private storageKey = "viro_price_tracker_data";

  private constructor() {}

  /**
   * Get the singleton instance of the service
   */
  public static getInstance(): ViroPriceTrackerService {
    if (!ViroPriceTrackerService.instance) {
      ViroPriceTrackerService.instance = new ViroPriceTrackerService();
    }
    return ViroPriceTrackerService.instance;
  }

  /**
   * Initialize the Price Tracker service
   * @param config Configuration for the Price Tracker
   */
  public async initialize(config: PriceTrackerConfig): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      this.config = config;
      
      // In a real implementation, this would initialize the native module
      // await PriceTrackerModule.initialize(config);
      
      // Load tracked products and price alerts from storage
      await this._loadFromStorage();
      
      this.isInitialized = true;
      console.log("Price Tracker service initialized");
      return true;
    } catch (error) {
      console.error("Failed to initialize Price Tracker service:", error);
      return false;
    }
  }

  /**
   * Load tracked products and price alerts from storage
   */
  private async _loadFromStorage(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const parsedData = JSON.parse(data);
        
        // Load tracked products
        if (parsedData.products) {
          this.trackedProducts = new Map(Object.entries(parsedData.products));
        }
        
        // Load price alerts
        if (parsedData.alerts) {
          this.priceAlerts = new Map(Object.entries(parsedData.alerts));
        }
        
        console.log(`Loaded ${this.trackedProducts.size} products and ${this._getTotalAlerts()} alerts from storage`);
      }
    } catch (error) {
      console.error("Failed to load data from storage:", error);
    }
  }

  /**
   * Save tracked products and price alerts to storage
   */
  private async _saveToStorage(): Promise<void> {
    try {
      const data = {
        products: Object.fromEntries(this.trackedProducts),
        alerts: Object.fromEntries(this.priceAlerts),
      };
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save data to storage:", error);
    }
  }

  /**
   * Get the total number of price alerts
   */
  private _getTotalAlerts(): number {
    let total = 0;
    for (const alerts of this.priceAlerts.values()) {
      total += alerts.length;
    }
    return total;
  }

  /**
   * Scan a barcode to get product information
   * @param barcodeData Barcode data
   */
  public async scanBarcode(barcodeData: string): Promise<ScanResult> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // In a real implementation, this would call a barcode lookup API
      // const result = await PriceTrackerModule.scanBarcode(barcodeData);
      // return result;
      
      // For demo purposes, return mock data
      const mockProduct = this._generateMockProduct(barcodeData);
      
      return {
        barcode: barcodeData,
        product: mockProduct,
        confidence: 0.95,
      };
    } catch (error) {
      console.error("Failed to scan barcode:", error);
      throw error;
    }
  }

  /**
   * Search for products by name
   * @param query Search query
   * @param limit Maximum number of results
   */
  public async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // In a real implementation, this would call a product search API
      // const results = await PriceTrackerModule.searchProducts(query, limit);
      // return results;
      
      // For demo purposes, return mock data
      const mockProducts: Product[] = [];
      
      for (let i = 0; i < limit; i++) {
        mockProducts.push(this._generateMockProduct(`${query}-${i}`, query));
      }
      
      return mockProducts;
    } catch (error) {
      console.error("Failed to search products:", error);
      throw error;
    }
  }

  /**
   * Track a product for price changes
   * @param product Product to track
   */
  public async trackProduct(product: Product): Promise<Product> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // Check if product is already tracked
      if (this.trackedProducts.has(product.id)) {
        return this.trackedProducts.get(product.id)!;
      }
      
      // In a real implementation, this would call an API to start tracking the product
      // const result = await PriceTrackerModule.trackProduct(product);
      
      // Add product to tracked products
      this.trackedProducts.set(product.id, {
        ...product,
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
      
      // Save to storage
      await this._saveToStorage();
      
      return this.trackedProducts.get(product.id)!;
    } catch (error) {
      console.error("Failed to track product:", error);
      throw error;
    }
  }

  /**
   * Stop tracking a product
   * @param productId ID of the product to stop tracking
   */
  public async untrackProduct(productId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // Check if product is tracked
      if (!this.trackedProducts.has(productId)) {
        return false;
      }
      
      // In a real implementation, this would call an API to stop tracking the product
      // await PriceTrackerModule.untrackProduct(productId);
      
      // Remove product from tracked products
      this.trackedProducts.delete(productId);
      
      // Remove all alerts for this product
      this.priceAlerts.delete(productId);
      
      // Save to storage
      await this._saveToStorage();
      
      return true;
    } catch (error) {
      console.error("Failed to untrack product:", error);
      throw error;
    }
  }

  /**
   * Get all tracked products
   */
  public async getTrackedProducts(): Promise<Product[]> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    return Array.from(this.trackedProducts.values());
  }

  /**
   * Get a tracked product by ID
   * @param productId ID of the product
   */
  public async getTrackedProduct(productId: string): Promise<Product | null> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    return this.trackedProducts.get(productId) || null;
  }

  /**
   * Create a price alert for a product
   * @param productId ID of the product
   * @param targetPrice Target price for the alert
   * @param options Additional options for the alert
   */
  public async createPriceAlert(
    productId: string,
    targetPrice: number,
    options: {
      notifyOnPriceIncrease?: boolean;
      notifyOnPriceDecrease?: boolean;
      notifyOnPercentageChange?: number;
      notifyEmail?: string;
      notifyPhone?: string;
      notifyPush?: boolean;
    } = {}
  ): Promise<PriceAlert> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // Check if product is tracked
      if (!this.trackedProducts.has(productId)) {
        throw new Error("Product is not tracked");
      }
      
      // In a real implementation, this would call an API to create a price alert
      // const result = await PriceTrackerModule.createPriceAlert(productId, targetPrice, options);
      
      // Create alert
      const alert: PriceAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        productId,
        targetPrice,
        notifyOnPriceIncrease: options.notifyOnPriceIncrease ?? false,
        notifyOnPriceDecrease: options.notifyOnPriceDecrease ?? true,
        notifyOnPercentageChange: options.notifyOnPercentageChange,
        notifyEmail: options.notifyEmail || this.config?.notificationEmail,
        notifyPhone: options.notifyPhone || this.config?.notificationPhone,
        notifyPush: options.notifyPush ?? this.config?.enablePushNotifications ?? false,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      
      // Add alert to price alerts
      if (!this.priceAlerts.has(productId)) {
        this.priceAlerts.set(productId, []);
      }
      
      this.priceAlerts.get(productId)!.push(alert);
      
      // Save to storage
      await this._saveToStorage();
      
      return alert;
    } catch (error) {
      console.error("Failed to create price alert:", error);
      throw error;
    }
  }

  /**
   * Update a price alert
   * @param alertId ID of the alert
   * @param updates Updates to apply to the alert
   */
  public async updatePriceAlert(
    alertId: string,
    updates: Partial<{
      targetPrice: number;
      notifyOnPriceIncrease: boolean;
      notifyOnPriceDecrease: boolean;
      notifyOnPercentageChange: number;
      notifyEmail: string;
      notifyPhone: string;
      notifyPush: boolean;
      status: "active" | "paused";
    }>
  ): Promise<PriceAlert | null> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // Find the alert
      let foundAlert: PriceAlert | null = null;
      let productId: string | null = null;
      
      for (const [pid, alerts] of this.priceAlerts.entries()) {
        const index = alerts.findIndex(a => a.id === alertId);
        if (index !== -1) {
          foundAlert = alerts[index];
          productId = pid;
          break;
        }
      }
      
      if (!foundAlert || !productId) {
        return null;
      }
      
      // In a real implementation, this would call an API to update the price alert
      // const result = await PriceTrackerModule.updatePriceAlert(alertId, updates);
      
      // Update alert
      const updatedAlert: PriceAlert = {
        ...foundAlert,
        ...updates,
        lastTriggeredAt: foundAlert.lastTriggeredAt,
      };
      
      // Replace alert in price alerts
      const alerts = this.priceAlerts.get(productId)!;
      const index = alerts.findIndex(a => a.id === alertId);
      alerts[index] = updatedAlert;
      
      // Save to storage
      await this._saveToStorage();
      
      return updatedAlert;
    } catch (error) {
      console.error("Failed to update price alert:", error);
      throw error;
    }
  }

  /**
   * Delete a price alert
   * @param alertId ID of the alert
   */
  public async deletePriceAlert(alertId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // Find the alert
      let productId: string | null = null;
      
      for (const [pid, alerts] of this.priceAlerts.entries()) {
        const index = alerts.findIndex(a => a.id === alertId);
        if (index !== -1) {
          productId = pid;
          break;
        }
      }
      
      if (!productId) {
        return false;
      }
      
      // In a real implementation, this would call an API to delete the price alert
      // await PriceTrackerModule.deletePriceAlert(alertId);
      
      // Remove alert from price alerts
      const alerts = this.priceAlerts.get(productId)!;
      const updatedAlerts = alerts.filter(a => a.id !== alertId);
      
      if (updatedAlerts.length === 0) {
        this.priceAlerts.delete(productId);
      } else {
        this.priceAlerts.set(productId, updatedAlerts);
      }
      
      // Save to storage
      await this._saveToStorage();
      
      return true;
    } catch (error) {
      console.error("Failed to delete price alert:", error);
      throw error;
    }
  }

  /**
   * Get all price alerts for a product
   * @param productId ID of the product
   */
  public async getPriceAlerts(productId: string): Promise<PriceAlert[]> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    return this.priceAlerts.get(productId) || [];
  }

  /**
   * Get all price alerts
   */
  public async getAllPriceAlerts(): Promise<PriceAlert[]> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    const allAlerts: PriceAlert[] = [];
    
    for (const alerts of this.priceAlerts.values()) {
      allAlerts.push(...alerts);
    }
    
    return allAlerts;
  }

  /**
   * Get price history for a product
   * @param productId ID of the product
   * @param days Number of days of history to retrieve
   */
  public async getPriceHistory(productId: string, days: number = 30): Promise<PriceHistory> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // Check if product is tracked
      if (!this.trackedProducts.has(productId)) {
        throw new Error("Product is not tracked");
      }
      
      // In a real implementation, this would call an API to get price history
      // const result = await PriceTrackerModule.getPriceHistory(productId, days);
      // return result;
      
      // For demo purposes, return mock data
      return this._generateMockPriceHistory(productId, days);
    } catch (error) {
      console.error("Failed to get price history:", error);
      throw error;
    }
  }

  /**
   * Compare prices for a product across different retailers
   * @param productId ID of the product
   */
  public async comparePrices(productId: string): Promise<PriceComparisonResult> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // Check if product is tracked
      if (!this.trackedProducts.has(productId)) {
        throw new Error("Product is not tracked");
      }
      
      const product = this.trackedProducts.get(productId)!;
      
      // In a real implementation, this would call an API to compare prices
      // const result = await PriceTrackerModule.comparePrices(productId);
      // return result;
      
      // For demo purposes, return mock data
      return this._generateMockPriceComparison(product);
    } catch (error) {
      console.error("Failed to compare prices:", error);
      throw error;
    }
  }

  /**
   * Check if there are any price alerts that have been triggered
   */
  public async checkPriceAlerts(): Promise<PriceAlert[]> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // In a real implementation, this would call an API to check price alerts
      // const result = await PriceTrackerModule.checkPriceAlerts();
      // return result;
      
      // For demo purposes, return mock data
      const triggeredAlerts: PriceAlert[] = [];
      
      // Simulate some random alerts being triggered
      for (const [productId, alerts] of this.priceAlerts.entries()) {
        for (const alert of alerts) {
          if (alert.status === "active" && Math.random() < 0.2) {
            const updatedAlert: PriceAlert = {
              ...alert,
              status: "triggered",
              lastTriggeredAt: new Date().toISOString(),
            };
            
            triggeredAlerts.push(updatedAlert);
            
            // Update the alert in the map
            const alertIndex = alerts.findIndex(a => a.id === alert.id);
            if (alertIndex !== -1) {
              alerts[alertIndex] = updatedAlert;
            }
          }
        }
      }
      
      // Save to storage if any alerts were triggered
      if (triggeredAlerts.length > 0) {
        await this._saveToStorage();
      }
      
      return triggeredAlerts;
    } catch (error) {
      console.error("Failed to check price alerts:", error);
      throw error;
    }
  }

  /**
   * Update prices for all tracked products
   */
  public async updatePrices(): Promise<Product[]> {
    if (!this.isInitialized) {
      throw new Error("Price Tracker service not initialized");
    }

    try {
      // In a real implementation, this would call an API to update prices
      // const result = await PriceTrackerModule.updatePrices();
      // return result;
      
      // For demo purposes, update prices randomly
      const updatedProducts: Product[] = [];
      
      for (const [productId, product] of this.trackedProducts.entries()) {
        // Randomly adjust price by -10% to +5%
        const priceChange = (Math.random() * 0.15) - 0.1;
        const newPrice = product.currentPrice * (1 + priceChange);
        
        const updatedProduct: Product = {
          ...product,
          currentPrice: parseFloat(newPrice.toFixed(2)),
          lastUpdated: new Date().toISOString(),
        };
        
        this.trackedProducts.set(productId, updatedProduct);
        updatedProducts.push(updatedProduct);
      }
      
      // Save to storage
      await this._saveToStorage();
      
      return updatedProducts;
    } catch (error) {
      console.error("Failed to update prices:", error);
      throw error;
    }
  }

  /**
   * Release resources when the service is no longer needed
   */
  public release(): void {
    if (!this.isInitialized) {
      return;
    }

    try {
      // In a real implementation, this would release resources
      // PriceTrackerModule.release();
      
      this.isInitialized = false;
      this.config = null;
      console.log("Price Tracker service released");
    } catch (error) {
      console.error("Failed to release Price Tracker service:", error);
    }
  }

  /**
   * Generate a mock product for testing
   * @param id Product ID
   * @param namePrefix Prefix for the product name
   */
  private _generateMockProduct(id: string, namePrefix: string = "Product"): Product {
    const brands = ["Apple", "Samsung", "Sony", "LG", "Bose", "Nike", "Adidas", "Amazon", "Google", "Microsoft"];
    const categories = ["Electronics", "Clothing", "Home", "Kitchen", "Sports", "Toys", "Books", "Beauty", "Health", "Grocery"];
    const retailers = ["Amazon", "Walmart", "Target", "Best Buy", "Newegg", "eBay", "Costco", "B&H", "Macy's", "Nordstrom"];
    
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const retailer = retailers[Math.floor(Math.random() * retailers.length)];
    
    const price = Math.floor(Math.random() * 900) + 100;
    
    return {
      id,
      name: `${brand} ${namePrefix} ${Math.floor(Math.random() * 1000)}`,
      description: `This is a ${category.toLowerCase()} product from ${brand}.`,
      imageUrl: `https://example.com/images/${id}.jpg`,
      currentPrice: price,
      currency: "USD",
      url: `https://example.com/products/${id}`,
      retailer,
      category,
      brand,
      model: `Model-${Math.floor(Math.random() * 1000)}`,
      sku: `SKU-${Math.floor(Math.random() * 10000)}`,
      barcode: id.includes("-") ? id.split("-")[0] : id,
      dateAdded: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Generate mock price history for testing
   * @param productId Product ID
   * @param days Number of days of history
   */
  private _generateMockPriceHistory(productId: string, days: number): PriceHistory {
    const product = this.trackedProducts.get(productId);
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    const prices: PriceHistory["prices"] = [];
    const currentPrice = product.currentPrice;
    const retailers = ["Amazon", "Walmart", "Target", "Best Buy", "Newegg"];
    
    // Generate price history for the specified number of days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Randomly adjust price by -20% to +10% from current price
      const priceChange = (Math.random() * 0.3) - 0.2;
      const price = parseFloat((currentPrice * (1 + priceChange)).toFixed(2));
      
      // Randomly select a retailer
      const retailer = retailers[Math.floor(Math.random() * retailers.length)];
      
      prices.push({
        date: date.toISOString().split("T")[0],
        price,
        retailer,
        inStock: Math.random() > 0.1, // 90% chance of being in stock
      });
    }
    
    // Sort by date (oldest first)
    prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate statistics
    const allPrices = prices.map(p => p.price);
    const lowestPrice = Math.min(...allPrices);
    const highestPrice = Math.max(...allPrices);
    const averagePrice = parseFloat((allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length).toFixed(2));
    
    return {
      productId,
      prices,
      lowestPrice,
      highestPrice,
      averagePrice,
    };
  }

  /**
   * Generate mock price comparison for testing
   * @param product Product
   */
  private _generateMockPriceComparison(product: Product): PriceComparisonResult {
    const retailers = [
      { name: "Amazon", price: product.currentPrice, inStock: true },
      { name: "Walmart", price: product.currentPrice * 0.95, inStock: true },
      { name: "Target", price: product.currentPrice * 1.05, inStock: true },
      { name: "Best Buy", price: product.currentPrice * 1.02, inStock: true },
      { name: "Newegg", price: product.currentPrice * 0.98, inStock: false },
    ];
    
    // Add shipping costs
    const retailersWithShipping = retailers.map(r => ({
      name: r.name,
      price: r.price,
      currency: product.currency,
      url: `https://example.com/${r.name.toLowerCase()}/products/${product.id}`,
      inStock: r.inStock,
      shippingCost: r.name === "Amazon" ? 0 : Math.floor(Math.random() * 10) + 5,
      totalPrice: r.price + (r.name === "Amazon" ? 0 : Math.floor(Math.random() * 10) + 5),
      lastUpdated: new Date().toISOString(),
    }));
    
    // Sort by total price
    retailersWithShipping.sort((a, b) => a.totalPrice - b.totalPrice);
    
    // Get price range
    const prices = retailersWithShipping.map(r => r.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    return {
      product,
      retailers: retailersWithShipping,
      lowestPrice: {
        retailer: retailersWithShipping[0].name,
        price: retailersWithShipping[0].price,
        totalPrice: retailersWithShipping[0].totalPrice,
        url: retailersWithShipping[0].url,
      },
      priceRange: {
        min,
        max,
        difference: max - min,
        percentageDifference: parseFloat(((max - min) / min * 100).toFixed(2)),
      },
    };
  }
}