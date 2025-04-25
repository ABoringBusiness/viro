/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroPriceTrackerMaterials
 */

import { ViroMaterials } from "../Material/ViroMaterials";

// Register materials for price tracker
ViroMaterials.createMaterials({
  priceDecreaseIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#4CAF50",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  priceIncreaseIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#F44336",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  priceUnchangedIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#FFFFFF",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  productCard: {
    lightingModel: "Lambert",
    diffuseColor: "#FFFFFF",
    shininess: 0.3,
    fresnelExponent: 0.3,
    bloomThreshold: 0.3,
  },
  alertIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#FFC107",
    shininess: 0.7,
    fresnelExponent: 0.7,
    bloomThreshold: 0.7,
  },
  bestPriceIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#2196F3",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
});

export default ViroMaterials;