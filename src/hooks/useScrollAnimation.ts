import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(elementRef.current, {
        scrollTrigger: {
          trigger: elementRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, elementRef);

    return () => ctx.revert();
  }, []);

  return elementRef;
};

export const useFadeInUp = (delay = 0) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(elementRef.current, {
        scrollTrigger: {
          trigger: elementRef.current,
          start: 'top 85%',
        },
        opacity: 0,
        y: 60,
        duration: 1,
        delay,
        ease: 'power3.out',
      });
    }, elementRef);

    return () => ctx.revert();
  }, [delay]);

  return elementRef;
};

export const useStaggerAnimation = (stagger = 0.1) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const children = containerRef.current?.children;
      if (children) {
        gsap.from(children, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          },
          opacity: 0,
          y: 50,
          stagger,
          duration: 0.8,
          ease: 'power3.out',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [stagger]);

  return containerRef;
};
