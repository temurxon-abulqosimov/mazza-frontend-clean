import React from 'react';
import { Target } from 'lucide-react';

const MissionCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Today's Mission</h3>
        <Target className="w-5 h-5" />
      </div>
      
      <p className="text-sm mb-4 opacity-90">
        Join the fight against food waste! Save money and help the environment.
      </p>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">247</div>
          <div className="text-xs opacity-90">Boxes saved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">892</div>
          <div className="text-xs opacity-90">Money saved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">423kg</div>
          <div className="text-xs opacity-90">CO saved</div>
        </div>
      </div>
    </div>
  );
};

export default MissionCard;
