import React from 'react';
import './EstateEssentialsHub.css';

interface EstateEssentialsHubProps {
  onNavigate: (screen: string) => void;
}

export function EstateEssentialsHub({ onNavigate }: EstateEssentialsHubProps) {
  return (
    <div className="essentials-hub">
      <div className="hub-header">
        <h2 className="text-xl font-semibold text-[#2D2D2D]">Estate Essentials Hub</h2>
      </div>
      <p className="text-[#2D2D2D]/60 mb-4">
        Access important estate planning resources.
      </p>
      <button 
        onClick={() => onNavigate('hub')}
        className="explore-button"
      >
        Explore the Hub
      </button>
    </div>
  );
}