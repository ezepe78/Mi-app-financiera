'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
}

const PULL_THRESHOLD = 80;
const REFRESH_HEIGHT = 60;

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  
  // Map y value to opacity and rotation
  const opacity = useTransform(y, [0, PULL_THRESHOLD], [0, 1]);
  const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 360]);
  const scale = useTransform(y, [0, PULL_THRESHOLD], [0.5, 1]);

  const handleDragEnd = async () => {
    if (disabled || isRefreshing) return;

    const currentY = y.get();
    if (currentY >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      // Animate to refresh position
      animate(y, REFRESH_HEIGHT, { type: 'spring', stiffness: 300, damping: 30 });
      
      try {
        await onRefresh();
      } finally {
        // Small delay for visual feedback
        setTimeout(() => {
          setIsRefreshing(false);
          animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
        }, 800);
      }
    } else {
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  const handleDrag = () => {
    if (disabled || isRefreshing) return;
    
    // Only allow pull if we are at the top of the scrollable container
    const scrollContainer = containerRef.current?.parentElement;
    if (scrollContainer && scrollContainer.scrollTop > 0) {
      if (y.get() > 0) y.set(0);
      return;
    }

    const currentY = y.get();
    setPullProgress(Math.min(currentY / PULL_THRESHOLD, 1));
  };

  const yOffset = useTransform(y, (v) => v / 2);
  const refreshY = REFRESH_HEIGHT / 2;

  return (
    <div className="relative w-full h-full overflow-hidden" ref={containerRef}>
      {/* Refresh Indicator */}
      <motion.div
        style={{ 
          y: isRefreshing ? refreshY : yOffset,
          opacity,
          scale,
          rotate: isRefreshing ? undefined : rotate
        }}
        className="absolute left-0 right-0 flex justify-center pt-4 z-50 pointer-events-none"
      >
        <div className="bg-white shadow-lg rounded-full p-2 border border-gray-100">
          <RefreshCw 
            className={`w-6 h-6 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} 
            style={{ transform: isRefreshing ? undefined : `rotate(${pullProgress * 360}deg)` }}
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag={disabled || isRefreshing ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.6}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
