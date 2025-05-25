import React from 'react';
import { motion } from "framer-motion";
import { mainModes } from './gameConstants';

const MainMenu = ({ handleViewChange }) => {
  // Purple color palette
  const purplePalette = {
    primary: '#8B5CF6',
    secondary: '#C4B5FD',
    accent: '#A78BFA',
    dark: '#6D28D9',
    light: '#EDE9FE'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white dark:bg-gray-900">
      {mainModes.map((mode, index) => (
        <motion.div
          key={mode.id}
          initial={{ opacity: 0, rotateX: -20 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.6, delay: index * 0.15 }}
          whileHover={{ 
            rotateX: 5,
            rotateY: 5,
            scale: 1.03,
            boxShadow: `0 25px 50px -12px ${purplePalette.primary}40`
          }}
          whileTap={{ scale: 0.98 }}
          className="relative cursor-pointer perspective-1000"
          onClick={() => handleViewChange(mode.type)}
        >
          <div className="relative h-full transform-style-3d transition-all duration-300">
            {/* Neon border effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <motion.div
                className="absolute inset-0"
                animate={{
                  boxShadow: [
                    `0 0 20px ${purplePalette.primary}30`,
                    `0 0 40px ${purplePalette.primary}50`,
                    `0 0 20px ${purplePalette.primary}30`
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            {/* Animated background gradient */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    `linear-gradient(45deg, ${purplePalette.primary}15, ${purplePalette.secondary}15, transparent 50%, ${purplePalette.primary}15)`,
                    `linear-gradient(45deg, ${purplePalette.primary}15, ${purplePalette.accent}15, transparent 50%, ${purplePalette.primary}15)`,
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            {/* Glassmorphism card */}
            <div className="backdrop-blur-lg bg-white/40 dark:bg-gray-800/40 rounded-2xl border border-purple-200/30 dark:border-purple-800/30 p-8 shadow-xl relative overflow-hidden">
              {/* Animated particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: purplePalette.primary }}
                    initial={{
                      x: Math.random() * 100 + '%',
                      y: Math.random() * 100 + '%',
                      scale: 0,
                      opacity: 0
                    }}
                    animate={{
                      x: Math.random() * 100 + '%',
                      y: Math.random() * 100 + '%',
                      scale: [0, 1.5, 0],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "linear"
                    }}
                  />
                ))}
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-48 h-48 -mt-24 -mr-24 rounded-full opacity-10"
                   style={{ 
                     backgroundColor: purplePalette.primary,
                     filter: 'blur(30px)'
                   }} />
              
              <div className="absolute bottom-0 left-0 w-40 h-40 -mb-20 -ml-20 rounded-full opacity-10"
                   style={{ 
                     backgroundColor: purplePalette.accent,
                     filter: 'blur(30px)'
                   }} />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex flex-col items-start gap-6">
                  {/* Icon with enhanced floating effect */}
                  <motion.div 
                    className="relative"
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <div className="p-6 rounded-2xl relative"
                         style={{ 
                           backgroundColor: `${purplePalette.primary}15`,
                           boxShadow: `0 0 30px ${purplePalette.primary}30`
                         }}>
                      <div className="text-5xl text-purple-700 dark:text-purple-400">{mode.icon}</div>
                      {/* Enhanced glow effect */}
                      <motion.div 
                        className="absolute inset-0 rounded-2xl"
                        animate={{
                          boxShadow: [
                            `0 0 20px ${purplePalette.primary}20`,
                            `0 0 40px ${purplePalette.primary}40`,
                            `0 0 20px ${purplePalette.primary}20`
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Title with enhanced gradient */}
                  <h2 className="text-5xl font-bold tracking-tight relative text-purple-700 dark:text-purple-400">
                    {mode.name}
                  </h2>

                  {/* Description with enhanced typography */}
                  <p className="text-gray-700 dark:text-gray-300 text-xl leading-relaxed max-w-md font-light">
                    {mode.description}
                  </p>

                  {/* Enhanced interactive button */}
                  <motion.div 
                    className="mt-6 px-8 py-4 rounded-full text-white font-medium relative overflow-hidden group"
                    style={{ 
                      background: `linear-gradient(45deg, ${purplePalette.primary}, ${purplePalette.dark})`,
                      boxShadow: `0 4px 15px ${purplePalette.primary}40`
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: `0 8px 25px ${purplePalette.primary}60`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">Start {mode.name}</span>
                    {/* Enhanced button shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.8 }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MainMenu; 