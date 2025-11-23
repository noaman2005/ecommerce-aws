'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  const MotionCard = motion.div;
  return (
    <MotionCard
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -6, boxShadow: '0 25px 50px rgba(28,26,23,0.12)' } : undefined}
      transition={{ duration: 0.25 }}
      className={`bg-white rounded-3xl border border-[#d9cfc2] shadow-[0_15px_40px_rgba(28,26,23,0.08)] overflow-hidden ${className}`}
    >
      {children}
    </MotionCard>
  );
};
