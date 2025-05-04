"use strict";
/**
 * Copyright (c) 2025-present, ReactVision, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ViroObjectRecognitionMaterials
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ViroMaterials_1 = require("../Material/ViroMaterials");
// Register materials for object recognition indicators
ViroMaterials_1.ViroMaterials.createMaterials({
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
exports.default = ViroMaterials_1.ViroMaterials;
