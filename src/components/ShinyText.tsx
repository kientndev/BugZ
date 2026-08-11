'use client';

import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export default function ShinyText({ text, disabled = false, speed = 5, className = '' }: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block bg-gradient-to-r from-foreground via-cyan-400 to-foreground bg-[200%_auto] text-transparent bg-clip-text ${
        disabled ? '' : 'animate-shine'
      } ${className}`}
      style={{
        animationDuration,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
      }}
    >
      {text}
    </span>
  );
}
