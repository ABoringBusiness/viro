/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroFoodRecipeMaterials
 */

import { ViroMaterials } from "../Material/ViroMaterials";

// Register materials for food recipe
ViroMaterials.createMaterials({
  foodIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#4CAF50",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  recipeCard: {
    lightingModel: "Lambert",
    diffuseColor: "#FFFFFF",
    shininess: 0.3,
    fresnelExponent: 0.3,
    bloomThreshold: 0.3,
  },
  nutritionIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#2196F3",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  ingredientIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#FFC107",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  stepIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#9C27B0",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
});

export default ViroMaterials;