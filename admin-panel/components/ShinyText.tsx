"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  delay?: number;
  /** Infinite shine animation. Off by default for CPU cost. */
  animated?: boolean;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = 'left',
  delay = 0,
  animated = false,
}) => {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!animated || disabled) return;
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '50px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animated, disabled]);

  const shouldAnimate = animated && inView && !disabled && !isPaused;

  const style = useMemo<React.CSSProperties>(() => {
    const duration = Math.max(speed, 0.1);
    const delaySec = Math.max(delay, 0);

    const base: React.CSSProperties = {
      backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
      backgroundSize: shouldAnimate ? '200% auto' : '100% auto',
      backgroundPosition: 'center',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
    };

    if (!shouldAnimate) return base;

    return {
      ...base,
      animationName: 'shiny-text-shift',
      animationDuration: `${duration}s`,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
      animationDirection: yoyo
        ? direction === 'left'
          ? 'alternate'
          : 'alternate-reverse'
        : direction === 'left'
          ? 'normal'
          : 'reverse',
      animationDelay: delaySec ? `${delaySec}s` : undefined,
      animationPlayState: 'running',
    };
  }, [color, delay, direction, shouldAnimate, shineColor, speed, spread, yoyo]);

  return (
    <span
      ref={rootRef}
      className={`inline-block${shouldAnimate ? ' shiny-text-animated' : ''} ${className}`}
      style={style}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {text}
    </span>
  );
};

export default ShinyText;
