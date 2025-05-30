import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Asset } from '../lib/types';
import { toast } from 'sonner';

export function useAllocations(profile: Profile | null) {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetAllocations, setAssetAllocations] = useState<Record<string, Record<string, number>>>({});
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  const [residueAllocations, setResidueAllocations] = useState<Record<string, number>>({});
  const [residueUnsavedChanges, setResidueUnsavedChanges] = useState(false);

  const fetchAssets = useCallback(async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      
      const [assetsResponse, allocationsResponse] = await Promise.all([
        supabase
          .from('assets')
          .select('*')
          .eq('profile_id', profile.id)
          .throwOnError(),
        supabase
          .from('asset_allocations')
          .select('*')
          .eq('profile_id', profile.id)
          .throwOnError()
      ]);

      if (assetsResponse.error) throw assetsResponse.error;
      if (allocationsResponse.error) throw allocationsResponse.error;

      const { data: beneficiaries, error: beneficiariesError } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('profile_id', profile.id)
        .throwOnError();

      if (beneficiariesError) throw beneficiariesError;
      if (!beneficiaries) throw new Error('Failed to fetch beneficiaries');

      setAssets(assetsResponse.data || []);
      
      const familyMemberToBeneficiaryId = beneficiaries.reduce((acc, beneficiary) => {
        if (beneficiary.is_family_member) {
          const key = beneficiary.family_member_type === 'child' 
            ? beneficiary.family_member_id 
            : beneficiary.family_member_type;
          acc[key] = beneficiary.id;
        }
        return acc;
      }, {} as Record<string, string>);

      const allocationsMap = allocationsResponse.data.reduce((acc, allocation) => {
        if (!acc[allocation.asset_id]) {
          acc[allocation.asset_id] = {};
        }
        
        const beneficiary = beneficiaries.find(b => b.id === allocation.beneficiary_id);
        const targetId = beneficiary?.is_family_member 
          ? beneficiary.family_member_type === 'child'
            ? beneficiary.family_member_id
            : beneficiary.family_member_type
          : allocation.beneficiary_id;

        if (targetId) {
          acc[allocation.asset_id][targetId] = allocation.allocation_percentage;
        }

        return acc;
      }, {} as Record<string, Record<string, number>>);
      
      setAssetAllocations(allocationsMap);
      setUnsavedChanges(new Set());
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to load assets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  const fetchResidueAllocations = useCallback(async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      
      const [allocationsResponse, beneficiariesResponse] = await Promise.all([
        supabase
          .from('residue_allocations')
          .select('*')
          .eq('profile_id', profile.id),
        supabase
          .from('beneficiaries')
          .select('*')
          .eq('profile_id', profile.id)
      ]);

      if (allocationsResponse.error) throw allocationsResponse.error;
      if (beneficiariesResponse.error) throw beneficiariesResponse.error;

      const allocations = allocationsResponse.data || [];
      const beneficiaries = beneficiariesResponse.data || [];

      const allocationsMap = allocations.reduce((acc, allocation) => {
        const beneficiary = beneficiaries.find(b => b.id === allocation.beneficiary_id);
        if (!beneficiary) return acc;

        const key = beneficiary.is_family_member
          ? beneficiary.family_member_type === 'child'
            ? beneficiary.family_member_id
            : beneficiary.family_member_type
          : beneficiary.id;

        acc[key] = allocation.allocation_percentage;
        return acc;
      }, {} as Record<string, number>);

      setResidueAllocations(allocationsMap);
    } catch (error) {
      console.error('Error fetching residue allocations:', error);
      toast.error('Failed to load residue allocations');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  return {
    loading,
    assets,
    assetAllocations,
    unsavedChanges,
    residueAllocations,
    residueUnsavedChanges,
    setAssetAllocations,
    setUnsavedChanges,
    setResidueAllocations,
    setResidueUnsavedChanges,
    fetchAssets,
    fetchResidueAllocations
  };
}