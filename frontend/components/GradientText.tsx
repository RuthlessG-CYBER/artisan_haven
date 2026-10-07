"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  pauseOnHover?: boolean;
  yoyo?: boolean;
  inline?: boolean;
  /** Infinite shift animation. Off by default — expensive with background-clip text. */
  animated?: boolean;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#5227FF', '#FF9FFC', '#B497CF'],
  animationSpeed = 8,
  showBorder = false,
  direction = 'horizontal',
  pauseOnHover = false,
  yoyo = true,
  inline = false,
  animated = false,
}: GradientTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!animated) return;
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '50px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animated]);

  const gradientAngle =
    direction === 'horizontal' ? 'to right' : direction === 'vertical' ? 'to bottom' : 'to bottom right';
  const gradientColors = colors.join(', ');

  const shouldAnimate = animated && inView && !isPaused;

  const gradientStyle = useMemo<CSSProperties>(() => {
    const fromTo =
      direction === 'vertical'
        ? { from: '50% 0%', to: '50% 100%' }
        : { from: '0% 50%', to: '100% 50%' };

    const style: CSSProperties & { [key: string]: any } = {
      backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
      backgroundSize: shouldAnimate
        ? direction === 'horizontal'
          ? '300% 100%'
          : direction === 'vertical'
            ? '100% 300%'
            : '300% 300%'
        : '100% 100%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '50% 50%',
    };

    if (shouldAnimate) {
      style['--gt-from'] = fromTo.from;
      style['--gt-to'] = fromTo.to;
      style.animationName = 'gradient-text-shift';
      style.animationDuration = `${Math.max(animationSpeed, 0.1)}s`;
      style.animationTimingFunction = 'ease-in-out';
      style.animationIterationCount = 'infinite';
      style.animationDirection = yoyo ? 'alternate' : 'normal';
      style.animationPlayState = 'running';
    }

    return style;
  }, [animationSpeed, direction, gradientAngle, gradientColors, shouldAnimate, yoyo]);

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden ${inline ? 'inline-flex' : 'mx-auto flex max-w-fit flex-row items-center justify-center'} font-medium ${showBorder ? 'rounded-[1.25rem] py-1 px-2 backdrop-blur transition-shadow duration-500' : ''} ${pauseOnHover ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {showBorder && (
        <div
          className={`absolute inset-0 z-0 pointer-events-none rounded-[1.25rem]${shouldAnimate ? ' gradient-text-animated' : ''}`}
          style={gradientStyle}
        >
          <div
            className="absolute bg-black rounded-[1.25rem] z-[-1]"
            style={{
              width: 'calc(100% - 2px)',
              height: 'calc(100% - 2px)',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      )}
      <div
        className={`inline-block relative z-2 text-transparent bg-clip-text${shouldAnimate ? ' gradient-text-animated' : ''}`}
        style={{ ...gradientStyle, WebkitBackgroundClip: 'text' }}
      >
        {children}
      </div>
    </div>
  );
}
