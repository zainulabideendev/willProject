import React from 'react';
import { ResidueAllocationCard } from './ResidueAllocationCard';
import { FamilyMember } from '../../lib/types';

interface ResidueSectionProps {
  selectedMembers: FamilyMember[];
  manualBeneficiaries: any[];
  editMode: boolean;
  residueAllocations: Record<string, number>;
  onResidueChange: (beneficiaryId: string, percentage: number) => void;
  onSaveResidue: () => void;
  loading: boolean;
  hasUnsavedChanges: boolean;
}

export function ResidueSection({
  selectedMembers,
  manualBeneficiaries,
  editMode,
  residueAllocations,
  onResidueChange,
  onSaveResidue,
  loading,
  hasUnsavedChanges
}: ResidueSectionProps) {
  return (
    <div className="-mt-12">
      <ResidueAllocationCard
        beneficiaries={[...selectedMembers, ...manualBeneficiaries]}
        editMode={editMode}
        allocations={residueAllocations}
        onAllocationChange={onResidueChange}
        onSave={onSaveResidue}
        loading={loading}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
}