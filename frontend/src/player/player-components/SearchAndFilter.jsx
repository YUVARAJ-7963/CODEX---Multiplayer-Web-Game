import React from 'react';
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { difficulties } from './gameConstants';

const SearchAndFilter = ({ searchQuery, setSearchQuery, selectedDifficulty, setSelectedDifficulty }) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search levels..."
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 focus:border-gray-300 dark:focus:border-gray-600 focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        {difficulties.map((diff) => (
          <motion.button
            key={diff}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-md capitalize transition-colors ${
              selectedDifficulty === diff
                ? "bg-gray-900 dark:bg-purple-900 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            onClick={() => setSelectedDifficulty(diff)}
          >
            {diff}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SearchAndFilter; 