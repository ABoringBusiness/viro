"use strict";
/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroRealEstateARMaterials
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ViroMaterials_1 = require("../Material/ViroMaterials");
// Register materials for property indicators and cards
ViroMaterials_1.ViroMaterials.createMaterials({
    propertyIndicator: {
        lightingModel: "Lambert",
        diffuseColor: "#FF5722",
        shininess: 0.5,
        fresnelExponent: 0.5,
        bloomThreshold: 0.5,
    },
    selectedPropertyIndicator: {
        lightingModel: "Lambert",
        diffuseColor: "#4CAF50",
        shininess: 0.7,
        fresnelExponent: 0.7,
        bloomThreshold: 0.7,
    },
    propertyCard: {
        lightingModel: "Lambert",
        diffuseColor: "#FFFFFF",
        shininess: 0.3,
        fresnelExponent: 0.3,
        bloomThreshold: 0.3,
    },
    forSaleTag: {
        lightingModel: "Lambert",
        diffuseColor: "#2196F3",
        shininess: 0.5,
        fresnelExponent: 0.5,
        bloomThreshold: 0.5,
    },
    forRentTag: {
        lightingModel: "Lambert",
        diffuseColor: "#9C27B0",
        shininess: 0.5,
        fresnelExponent: 0.5,
        bloomThreshold: 0.5,
    },
    soldTag: {
        lightingModel: "Lambert",
        diffuseColor: "#F44336",
        shininess: 0.5,
        fresnelExponent: 0.5,
        bloomThreshold: 0.5,
    },
});
exports.default = ViroMaterials_1.ViroMaterials;
