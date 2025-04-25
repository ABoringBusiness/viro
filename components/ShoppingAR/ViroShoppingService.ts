/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroShoppingService
 */

import { NativeModules, Platform } from "react-native";

// This would be the actual native module in a real implementation
// const ShoppingModule = NativeModules.ViroShoppingModule;

export type ShoppingAPIConfig = {
  apiKey?: string;
  apiUrl?: string;
  pythonAgentPath?: string;
};

export type DetectedProduct = {
  id?: string;
  name: string;
  confidence: number;
  type: string;
  boundingBox?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  attributes: Record<string, any>;
};

export type ProductSearchResult = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  url: string;
  image_url: string;
  platform: string;
  rating: number;
  reviews_count: number;
  relevance: number;
  category: string;
  brand: string;
  availability: string;
  shipping: {
    price: number;
    is_free: boolean;
    estimated_delivery: string;
  };
};

export type PriceTrackingInfo = {
  tracking_id: string;
  product_id: string;
  platform: string;
  target_price?: number;
  notify_email?: string;
  notify_phone?: string;
  created_at: string;
  status: string;
};

export type PriceHistoryItem = {
  date: string;
  price: number;
  currency: string;
  in_stock: boolean;
};

export type PriceHistory = {
  product_id: string;
  platform: string;
  currency: string;
  price_history: PriceHistoryItem[];
  lowest_price: number;
  highest_price: number;
  average_price: number;
  current_price: number;
};

export type BuyingOption = {
  price: number;
  availability: string;
  condition?: string;
  shipping: string;
  warranty: string;
  sellers: {
    name: string;
    rating: number;
    price: number;
    condition?: string;
  }[];
};

export type BuyingOptions = {
  product_name: string;
  options: {
    new?: BuyingOption;
    used?: BuyingOption;
    refurbished?: BuyingOption;
  };
  best_value: string;
  recommendation: string;
};

/**
 * Service class for handling Shopping API integration
 */
export class ViroShoppingService {
  private static instance: ViroShoppingService;
  private isInitialized: boolean = false;
  private config: ShoppingAPIConfig | null = null;
  private apiUrl: string | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of the service
   */
  public static getInstance(): ViroShoppingService {
    if (!ViroShoppingService.instance) {
      ViroShoppingService.instance = new ViroShoppingService();
    }
    return ViroShoppingService.instance;
  }

  /**
   * Initialize the Shopping API
   * @param config Configuration for the Shopping API
   */
  public async initialize(config: ShoppingAPIConfig): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      this.config = config;
      
      // Set API URL
      this.apiUrl = config.apiUrl || "http://localhost:5000";
      
      // In a real implementation, this would initialize the native module
      // await ShoppingModule.initialize(config);
      
      // Check if the API is available
      const response = await this.checkApiHealth();
      
