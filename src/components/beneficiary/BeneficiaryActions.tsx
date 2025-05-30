import React from 'react';
import { supabase } from '../../lib/supabase';
import { Profile, FamilyMember } from '../../lib/types';
import { toast } from 'sonner';

interface BeneficiaryActionsProps {
  profile: Profile | null;
  onRefetch: () => Promise<void>;
  clearCache: () => void;
}

export function useBeneficiaryActions({ profile, onRefetch, clearCache }: BeneficiaryActionsProps) {
  const handleAddFamilyMember = async (member: FamilyMember) => {
    if (!profile) return;
    
    if (!member || !member.type) {
      console.error('Invalid member object:', member);
      toast.error('Cannot add beneficiary due to invalid data');
      return;
    }
    
    try {
      let family_member_id = null;
      if (member.type === 'child') {
        family_member_id = member.id;
      } else if (member.type === 'spouse' && profile.spouse_uuid) {
        family_member_id = profile.spouse_uuid;
      } else if (member.type === 'partner' && profile.partner_uuid) {
        family_member_id = profile.partner_uuid;
      }

      const beneficiary = {
        profile_id: profile.id,
        title: member.title,
        first_names: member.first_names,
        last_name: member.last_name,
        id_number: member.id_number,
        phone: member.phone,
        relationship: member.type,
        is_family_member: true,
        family_member_type: member.type,
        family_member_id: family_member_id
      };

      const { error } = await supabase
        .from('beneficiaries')
        .insert(beneficiary);

      if (error) throw error;

      toast.success('Family member added as beneficiary');
      clearCache();
      await onRefetch();
    } catch (error) {
      console.error('Error adding family member as beneficiary:', error);
      toast.error('Failed to add family member as beneficiary');
    }
  };

  const handleDeleteBeneficiary = async (beneficiary: any, isFamily: boolean) => {
    if (!profile) return;
    
    if (!beneficiary || (isFamily && !beneficiary.type)) {
      console.error('Invalid beneficiary object:', beneficiary);
      toast.error('Cannot remove beneficiary due to invalid data');
      return;
    }
    
    try {
      let beneficiaryId;

      if (isFamily) {
        let query = supabase
          .from('beneficiaries')
          .select('id')
          .eq('profile_id', profile.id)
          .eq('is_family_member', true)
          .eq('family_member_type', beneficiary.type);

        if (beneficiary.type === 'child') {
          query = query.eq('family_member_id', beneficiary.id);
        }

        const { data, error } = await query.single();
        
        if (error) throw error;
        if (!data) throw new Error('Could not find family member beneficiary record');
        
        beneficiaryId = data.id;
      } else {
        beneficiaryId = beneficiary.id;
      }

      // Delete allocations and beneficiary
      await Promise.all([
        supabase
          .from('asset_allocations')
          .delete()
          .eq('beneficiary_id', beneficiaryId),
        supabase
          .from('residue_allocations')
          .delete()
          .eq('beneficiary_id', beneficiaryId),
        supabase
          .from('beneficiaries')
          .delete()
          .eq('id', beneficiaryId)
      ]);

      toast.success('Beneficiary removed successfully');
      clearCache();
      await onRefetch();
      window.dispatchEvent(new Event('profile-updated'));
    } catch (error) {
      console.error('Error removing beneficiary:', error);
      toast.error('Failed to remove beneficiary');
    }
  };

  return {
    handleAddFamilyMember,
    handleDeleteBeneficiary
  };
}