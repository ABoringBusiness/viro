/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroVideoRecorderMaterials
 */

import { ViroMaterials } from "../Material/ViroMaterials";

// Register materials for video recorder
ViroMaterials.createMaterials({
  recordingIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#FF0000",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  pausedIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#FFA500",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  exportingIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#2196F3",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  aiEditingIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#9C27B0",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  videoCard: {
    lightingModel: "Lambert",
    diffuseColor: "#FFFFFF",
    shininess: 0.3,
    fresnelExponent: 0.3,
    bloomThreshold: 0.3,
  },
});

export default ViroMaterials;