import React from 'react';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export function Section({ children, as: Component = 'section', className = '', ...props }: SectionProps) {
  return (
    <Component
      className={`py-12 md:py-16 lg:py-20 border-b border-border/40 last:border-b-0 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
