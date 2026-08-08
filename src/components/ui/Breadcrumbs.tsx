import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`mb-6 ${className}`}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-border">
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span className="text-foreground font-medium">{item.name}</span>
              ) : (
                <Link href={item.href} className="hover:text-foreground transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}