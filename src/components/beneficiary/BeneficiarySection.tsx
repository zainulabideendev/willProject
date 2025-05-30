import React from 'react';
import { BeneficiaryToggle } from './BeneficiaryToggle';
import { BeneficiaryList } from './BeneficiaryList';
import { ManualBeneficiaryForm } from './ManualBeneficiaryForm';
import { FamilyMember } from '../../lib/types';

interface BeneficiarySectionProps {
  addMode: 'family' | 'manual';
  onModeChange: (mode: 'family' | 'manual') => void;
  familyMembers: FamilyMember[];
  selectedMembers: FamilyMember[];
  manualBeneficiaries: any[];
  profileId: string;
  editMode: boolean;
  onAddFamilyMember: (member: FamilyMember) => void;
  onDeleteBeneficiary: (beneficiary: any, isFamily: boolean) => void;
  onBeneficiarySaved: () => Promise<void>;
  loading: boolean;
}

export function BeneficiarySection({
  addMode,
  onModeChange,
  familyMembers,
  selectedMembers,
  manualBeneficiaries,
  profileId,
  editMode,
  onAddFamilyMember,
  onDeleteBeneficiary,
  onBeneficiarySaved,
  loading
}: BeneficiarySectionProps) {
  return (
    <>
      <div className="text-center">
        <h2 className="text-base font-semibold mb-1.5">Add New Beneficiary</h2>
        <p className="text-[#2D2D2D]/60 text-sm">
          Choose a family member or add a new beneficiary manually
        </p>
      </div>

      <BeneficiaryToggle mode={addMode} onModeChange={onModeChange} />

      {addMode === 'family' ? (
        <div className={editMode ? '' : 'pointer-events-none opacity-70'}>
          <BeneficiaryList
            familyMembers={familyMembers}
            selectedMembers={selectedMembers}
            manualBeneficiaries={manualBeneficiaries}
            onAddFamilyMember={onAddFamilyMember}
            onDeleteBeneficiary={onDeleteBeneficiary}
            loading={loading}
          />
        </div>
      ) : (
        <div className={editMode ? '' : 'pointer-events-none opacity-70'}>
          <ManualBeneficiaryForm
            profileId={profileId}
            onBeneficiarySaved={onBeneficiarySaved}
            loading={loading}
            editMode={editMode}
          />
        </div>
      )}
    </>
  );
}