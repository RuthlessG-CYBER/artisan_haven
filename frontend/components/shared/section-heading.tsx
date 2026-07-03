"use client";

import GradientText from '@/components/GradientText';
import { Reveal } from '@/components/shared/reveal';

const GRADIENT_COLORS = ['#059669', '#10b981', '#f59e0b'];

interface SectionHeadingProps {
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  title,
  highlight,
  subtitle,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  const renderTitle = () => {
    if (!highlight || !title.includes(highlight)) {
      return (
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
      );
    }

    const [before, after] = title.split(highlight);

    return (
      <h2
        className={`text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${
          align === 'center' ? 'flex flex-wrap items-baseline justify-center gap-x-2' : 'flex flex-wrap items-baseline gap-x-2'
        }`}
      >
        {before ? <span>{before}</span> : null}
        <GradientText colors={GRADIENT_COLORS} animationSpeed={7} inline className="mx-0">
          <span className="font-serif italic px-3">{highlight}</span>
        </GradientText>
        {after ? <span>{after}</span> : null}
      </h2>
    );
  };

  return (
    <Reveal className={`mb-12 ${alignClass} ${className}`}>
      {renderTitle()}
      {subtitle && (
        <p className={`mt-4 max-w-2xl text-lg text-muted-foreground ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
