import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs uppercase tracking-[0.3em] text-[#5f4b3f] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-2xl bg-[#f6eee5] text-[#1c1a17] placeholder-[#9c8a7a] border border-[#d9cfc2] focus:border-[#b7472f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c3743a] transition-all duration-200 ${error ? 'ring-1 ring-red-400' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
