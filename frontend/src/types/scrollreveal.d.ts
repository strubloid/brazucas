// Override the default ScrollReveal types completely
declare module 'scrollreveal' {
  export interface ScrollRevealOptions {
    delay?: number;
    distance?: string;
    duration?: number;
    easing?: string;
    interval?: number;
    opacity?: number;
    origin?: 'top' | 'right' | 'bottom' | 'left';
    rotate?: { x?: number; y?: number; z?: number };
    scale?: number;
    cleanup?: boolean;
    container?: Element | string;
    desktop?: boolean;
    mobile?: boolean;
    reset?: boolean;
    useDelay?: 'always' | 'once' | 'onload';
    viewFactor?: number;
    viewOffset?: { top?: number; right?: number; bottom?: number; left?: number };
    afterReveal?: (domEl: Element) => void;
    afterReset?: (domEl: Element) => void;
    beforeReveal?: (domEl: Element) => void;
    beforeReset?: (domEl: Element) => void;
  }

  export interface ScrollRevealObject {
    reveal(target: string | Element | NodeList, options?: ScrollRevealOptions): ScrollRevealObject;
    clean(target: string | Element | NodeList): ScrollRevealObject;
    destroy(): void;
    sync(): ScrollRevealObject;
  }

  export interface ScrollRevealConstructor {
    (): ScrollRevealObject;
    (options?: ScrollRevealOptions): ScrollRevealObject;
  }

  const ScrollReveal: ScrollRevealConstructor;
  export default ScrollReveal;
}

// Also override any global types
declare global {
  interface Window {
    ScrollReveal: ScrollRevealConstructor;
  }
}

// Explicitly declare for module resolution
declare const ScrollReveal: {
  (): {
    reveal(target: string | Element | NodeList, options?: ScrollRevealOptions): ScrollRevealObject;
    clean(target: string | Element | NodeList): ScrollRevealObject;
    destroy(): void;
    sync(): ScrollRevealObject;
  };
  (options?: ScrollRevealOptions): {
    reveal(target: string | Element | NodeList, options?: ScrollRevealOptions): ScrollRevealObject;
    clean(target: string | Element | NodeList): ScrollRevealObject;
    destroy(): void;
    sync(): ScrollRevealObject;
  };
};
