import React from 'react';
import { Users, UserPlus } from 'lucide-react';

type AddMode = 'family' | 'manual';

interface BeneficiaryToggleProps {
  mode: AddMode;
  onModeChange: (mode: AddMode) => void;
}

export function BeneficiaryToggle({ mode, onModeChange }: BeneficiaryToggleProps) {
  return (
    <div className="beneficiary-toggle">
      <button
        onClick={() => onModeChange('family')}
        className={`toggle-item ${mode === 'family' ? 'active' : ''}`}
      >
        <Users className="w-4 h-4" />
        Family Members
      </button>
      <button
        onClick={() => onModeChange('manual')}
        className={`toggle-item ${mode === 'manual' ? 'active' : ''}`}
      >
        <UserPlus className="w-4 h-4" />
        Add Manually
      </button>
    </div>
  );
}