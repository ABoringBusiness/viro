/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroShoppingARMaterials
 */

import { ViroMaterials } from "../Material/ViroMaterials";

// Register materials for product indicators and cards
ViroMaterials.createMaterials({
  productIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#4CAF50",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  selectedProductIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#2196F3",
    shininess: 0.7,
    fresnelExponent: 0.7,
    bloomThreshold: 0.7,
  },
  productCard: {
    lightingModel: "Lambert",
    diffuseColor: "#FFFFFF",
    shininess: 0.3,
    fresnelExponent: 0.3,
    bloomThreshold: 0.3,
  },
  bestDealTag: {
    lightingModel: "Lambert",
    diffuseColor: "#4CAF50",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  saleTag: {
    lightingModel: "Lambert",
    diffuseColor: "#F44336",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  priceHistoryGraph: {
    lightingModel: "Lambert",
    diffuseColor: "#FFFFFF",
    shininess: 0.3,
    fresnelExponent: 0.3,
    bloomThreshold: 0.3,
  },
});

export default ViroMaterials;