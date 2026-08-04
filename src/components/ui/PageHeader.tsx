import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  centered?: boolean;
}

export function PageHeader({ title, description, badge, centered = true }: PageHeaderProps) {
  return (
    <div className={`mb-10 md:mb-14 ${centered ? 'text-center' : 'text-left'}`}>
      {badge && (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
          {badge}
        </span>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl font-sans">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
