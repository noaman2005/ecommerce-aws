'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c3743a] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(28,26,23,0.08)]';

  const variants = {
    primary: 'bg-[#b7472f] text-white hover:bg-[#c3743a]',
    secondary: 'bg-[#f6eee5] text-[#1c1a17] hover:bg-[#f4e5d8]',
    outline: 'border border-[#d9cfc2] text-[#5f4b3f] hover:bg-[#f6eee5]',
    ghost: 'text-[#5f4b3f] hover:bg-[#f6eee5]',
    danger: 'bg-[#c0392b] text-white hover:bg-[#a43126]',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4.5 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  };

  const MotionButton = motion.button;
  
  return (
    <MotionButton
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      type={props.type || 'button'}
      onClick={props.onClick}
      onSubmit={props.onSubmit}
      animate={{ opacity: disabled ? 0.7 : 1 }}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </MotionButton>
  );
};
