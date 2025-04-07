import { useState, useCallback } from 'react';
import { ViroTrackingState, ViroTrackingReason, ViroTrackingUpdatedEvent } from '../Types/ViroEvents';
import { ViroTrackingStateConstants, ViroARTrackingReasonConstants } from '../ViroConstants';

/**
 * A hook to manage AR tracking state
 * 
 * @returns {Object} An object containing tracking state information and handler
 */
export const useARTracking = () => {
  const [trackingState, setTrackingState] = useState<ViroTrackingState>(
    ViroTrackingStateConstants.TRACKING_UNAVAILABLE
  );
  const [trackingReason, setTrackingReason] = useState<ViroTrackingReason>(
    ViroARTrackingReasonConstants.TRACKING_REASON_NONE
  );
  const [isTracking, setIsTracking] = useState(false);

  const onTrackingUpdated = useCallback((event: ViroTrackingUpdatedEvent) => {
    setTrackingState(event.state);
    setTrackingReason(event.reason);
    setIsTracking(event.state === ViroTrackingStateConstants.TRACKING_NORMAL);
    return event;
  }, []);

  return {
    trackingState,
    trackingReason,
    isTracking,
    onTrackingUpdated,
  };
};