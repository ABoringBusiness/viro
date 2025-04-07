import * as React from 'react';
import { requireNativeComponent, ViewProps, NativeSyntheticEvent } from 'react-native';
import { Viro3DPoint } from '../Types/ViroUtils';

export type ViroLidarPointCloudProps = ViewProps & {
  /**
   * Enables or disables the point cloud visualization
   */
  visible?: boolean;
  
  /**
   * The maximum number of points to render in the point cloud
   */
  maxPoints?: number;
  
  /**
   * The size of each point in the point cloud
   */
  pointSize?: number;
  
  /**
   * The color of the points in the point cloud
   */
  pointColor?: string;
  
  /**
   * Called when the point cloud is updated
   */
  onPointCloudUpdate?: (event: NativeSyntheticEvent<ViroLidarPointCloudUpdateEvent>) => void;
};

export type ViroLidarPointCloudUpdateEvent = {
  /**
   * The number of points in the point cloud
   */
  pointCount: number;
  
  /**
   * The bounding box of the point cloud
   */
  boundingBox?: {
    min: Viro3DPoint;
    max: Viro3DPoint;
  };
};

/**
 * ViroLidarPointCloud is a component that visualizes the LiDAR point cloud on supported iOS devices.
 * This component is only available on iOS devices with LiDAR sensors (iPhone 12 Pro, iPad Pro 2020+).
 */
export const ViroLidarPointCloud = (props: ViroLidarPointCloudProps) => {
  const { onPointCloudUpdate, ...rest } = props;
  
  const _onPointCloudUpdate = (event: NativeSyntheticEvent<ViroLidarPointCloudUpdateEvent>) => {
    onPointCloudUpdate && onPointCloudUpdate(event);
  };
  
  return (
    <VRTLidarPointCloud
      {...rest}
      onPointCloudUpdate={onPointCloudUpdate ? _onPointCloudUpdate : undefined}
    />
  );
};

const VRTLidarPointCloud = requireNativeComponent<ViroLidarPointCloudProps>(
  'VRTLidarPointCloud'
);