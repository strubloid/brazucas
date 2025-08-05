declare module 'scrollreveal' {
  interface ScrollRevealOptions {
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
  }

  interface ScrollRevealInstance {
    reveal(target: string | Element | NodeList, options?: ScrollRevealOptions): ScrollRevealInstance;
    clean(target: string | Element | NodeList): ScrollRevealInstance;
    destroy(): void;
    sync(): ScrollRevealInstance;
  }

  interface ScrollRevealConstructor {
    (): ScrollRevealInstance;
    (options?: ScrollRevealOptions): ScrollRevealInstance;
  }

  const ScrollReveal: ScrollRevealConstructor;
  export default ScrollReveal;
}
