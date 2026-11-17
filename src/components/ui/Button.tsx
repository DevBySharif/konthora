import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  /**
   * When set, the Button renders as an <a> styled exactly like the button
   * — one focusable element for link-actions such as downloads (audit
   * M16: an <a> wrapping a <button> is invalid HTML with two focus stops).
   * `download` is forwarded to the anchor.
   */
  href?: string;
  download?: string | boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  href,
  download,
  ...props
}: ButtonProps) {
  const baseStyles =
    'shine inline-flex items-center justify-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer';

  const variants = {
    // Primary actions use the warm-gold accent surface (audit P2-11).
    primary: 'solid-gold rounded-lg',
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
  const mergedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`;

  if (href !== undefined) {
    return (
      <a
        href={href}
        download={download}
        aria-disabled={disabled ? true : undefined}
        className={`${mergedClassName}${disabled ? ' pointer-events-none opacity-50' : ''}`}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={mergedClassName}
      {...props}
    >
      {children}
    </button>
  );
}
