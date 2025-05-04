/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroRealEstateAR
 */
import * as React from "react";
import { ViewProps } from "react-native";
import { ViroAnimation } from "../Animation/ViroAnimations";
import { ViroARScene } from "../AR/ViroARScene";
import { Viro3DPoint } from "../Types/ViroUtils";
import { ViroRealEstateService, GeoLocation, PropertyDetails, PropertySummary, RealEstateAPIConfig } from "./ViroRealEstateService";
type Props = ViewProps & {
    /**
     * Real Estate API configuration
     */
    apiConfig: RealEstateAPIConfig;
    /**
     * Flag to enable/disable property detection
     */
    enabled?: boolean;
    /**
     * Maximum distance in meters to show properties
     */
    maxDistance?: number;
    /**
     * Maximum number of properties to show
     */
    maxProperties?: number;
    /**
     * Callback when properties are detected
     */
    onPropertiesDetected?: (properties: PropertySummary[]) => void;
    /**
     * Callback when a property is selected/tapped
     */
    onPropertySelected?: (property: PropertyDetails) => void;
    /**
     * Flag to show/hide visual indicators for properties
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
     * Flag to show/hide property labels
     */
    showLabels?: boolean;
    /**
     * Custom renderer for property indicators
     */
    renderIndicator?: (property: PropertySummary) => React.ReactNode;
    /**
     * Custom renderer for property labels
     */
    renderLabel?: (property: PropertySummary) => React.ReactNode;
    /**
     * Custom renderer for property details
     */
    renderPropertyDetails?: (property: PropertyDetails) => React.ReactNode;
    /**
     * Interval in milliseconds for updating property data
     */
    updateInterval?: number;
    /**
     * Flag to enable/disable automatic updates
     */
    autoUpdateEnabled?: boolean;
    /**
     * Flag to show properties for sale only
     */
    showForSaleOnly?: boolean;
    /**
     * Flag to show properties for rent only
     */
    showForRentOnly?: boolean;
    /**
     * Minimum price filter
     */
    minPrice?: number;
    /**
     * Maximum price filter
     */
    maxPrice?: number;
    /**
     * Minimum bedrooms filter
     */
    minBedrooms?: number;
    /**
     * Maximum bedrooms filter
     */
    maxBedrooms?: number;
    /**
     * Minimum bathrooms filter
     */
    minBathrooms?: number;
    /**
     * Maximum bathrooms filter
     */
    maxBathrooms?: number;
    /**
     * Property type filter
     */
    propertyTypes?: string[];
};
type State = {
    properties: PropertySummary[];
    selectedProperty: PropertyDetails | null;
    isLoading: boolean;
    currentLocation: GeoLocation | null;
    showPropertyDetails: boolean;
    error: string | null;
};
/**
 * ViroRealEstateAR is a component that uses GPS and Real Estate API to display
 * property information in AR.
 */
export declare class ViroRealEstateAR extends React.Component<Props, State> {
    _updateInterval: NodeJS.Timeout | null;
    _arScene: ViroARScene | null;
    _realEstateService: ViroRealEstateService;
    _locationListener: ((location: GeoLocation) => void) | null;
    constructor(props: Props);
    componentDidMount(): Promise<void>;
    componentDidUpdate(prevProps: Props): void;
    componentWillUnmount(): void;
    _onLocationUpdate(location: GeoLocation): void;
    _startPropertyDetection: () => void;
    _stopPropertyDetection: () => void;
    _updateProperties: () => Promise<void>;
    _onPropertySelected: (property: PropertySummary) => Promise<void>;
    _getPositionForProperty(property: PropertySummary): Viro3DPoint;
    _renderPropertyIndicators(): React.JSX.Element[] | null;
    _renderLabel(property: PropertySummary, index: number): string | number | boolean | Iterable<React.ReactNode> | React.JSX.Element | null | undefined;
    _renderPropertyDetails(): React.JSX.Element | null;
    _onSceneTap: () => void;
    render(): React.JSX.Element;
}
export {};
