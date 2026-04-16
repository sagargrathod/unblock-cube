import { useSharedValue, withTiming, withDelay, Easing, runOnJS } from 'react-native-reanimated';
import { useCallback } from 'react';

export const usePouringAnimation = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const streamProgress = useSharedValue(0);
  const sourceHeight = useSharedValue(1);
  const destHeight = useSharedValue(0);

  const liftTube = useCallback(() => {
    translateY.value = withTiming(-60, { duration: 300 });
  }, [translateY]);

  const moveTubeToTarget = useCallback((targetX: number, targetY: number) => {
    translateX.value = withTiming(targetX, {
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1)
    });
    translateY.value = withTiming(targetY - 120, { duration: 500 });
  }, [translateX, translateY]);

  const tiltTube = useCallback((direction: 'left' | 'right') => {
    const angle = direction === 'left' ? -50 : 50;
    rotateZ.value = withTiming(angle, { duration: 400 });
  }, [rotateZ]);

  const animateLiquidPour = useCallback((duration: number = 600, heightAmount: number = 0.25, onComplete?: () => void) => {
    streamProgress.value = withTiming(1, { duration }, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    });

    // Liquid Level Animation
    sourceHeight.value = withTiming(sourceHeight.value - heightAmount, { duration });
    destHeight.value = withTiming(destHeight.value + heightAmount, { duration });
  }, [streamProgress, sourceHeight, destHeight]);

  const returnTube = useCallback(() => {
    rotateZ.value = withTiming(0, { duration: 300 });
    translateX.value = withDelay(400, withTiming(0, { duration: 500 }));
    translateY.value = withDelay(400, withTiming(0, { duration: 500 }));
    streamProgress.value = withTiming(0, { duration: 200 });
  }, [rotateZ, translateX, translateY, streamProgress]);

  return {
    translateX,
    translateY,
    rotateZ,
    streamProgress,
    sourceHeight,
    destHeight,
    liftTube,
    moveTubeToTarget,
    tiltTube,
    animateLiquidPour,
    returnTube,
  };
};
