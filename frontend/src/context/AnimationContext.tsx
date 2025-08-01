import React, { createContext, useContext, useRef, ReactNode } from 'react';
import anime from 'animejs';

interface AnimationContextType {
  fadeIn: (element: HTMLElement | string, options?: anime.AnimeParams) => void;
  fadeOut: (element: HTMLElement | string, options?: anime.AnimeParams) => void;
  slideIn: (element: HTMLElement | string, direction?: 'left' | 'right' | 'up' | 'down', options?: anime.AnimeParams) => void;
  slideOut: (element: HTMLElement | string, direction?: 'left' | 'right' | 'up' | 'down', options?: anime.AnimeParams) => void;
  scaleIn: (element: HTMLElement | string, options?: anime.AnimeParams) => void;
  scaleOut: (element: HTMLElement | string, options?: anime.AnimeParams) => void;
  staggerIn: (elements: HTMLElement[] | string, options?: anime.AnimeParams) => void;
  bounceIn: (element: HTMLElement | string, options?: anime.AnimeParams) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const animationsRef = useRef<anime.AnimeInstance[]>([]);

  const fadeIn = (element: HTMLElement | string, options: anime.AnimeParams = {}): void => {
    const animation = anime({
      targets: element,
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutCubic',
      ...options,
    });
    animationsRef.current.push(animation);
  };

  const fadeOut = (element: HTMLElement | string, options: anime.AnimeParams = {}): void => {
    const animation = anime({
      targets: element,
      opacity: [1, 0],
      duration: 400,
      easing: 'easeInCubic',
      ...options,
    });
    animationsRef.current.push(animation);
  };

  const slideIn = (
    element: HTMLElement | string,
    direction: 'left' | 'right' | 'up' | 'down' = 'up',
    options: anime.AnimeParams = {}
  ): void => {
    const transforms: Record<string, [string, string]> = {
      left: ['translateX(-100%)', 'translateX(0)'],
      right: ['translateX(100%)', 'translateX(0)'],
      up: ['translateY(-100%)', 'translateY(0)'],
      down: ['translateY(100%)', 'translateY(0)'],
    };

    const [from, to] = transforms[direction];

    const animation = anime({
      targets: element,
      translateX: direction === 'left' || direction === 'right' ? [from, to] : 0,
      translateY: direction === 'up' || direction === 'down' ? [from, to] : 0,
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutExpo',
      ...options,
    });
    animationsRef.current.push(animation);
  };

  const slideOut = (
    element: HTMLElement | string,
    direction: 'left' | 'right' | 'up' | 'down' = 'down',
    options: anime.AnimeParams = {}
  ): void => {
    const transforms: Record<string, string> = {
      left: 'translateX(-100%)',
      right: 'translateX(100%)',
      up: 'translateY(-100%)',
      down: 'translateY(100%)',
    };

    const to = transforms[direction];

    const animation = anime({
      targets: element,
      translateX: direction === 'left' || direction === 'right' ? to : 0,
      translateY: direction === 'up' || direction === 'down' ? to : 0,
      opacity: [1, 0],
      duration: 600,
      easing: 'easeInExpo',
      ...options,
    });
    animationsRef.current.push(animation);
  };

  const scaleIn = (element: HTMLElement | string, options: anime.AnimeParams = {}): void => {
    const animation = anime({
      targets: element,
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutBack',
      ...options,
    });
    animationsRef.current.push(animation);
  };

  const scaleOut = (element: HTMLElement | string, options: anime.AnimeParams = {}): void => {
    const animation = anime({
      targets: element,
      scale: [1, 0],
      opacity: [1, 0],
      duration: 400,
      easing: 'easeInBack',
      ...options,
    });
    animationsRef.current.push(animation);
  };

  const staggerIn = (elements: HTMLElement[] | string, options: anime.AnimeParams = {}): void => {
    const animation = anime({
      targets: elements,
      translateY: [-50, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      duration: 800,
      easing: 'easeOutExpo',
      ...options,
    });
    animationsRef.current.push(animation);
  };

  const bounceIn = (element: HTMLElement | string, options: anime.AnimeParams = {}): void => {
    const animation = anime({
      targets: element,
      scale: [0, 1],
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeOutElastic(1, .8)',
      ...options,
    });
    animationsRef.current.push(animation);
  };

  const value: AnimationContextType = {
    fadeIn,
    fadeOut,
    slideIn,
    slideOut,
    scaleIn,
    scaleOut,
    staggerIn,
    bounceIn,
  };

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
};

export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};
