import React from 'react';
import { gameTypes } from './gameConstants';
import SelectGameCard from './select_game_card';

const GameSelection = ({ currentView, handleViewChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {currentView === "pvp" ? "Choose Your Battle Mode" : "Choose Your Practice Mode"}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {currentView === "pvp" 
            ? "Challenge other players in real-time coding battles" 
            : "Practice and improve your coding skills at your own pace"}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameTypes.map((game) => (
          <SelectGameCard
            key={game.id}
            image={game.image}
            icon={game.icon}
            goto={() => handleViewChange(currentView === "pvp" ? "pvp" : "contest", game)}
            title={game.name}
            description={game.description}
            features={game.features}
            mode={currentView}
            accent={game.color}
          />
        ))}
      </div>
    </div>
  );
};

export default GameSelection; 