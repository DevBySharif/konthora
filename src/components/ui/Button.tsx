import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseStyles =
    'shine inline-flex items-center justify-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'solid-metal rounded-lg',
    secondary: 'glass-ghost rounded-lg',
    outline: 'glass-ghost rounded-lg',
    ghost: 'rounded-lg text-foreground hover:bg-secondary/60',
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-sm gap-1.5',
    md: 'h-10 px-4.5 text-base gap-2',
    lg: 'h-12 px-6 text-lg gap-2.5 rounded-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
