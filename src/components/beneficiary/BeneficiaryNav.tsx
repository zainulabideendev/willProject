import React from 'react';
import { Users, Clock, Percent } from 'lucide-react';

type NavSection = 'beneficiaries' | 'allocations' | 'residue';

interface BeneficiaryNavProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
}

export function BeneficiaryNav({ activeSection, onSectionChange }: BeneficiaryNavProps) {
  return (
    <div className="flex justify-center">
      <nav className="beneficiary-nav">
        <button
          onClick={() => onSectionChange('beneficiaries')}
          className={`nav-item ${activeSection === 'beneficiaries' ? 'active' : ''}`}
        >
          <Users className="w-3.5 h-3.5" />
          Beneficiaries
        </button>
        <button
          onClick={() => onSectionChange('allocations')}
          className={`nav-item ${activeSection === 'allocations' ? 'active' : ''}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Allocations
        </button>
        <button
          onClick={() => onSectionChange('residue')}
          className={`nav-item ${activeSection === 'residue' ? 'active' : ''}`}
        >
          <Percent className="w-3.5 h-3.5" />
          Residue
        </button>
      </nav>
    </div>
  );
}