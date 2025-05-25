import React from 'react';
import { motion } from 'framer-motion';

const StarsBackground = () => {
  // Create different types of stars
  const stars = Array.from({ length: 100 }, (_, i) => {
    const size = Math.random() * 3 + 1;
    const isLargeStar = size > 2;
    
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      color: isLargeStar ? '#ffffff' : '#94a3b8', // White for large stars, gray for small ones
      glow: isLargeStar ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none'
    };
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            boxShadow: star.glow
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default StarsBackground;