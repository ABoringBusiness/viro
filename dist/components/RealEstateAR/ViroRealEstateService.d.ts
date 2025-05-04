/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroRealEstateService
 */
export type RealEstateAPIConfig = {
    apiKey: string;
    baseUrl?: string;
};
export type GeoLocation = {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
    timestamp?: number;
};
export type Address = {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    formattedAddress: string;
};
export type PropertyDetails = {
    propertyId: string;
    address: Address;
    price: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    lotSize: number;
    yearBuilt: number;
    propertyType: string;
    description: string;
    features: string[];
    images: string[];
    schools: School[];
    taxInfo: TaxInfo;
    zestimate?: number;
    rentZestimate?: number;
    walkScore?: number;
    transitScore?: number;
    bikeScore?: number;
    nearbyAmenities: Amenity[];
    saleHistory: SaleHistoryItem[];
    listingStatus: "for_sale" | "for_rent" | "sold" | "off_market";
    daysOnMarket?: number;
    virtualTourUrl?: string;
    contactInfo?: ContactInfo;
};
export type School = {
    name: string;
    type: "elementary" | "middle" | "high" | "private";
    rating: number;
    distance: number;
    grades: string;
};
export type TaxInfo = {
    taxYear: number;
    taxAmount: number;
    assessedValue: number;
};
export type Amenity = {
    name: string;
    type: string;
    distance: number;
};
export type SaleHistoryItem = {
    date: string;
    price: number;
    event: "sold" | "listed" | "price_changed";
};
export type ContactInfo = {
    agentName?: string;
    agentPhone?: string;
    agentEmail?: string;
    brokerageName?: string;
};
export type PropertySearchParams = {
    location?: GeoLocation;
    address?: string;
    radius?: number;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minSquareFeet?: number;
    maxSquareFeet?: number;
    propertyType?: string[];
    listingStatus?: ("for_sale" | "for_rent" | "sold" | "off_market")[];
    limit?: number;
    offset?: number;
};
export type PropertySearchResult = {
    properties: PropertySummary[];
    totalResults: number;
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
};
export type PropertySummary = {
    propertyId: string;
    address: Address;
    price: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    propertyType: string;
    listingStatus: "for_sale" | "for_rent" | "sold" | "off_market";
    thumbnail: string;
    latitude: number;
    longitude: number;
};
/**
 * Service class for handling GPS and Real Estate API integration
 */
export declare class ViroRealEstateService {
    private static instance;
    private isInitialized;
    private config;
    private watchId;
    private currentLocation;
    private locationListeners;
    private constructor();
    /**
     * Get the singleton instance of the service
     */
    static getInstance(): ViroRealEstateService;
    /**
     * Initialize the Real Estate API
     * @param config Configuration for the Real Estate API
     */
    initialize(config: RealEstateAPIConfig): Promise<boolean>;
    /**
     * Start watching the user's location
     * @param onLocationUpdate Callback for location updates
     */
    startWatchingLocation(onLocationUpdate?: (location: GeoLocation) => void): Promise<boolean>;
    /**
     * Stop watching the user's location
     */
    stopWatchingLocation(): void;
    /**
     * Get the current location
     */
    getCurrentLocation(): Promise<GeoLocation>;
    /**
     * Get property details by ID
     * @param propertyId Property ID
     */
    getPropertyDetails(propertyId: string): Promise<PropertyDetails>;
    /**
     * Search for properties based on parameters
     * @param params Search parameters
     */
    searchProperties(params: PropertySearchParams): Promise<PropertySearchResult>;
    /**
     * Get properties near a location
     * @param location Location to search near
     * @param radius Radius in meters
     * @param limit Maximum number of results
     */
    getPropertiesNearLocation(location: GeoLocation, radius?: number, limit?: number): Promise<PropertySummary[]>;
    /**
     * Get properties near the current location
     * @param radius Radius in meters
     * @param limit Maximum number of results
     */
    getPropertiesNearCurrentLocation(radius?: number, limit?: number): Promise<PropertySummary[]>;
    /**
     * Get property details by address
     * @param address Address to search for
     */
    getPropertyDetailsByAddress(address: string): Promise<PropertyDetails | null>;
    /**
     * Geocode an address to get its coordinates
     * @param address Address to geocode
     */
    geocodeAddress(address: string): Promise<GeoLocation | null>;
    /**
     * Reverse geocode coordinates to get an address
     * @param location Location to reverse geocode
     */
    reverseGeocode(location: GeoLocation): Promise<Address | null>;
    /**
     * Release resources when the service is no longer needed
     */
    release(): void;
    /**
     * Add a location listener
     * @param listener Listener function
     */
    addLocationListener(listener: (location: GeoLocation) => void): void;
    /**
     * Remove a location listener
     * @param listener Listener function to remove
     */
    removeLocationListener(listener: (location: GeoLocation) => void): void;
    /**
     * Notify all location listeners
     * @param location Location to notify about
     */
    private notifyLocationListeners;
    /**
     * Get mock property details for testing
     * @param propertyId Property ID
     */
    private getMockPropertyDetails;
    /**
     * Get mock property search results for testing
     * @param params Search parameters
     */
    private getMockPropertySearchResult;
}
