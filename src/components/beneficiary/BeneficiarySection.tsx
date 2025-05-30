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
  manualForm: {
    title: string;
    first_names: string;
    last_name: string;
    id_number: string;
    relationship: string;
    phone: string;
  };
  onManualFormChange: (updates: any) => void;
  onAddFamilyMember: (member: FamilyMember) => void;
  onDeleteBeneficiary: (beneficiary: any, isFamily: boolean) => void;
  onManualSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function BeneficiarySection({
  addMode,
  onModeChange,
  familyMembers,
  selectedMembers,
  manualBeneficiaries,
  manualForm,
  onManualFormChange,
  onAddFamilyMember,
  onDeleteBeneficiary,
  onManualSubmit,
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
        <BeneficiaryList
          familyMembers={familyMembers}
          selectedMembers={selectedMembers}
          manualBeneficiaries={manualBeneficiaries}
          onAddFamilyMember={onAddFamilyMember}
          onDeleteBeneficiary={onDeleteBeneficiary}
          loading={loading}
        />
      ) : (
        <ManualBeneficiaryForm
          formData={manualForm}
          onChange={onManualFormChange}
          onSubmit={onManualSubmit}
          loading={loading}
        />
      )}
    </>
  );
}