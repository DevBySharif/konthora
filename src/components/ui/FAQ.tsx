import React from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  className?: string;
}

export function FAQ({ items, className = '' }: FAQProps) {
  return (
    <div className={`space-y-4 max-w-3xl mx-auto ${className}`}>
      {items.map((item, index) => (
        <details
          key={index}
          className="group border border-border bg-card rounded-xl overflow-hidden transition-all duration-200"
        >
          <summary className="flex items-center justify-between p-5 text-base font-semibold text-foreground cursor-pointer select-none list-none hover:bg-secondary/30 transition-colors focus-visible:bg-secondary/40 focus-visible:outline-none">
            <span>{item.question}</span>
            <span className="ml-4 flex-shrink-0 transition-transform duration-200 group-open:rotate-180 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </summary>
          <div className="p-5 pt-0 border-t border-border/50 text-muted-foreground leading-relaxed text-sm md:text-base bg-card">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
