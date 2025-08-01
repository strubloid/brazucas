import { useEffect, useRef } from 'react';
import { useAnimation } from '../context/AnimationContext';

export const useAnimateOnMount = (
  animationType: 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounceIn' = 'fadeIn',
  delay: number = 0
): React.RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);
  const { fadeIn, slideIn, scaleIn, bounceIn } = useAnimation();

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;
      
      // Set initial state
      element.style.opacity = '0';
      
      setTimeout(() => {
        switch (animationType) {
          case 'fadeIn':
            fadeIn(element);
            break;
          case 'slideIn':
            slideIn(element);
            break;
          case 'scaleIn':
            scaleIn(element);
            break;
          case 'bounceIn':
            bounceIn(element);
            break;
        }
      }, delay);
    }
  }, [animationType, delay, fadeIn, slideIn, scaleIn, bounceIn]);

  return ref;
};
