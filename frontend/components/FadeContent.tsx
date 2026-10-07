"use client";

import * as React from 'react';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FadeContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  container?: Element | string | null;
  blur?: boolean;
  duration?: number;
  ease?: string;
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  /** Play immediately on mount (for above-the-fold content) */
  immediate?: boolean;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
}

const FadeContent: React.FC<FadeContentProps> = ({
  children,
  container,
  blur = false,
  duration = 1000,
  ease = 'power2.out',
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  immediate = false,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = 'power2.in',
  onComplete,
  onDisappearanceComplete,
  className = '',
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let scrollerTarget: Element | string | null =
      container || document.getElementById('snap-main-container') || null;

    if (typeof scrollerTarget === 'string') {
      scrollerTarget = document.querySelector(scrollerTarget);
    }

    const startPct = (1 - threshold) * 100;
    const getSeconds = (val: number) => (val > 10 ? val / 1000 : val);

    gsap.set(el, {
      opacity: initialOpacity,
      filter: blur ? 'blur(10px)' : 'blur(0px)',
    });

    const tl = gsap.timeline({
      paused: true,
      delay: getSeconds(delay),
      onComplete: () => {
        onComplete?.();
        if (disappearAfter > 0) {
          gsap.to(el, {
            opacity: initialOpacity,
            filter: blur ? 'blur(10px)' : 'blur(0px)',
            delay: getSeconds(disappearAfter),
            duration: getSeconds(disappearDuration),
            ease: disappearEase,
            onComplete: () => onDisappearanceComplete?.(),
          });
        }
      },
    });

    tl.to(el, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: getSeconds(duration),
      ease,
      clearProps: 'opacity,filter',
    });

    const play = () => {
      if (tl.progress() === 0) tl.play();
    };

    if (immediate) {
      play();
      return () => {
        tl.kill();
        gsap.killTweensOf(el);
      };
    }

    const st = ScrollTrigger.create({
      trigger: el,
      scroller: scrollerTarget || window,
      start: `top ${startPct}%`,
      once: true,
      onEnter: play,
    });

    let rafId = 0;
    rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const rect = el.getBoundingClientRect();
      const triggerLine = window.innerHeight * (startPct / 100);
      if (rect.top <= triggerLine) play();
    });

    return () => {
      cancelAnimationFrame(rafId);
      st.kill();
      tl.kill();
      gsap.killTweensOf(el);
    };
  }, [blur, container, delay, disappearAfter, disappearDuration, disappearEase, duration, ease, immediate, initialOpacity, onComplete, onDisappearanceComplete, threshold]);

  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
};

export default FadeContent;
