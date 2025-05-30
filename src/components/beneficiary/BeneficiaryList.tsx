import React from 'react';
import { Loader2 } from 'lucide-react';
import { FamilyMemberCard } from './FamilyMemberCard';
import { FamilyMember } from '../../lib/types';

interface BeneficiaryListProps {
  familyMembers: FamilyMember[];
  selectedMembers: FamilyMember[];
  manualBeneficiaries: any[];
  onAddFamilyMember: (member: FamilyMember) => void;
  onDeleteBeneficiary: (beneficiary: any, isFamily: boolean) => void;
  loading?: boolean;
}

export function BeneficiaryList({
  familyMembers,
  selectedMembers,
  manualBeneficiaries,
  onAddFamilyMember,
  onDeleteBeneficiary,
  loading
}: BeneficiaryListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  // Only show this message if there are no family members AND no manual beneficiaries
  if (familyMembers.length === 0 && selectedMembers.length === 0 && manualBeneficiaries.length === 0) {
    return (
      <p className="text-center text-[#2D2D2D]/60 py-4">
        No family members found. Add family members in your profile first.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {familyMembers.length > 0 && familyMembers.map((member) => (
        <React.Fragment key={member.id}>
          <FamilyMemberCard
            member={member}
            isSelected={selectedMembers.some(selected => selected.id === member.id)}
            onAdd={() => onAddFamilyMember(member)}
            loading={loading}
          />
        </React.Fragment>
      ))}

      {(selectedMembers.length > 0 || manualBeneficiaries.length > 0) && (
        <div className="selected-members">
          <h3 className="text-lg font-semibold mb-4">Added Beneficiaries</h3>
          {selectedMembers.map((member) => (
            <React.Fragment key={member.id}>
              <FamilyMemberCard
                member={member}
                onDelete={() => onDeleteBeneficiary(member, true)}
                loading={loading}
                showDelete
              />
            </React.Fragment>
          ))}
          {manualBeneficiaries.map((beneficiary) => (
            <React.Fragment key={beneficiary.id}>
              <FamilyMemberCard
                member={beneficiary}
                onDelete={() => onDeleteBeneficiary(beneficiary, false)}
                loading={loading}
                showDelete
              />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}