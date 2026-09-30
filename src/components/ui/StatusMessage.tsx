import React from 'react';

interface StatusMessageProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  className?: string;
  id?: string;
}

export function StatusMessage({ type, message, className = '', id }: StatusMessageProps) {
  // `dark:` utilities emit nothing here (no @custom-variant dark), so each style
  // carries both light and dark values directly.
  const styles = {
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
    info: 'bg-white/[0.06] border-white/15 text-foreground/90',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  // Errors and warnings must interrupt; info and success wait their turn.
  // `role="alert"` already implies assertive, so aria-live is only set
  // explicitly for the polite cases — setting it to "polite" on an alert would
  // silently downgrade it and make failures easy to miss.
  const isUrgent = type === 'error' || type === 'warning';
  const role = isUrgent ? 'alert' : 'status';

  return (
    <div
      id={id}
      role={role}
      aria-live={isUrgent ? undefined : 'polite'}
      aria-atomic="true"
      className={`flex items-start gap-3 p-4 border rounded-xl text-sm leading-relaxed ${styles[type]} ${className}`}
    >
      {icons[type]}
      <div className="flex-1">{message}</div>
    </div>
  );
}
