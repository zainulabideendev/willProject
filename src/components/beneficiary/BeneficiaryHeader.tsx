import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BeneficiaryHeaderProps {
  onNavigate: (screen: string) => void;
}

export function BeneficiaryHeader({ onNavigate }: BeneficiaryHeaderProps) {
  return (
    <div className="flex items-center mb-6">
      <button
        onClick={() => onNavigate('dashboard')}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
      </button>
      <h1 className="text-lg font-semibold text-[#2D2D2D] ml-2">Add Beneficiaries</h1>
    </div>
  );
}