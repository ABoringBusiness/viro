/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroObjectRecognitionMaterials
 */

import { ViroMaterials } from "../Material/ViroMaterials";

// Register materials for object recognition indicators
ViroMaterials.createMaterials({
  objectIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#FFFFFF",
    shininess: 0.5,
    fresnelExponent: 0.5,
    bloomThreshold: 0.5,
  },
  selectedObjectIndicator: {
    lightingModel: "Lambert",
    diffuseColor: "#00FF00",
    shininess: 0.7,
    fresnelExponent: 0.7,
    bloomThreshold: 0.7,
  },
});

export default ViroMaterials;