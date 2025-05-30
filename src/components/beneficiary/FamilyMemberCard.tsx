import React from 'react';
import { Users, Heart, Baby, Plus, Trash2, UserCircle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { FamilyMember } from '../../lib/types';

interface FamilyMemberCardProps {
  member: FamilyMember;
  isSelected?: boolean;
  onAdd?: () => void;
  onDelete?: () => void;
  loading?: boolean;
  showDelete?: boolean;
}

export function FamilyMemberCard({ 
  member, 
  isSelected, 
  onAdd, 
  onDelete,
  loading,
  showDelete = false
}: FamilyMemberCardProps) {
  const getMemberIcon = (type: 'spouse' | 'partner' | 'child') => {
    switch (type) {
      case 'spouse':
        return <Users />;
      case 'partner':
        return <Heart />;
      case 'child':
        return <Baby />;
      default:
        return <UserCircle />;
    }
  };

  if (showDelete) {
    return (
      <div className="selected-member-card">
        <div className="member-icon">
          {getMemberIcon(member.type)}
        </div>
        <div className="member-details">
          <h4 className="member-name">
            {member.first_names} {member.last_name}
          </h4>
          <p className="member-type">
            {member.type ? member.type : member.relationship}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="delete-button"
          disabled={loading}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="family-member-card">
      <div className="member-icon">
        {member.type ? getMemberIcon(member.type) : <UserCircle />}
      </div>
      <div className="member-details">
        <h3 className="member-name">
          {member.first_names} {member.last_name}
        </h3>
        <p className="member-type">
          {member.type ? member.type : member.relationship}
        </p>
      </div>
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={onAdd}
              className="select-button"
              disabled={isSelected}
            >
              <Plus className="w-4 h-4" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-[#2D2D2D] text-white text-sm px-2 py-1 rounded"
              sideOffset={5}
            >
              {isSelected ? 'Already selected as beneficiary' : 'Add as beneficiary'}
              <Tooltip.Arrow className="fill-[#2D2D2D]" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}