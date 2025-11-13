import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  stagger?: number;
}

export const AnimatedSection = ({ 
  children, 
  className = '', 
  animation = 'fadeUp',
  delay = 0,
  stagger = 0
}: AnimatedSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const animations = {
      fadeUp: { opacity: 0, y: 60 },
      fadeIn: { opacity: 0 },
      slideLeft: { opacity: 0, x: -100 },
      slideRight: { opacity: 0, x: 100 },
      scale: { opacity: 0, scale: 0.8 }
    };

    const ctx = gsap.context(() => {
      const target = stagger > 0 ? sectionRef.current?.children : sectionRef.current;
      
      gsap.from(target, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        ...animations[animation],
        duration: 1,
        delay,
        stagger,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [animation, delay, stagger]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};

export const ParallaxSection = ({ children, className = '', speed = 0.5 }: { children: ReactNode; className?: string; speed?: number }) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
        y: (i, target) => -ScrollTrigger.maxScroll(window) * speed,
        ease: 'none',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};
