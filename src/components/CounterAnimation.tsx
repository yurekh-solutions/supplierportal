import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CounterAnimationProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const CounterAnimation = ({ 
  end, 
  duration = 2, 
  suffix = '', 
  prefix = '',
  className = '' 
}: CounterAnimationProps) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!counterRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(counterRef.current, {
        scrollTrigger: {
          trigger: counterRef.current,
          start: 'top 80%',
          once: true,
        },
        innerHTML: end,
        duration,
        snap: { innerHTML: 1 },
        ease: 'power1.out',
        onUpdate: function() {
          if (counterRef.current) {
            const value = Math.ceil(parseFloat(counterRef.current.innerHTML));
            setCount(value);
          }
        }
      });
    }, counterRef);

    return () => ctx.revert();
  }, [end, duration]);

  return (
    <span ref={counterRef} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
};
