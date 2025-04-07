import { useState, useCallback } from 'react';
import { ViroCameraARHitTestEvent, ViroARHitTestResult } from '../Types/ViroEvents';

/**
 * A hook to manage AR hit test results
 * 
 * @returns {Object} An object containing hit test results and handler
 */
export const useARHitTest = () => {
  const [hitTestResults, setHitTestResults] = useState<ViroARHitTestResult[]>([]);
  const [cameraOrientation, setCameraOrientation] = useState<number[]>([]);

  const onARHitTest = useCallback((event: ViroCameraARHitTestEvent) => {
    setHitTestResults(event.hitTestResults);
    setCameraOrientation(event.cameraOrientation);
    return event;
  }, []);

  return {
    hitTestResults,
    cameraOrientation,
    onARHitTest,
    hasHitResults: hitTestResults.length > 0,
  };
};