      this.isInitialized = response.status === "ok";
      console.log("Shopping API initialized");
      return this.isInitialized;
    } catch (error) {
      console.error("Failed to initialize Shopping API:", error);
      return false;
    }
  }

  /**
   * Check if the API is available
   */
  private async checkApiHealth(): Promise<{ status: string; apis: string[] }> {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error("Failed to check API health:", error);
      return { status: "error", apis: [] };
    }
  }

  /**
   * Detect products in an image
   * @param imageBase64 Base64 encoded image data
   * @param options Detection options
   */
  public async detectProducts(
    imageBase64: string,
    options: {
      confidence_threshold?: number;
      max_results?: number;
    } = {}
  ): Promise<DetectedProduct[]> {
    if (!this.isInitialized || !this.apiUrl) {
      throw new Error("Shopping API not initialized");
    }

    try {
      // In a real implementation, this would call the API
      const response = await fetch(`${this.apiUrl}/detect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_base64: imageBase64,
          options,
        }),
      });
      
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error("Failed to detect products:", error);
      
      // For demo purposes, return mock data
      return this.getMockDetectedProducts();
    }
  }

  /**
   * Search for products
   * @param query Search query
   * @param options Search options
   */
  public async searchProducts(
    query: string,
    options: {
      category?: string;
      min_price?: number;
      max_price?: number;
      max_results?: number;
    } = {}
  ): Promise<ProductSearchResult[]> {
    if (!this.isInitialized || !this.apiUrl) {
      throw new Error("Shopping API not initialized");
    }

    try {
      // In a real implementation, this would call the API
      const response = await fetch(`${this.apiUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          options,
        }),
      });
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Failed to search products:", error);
      
      // For demo purposes, return mock data
      return this.getMockSearchResults(query);
    }
  }

  /**
   * Track price for a product
   * @param productId Product ID
   * @param platform Shopping platform
   * @param options Tracking options
   */
  public async trackPrice(
    productId: string,
    platform: string,
    options: {
      target_price?: number;
      notify_email?: string;
      notify_phone?: string;
    } = {}
  ): Promise<PriceTrackingInfo> {
    if (!this.isInitialized || !this.apiUrl) {
      throw new Error("Shopping API not initialized");
    }

    try {
      // In a real implementation, this would call the API
      const response = await fetch(`${this.apiUrl}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          platform,
          options,
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error("Failed to track price:", error);
      
      // For demo purposes, return mock data
      return {
        tracking_id: `track-${Date.now()}-${productId}`,
        product_id: productId,
        platform,
        target_price: options.target_price,
        notify_email: options.notify_email,
        notify_phone: options.notify_phone,
        created_at: new Date().toISOString(),
        status: "active",
      };
    }
  }

  /**
   * Get price history for a product
   * @param productId Product ID
   * @param platform Shopping platform
   * @param days Number of days of history to retrieve
   */
  public async getPriceHistory(
    productId: string,
    platform: string,
    days: number = 30
  ): Promise<PriceHistory> {
    if (!this.isInitialized || !this.apiUrl) {
      throw new Error("Shopping API not initialized");
    }

    try {
      // In a real implementation, this would call the API
      const response = await fetch(
        `${this.apiUrl}/history?product_id=${encodeURIComponent(productId)}&platform=${encodeURIComponent(platform)}&days=${days}`
      );
      
      return await response.json();
    } catch (error) {
      console.error("Failed to get price history:", error);
      
      // For demo purposes, return mock data
      return this.getMockPriceHistory(productId, platform, days);
    }
  }

  /**
   * Find similar products
   * @param productId Product ID
   * @param platform Shopping platform
   * @param maxResults Maximum number of results
   */
  public async findSimilarProducts(
    productId: string,
    platform: string,
    maxResults: number = 5
  ): Promise<ProductSearchResult[]> {
    if (!this.isInitialized || !this.apiUrl) {
      throw new Error("Shopping API not initialized");
    }

    try {
      // In a real implementation, this would call the API
      const response = await fetch(
        `${this.apiUrl}/similar?product_id=${encodeURIComponent(productId)}&platform=${encodeURIComponent(platform)}&max_results=${maxResults}`
      );
      
      const data = await response.json();
      return data.similar_products || [];
    } catch (error) {
      console.error("Failed to find similar products:", error);
      
      // For demo purposes, return mock data
      return this.getMockSearchResults(`Product ${productId}`);
    }
  }

  /**
   * Find the best deal for a product
   * @param productName Product name
   * @param maxResultsPerPlatform Maximum number of results per platform
   */
  public async findBestDeal(
    productName: string,
    maxResultsPerPlatform: number = 3
  ): Promise<ProductSearchResult & { comparison: any }> {
    if (!this.isInitialized || !this.apiUrl) {
      throw new Error("Shopping API not initialized");
    }

    try {
      // In a real implementation, this would call the API
      const response = await fetch(
        `${this.apiUrl}/best-deal?product_name=${encodeURIComponent(productName)}&max_results_per_platform=${maxResultsPerPlatform}`
      );
      
      return await response.json();
    } catch (error) {
      console.error("Failed to find best deal:", error);
      
      // For demo purposes, return mock data
      const mockResults = this.getMockSearchResults(productName);
      const bestDeal = mockResults[0];
      
      return {
        ...bestDeal,
        comparison: {
          average_price: 100,
          savings: 20,
          savings_percentage: 20,
          total_results: 10,
          platforms_searched: ["Amazon", "Walmart", "eBay"],
        },
      };
    }
  }

  /**
   * Get buying options for a product
   * @param productName Product name
   */
  public async getBuyingOptions(productName: string): Promise<BuyingOptions> {
    if (!this.isInitialized || !this.apiUrl) {
      throw new Error("Shopping API not initialized");
    }

    try {
      // In a real implementation, this would call the API
      const response = await fetch(
        `${this.apiUrl}/buying-options?product_name=${encodeURIComponent(productName)}`
      );
      
      return await response.json();
    } catch (error) {
      console.error("Failed to get buying options:", error);
      
      // For demo purposes, return mock data
      return this.getMockBuyingOptions(productName);
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
      // ShoppingModule.release();
      
      this.isInitialized = false;
      this.config = null;
      this.apiUrl = null;
      console.log("Shopping API released");
    } catch (error) {
      console.error("Failed to release Shopping API:", error);
    }
  }

  /**
   * Get mock detected products for testing
   */
  private getMockDetectedProducts(): DetectedProduct[] {
    return [
      {
        name: "Nike Air Max",
        confidence: 0.95,
        type: "shoe",
        boundingBox: {
          minX: 0.2,
          minY: 0.6,
          maxX: 0.8,
          maxY: 0.9,
        },
        attributes: {
          brand: "Nike",
          category: "Footwear",
          color: "Black/White",
        },
      },
      {
        name: "iPhone",
        confidence: 0.92,
        type: "electronics",
        boundingBox: {
          minX: 0.3,
          minY: 0.2,
          maxX: 0.7,
          maxY: 0.5,
        },
        attributes: {
          brand: "Apple",
          category: "Smartphone",
          model: "iPhone 13",
        },
      },
      {
        name: "Adidas T-shirt",
        confidence: 0.88,
        type: "clothing",
        boundingBox: {
          minX: 0.1,
          minY: 0.3,
          maxX: 0.4,
          maxY: 0.7,
        },
        attributes: {
          brand: "Adidas",
          category: "Apparel",
          color: "Blue",
        },
      },
    ];
  }

  /**
   * Get mock search results for testing
   */
  private getMockSearchResults(query: string): ProductSearchResult[] {
    const results: ProductSearchResult[] = [];
    
    for (let i = 0; i < 5; i++) {
      results.push({
        id: `product-${i}`,
        name: `${query} ${String.fromCharCode(65 + i)}`,
        description: `This is a high-quality ${query} with premium features.`,
        price: 99.99 - (i * 10),
        currency: "USD",
        url: `https://example.com/products/${query.toLowerCase().replace(/\s+/g, "-")}-${i}`,
        image_url: `https://example.com/images/${query.toLowerCase().replace(/\s+/g, "-")}-${i}.jpg`,
        platform: ["Amazon", "Walmart", "eBay", "Target", "BestBuy"][i % 5],
        rating: 4.5 - (i * 0.1),
        reviews_count: 100 - (i * 10),
        relevance: 0.95 - (i * 0.05),
        category: "Electronics",
        brand: `Brand ${String.fromCharCode(65 + i)}`,
        availability: i < 3 ? "In Stock" : "Limited Stock",
        shipping: {
          price: i === 0 ? 0 : 5.99,
          is_free: i === 0,
          estimated_delivery: "3-5 business days",
        },
      });
    }
    
    return results;
  }

  /**
   * Get mock price history for testing
   */
  private getMockPriceHistory(productId: string, platform: string, days: number): PriceHistory {
    const priceHistory: PriceHistoryItem[] = [];
    const basePrice = 99.99;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate a price with some random variation
      let price = basePrice * (1 + (Math.random() - 0.5) * 0.2);
      
      // Add some sales events
      if (i % 7 === 0) {  // Weekly sales
        price = price * 0.9;
      }
      if (i % 30 === 0) {  // Monthly big sale
        price = price * 0.8;
      }
      
      priceHistory.push({
        date: date.toISOString().split("T")[0],
        price: Math.round(price * 100) / 100,
        currency: "USD",
        in_stock: Math.random() > 0.1,  // 90% chance of being in stock
      });
    }
    
    // Sort by date (oldest first)
    priceHistory.sort((a, b) => a.date.localeCompare(b.date));
    
    const prices = priceHistory.map(item => item.price);
    
    return {
      product_id: productId,
      platform,
      currency: "USD",
      price_history: priceHistory,
      lowest_price: Math.min(...prices),
      highest_price: Math.max(...prices),
      average_price: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      current_price: priceHistory[priceHistory.length - 1].price,
    };
  }

  /**
   * Get mock buying options for testing
   */
  private getMockBuyingOptions(productName: string): BuyingOptions {
    const newPrice = 99.99;
    
    return {
      product_name: productName,
      options: {
        new: {
          price: newPrice,
          availability: "In Stock",
          shipping: "Free",
          warranty: "1 Year Manufacturer Warranty",
          sellers: [
            { name: "Official Store", rating: 4.8, price: newPrice },
            { name: "MegaRetailer", rating: 4.6, price: newPrice * 1.05 },
            { name: "ElectronicsPlus", rating: 4.5, price: newPrice * 1.02 },
          ],
        },
        used: {
          price: newPrice * 0.7,
          availability: "Limited Stock",
          condition: "Good",
          shipping: "$5.99",
          warranty: "30 Day Seller Warranty",
          sellers: [
            { name: "TechReseller", rating: 4.3, price: newPrice * 0.7, condition: "Good" },
            { name: "ValueDeals", rating: 4.1, price: newPrice * 0.65, condition: "Acceptable" },
            { name: "QualityUsed", rating: 4.4, price: newPrice * 0.75, condition: "Very Good" },
          ],
        },
        refurbished: {
          price: newPrice * 0.85,
          availability: "In Stock",
          condition: "Certified Refurbished",
          shipping: "Free",
          warranty: "90 Day Warranty",
          sellers: [
            { name: "RefurbMaster", rating: 4.5, price: newPrice * 0.85 },
            { name: "RenewTech", rating: 4.4, price: newPrice * 0.82 },
            { name: "CertifiedRenew", rating: 4.6, price: newPrice * 0.88 },
          ],
        },
      },
      best_value: "refurbished",
      recommendation: "The refurbished option offers the best value with a 90-day warranty and 15% savings over new.",
    };
  }
}