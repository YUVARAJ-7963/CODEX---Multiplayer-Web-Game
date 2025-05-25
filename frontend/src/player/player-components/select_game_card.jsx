import React from "react";

import { motion } from "framer-motion";
import { GiCrossedSwords } from "react-icons/gi";

const SelectGameCard = ({ image, goto, title, description, icon, mode }) => {
  return (
    <div className="game-card-wrapper">
      <motion.div
        whileHover={{ y: -10 }}
        className="bg-white/10 dark:bg-gray-800/10 rounded-[24px] overflow-hidden backdrop-blur-lg border border-white/10 cursor-pointer transition-all duration-300"
        onClick={goto}
      >
        <div className="relative">
          <div className="relative h-[250px] overflow-hidden">
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full w-full"
            >
              <motion.img 
                src={image} 
                alt={title} 
                className="w-full h-full object-contain bg-white dark:bg-gray-800"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/30"
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 0.4 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div 
              className="absolute top-4 right-4 bg-white/10 p-3 rounded-xl text-white text-2xl backdrop-blur-md"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
            {mode === "pvp" && (
              <motion.div 
                className="absolute top-4 left-4 bg-gradient-to-r from-[#ff0080] to-[#7928ca] px-4 py-2 rounded-full text-white font-bold flex items-center gap-2 text-sm backdrop-blur-md"
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <GiCrossedSwords /> PvP
              </motion.div>
            )}
          </div>
          
          <div className="p-6 text-center">
            <motion.h3 
              className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h3>
            <motion.p 
              className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {description}
            </motion.p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-[#7928CA] to-[#FF0080] text-white font-bold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40"
            >
              {mode === "pvp" ? "Battle Now" : "Practice Now"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SelectGameCard;