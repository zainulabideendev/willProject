import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FamilyMember, Profile } from '../lib/types';
import { toast } from 'sonner';

const CACHE_KEY = 'beneficiaries';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheData {
  timestamp: number;
  familyMembers: FamilyMember[];
  selectedMembers: FamilyMember[];
  manualBeneficiaries: any[];
}

export function useBeneficiaries(profile: Profile | null) {
  const [loading, setLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<FamilyMember[]>([]);
  const [manualBeneficiaries, setManualBeneficiaries] = useState<any[]>([]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CacheData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - data.timestamp > CACHE_DURATION) {
        clearCache();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cache:', error);
      clearCache();
      return null;
    }
  }, [clearCache]);

  const setCachedData = useCallback((data: Omit<CacheData, 'timestamp'>) => {
    try {
      const cacheData: CacheData = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }, []);

  const fetchBeneficiaries = useCallback(async () => {
    if (!profile) return;
    
    // Clear cache before fetching to ensure fresh data
    clearCache();
    setLoading(true);
    
    try {
      // Check cache first
      const cached = getCachedData();
      if (cached) {
        setFamilyMembers(cached.familyMembers);
        setSelectedMembers(cached.selectedMembers);
        setManualBeneficiaries(cached.manualBeneficiaries);
        setLoading(false);
        return;
      }

      // Fetch all beneficiaries
      const { data: beneficiaries, error: beneficiariesError } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('profile_id', profile.id);

      if (beneficiariesError) throw beneficiariesError;

      // Split beneficiaries into manual and family members
      const manual = beneficiaries?.filter(b => !b.is_family_member) || [];
      const familyBeneficiaries = beneficiaries?.filter(b => b.is_family_member) || [];
      
      setManualBeneficiaries(manual);

      // Fetch spouse/partner details
      const spouse = profile.marital_status === 'married' ? {
        id: profile.spouse_uuid,
        type: 'spouse' as const,
        title: profile.spouse_title || '',
        first_names: profile.spouse_first_name || '',
        last_name: profile.spouse_last_name || '',
        id_number: profile.spouse_id_number || '',
        phone: profile.spouse_phone || ''
      } : null;

      const partner = profile.has_life_partner ? {
        id: profile.partner_uuid,
        type: 'partner' as const,
        title: profile.partner_title || '',
        first_names: profile.partner_first_name || '',
        last_name: profile.partner_last_name || '',
        id_number: profile.partner_id_number || '',
        phone: profile.partner_phone || ''
      } : null;

      // Fetch children
      const { data: children, error } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', profile.id);

      if (error) throw error;

      const familyMembers = [
        ...(spouse ? [spouse] : []),
        ...(partner ? [partner] : []),
        ...(children || []).map(child => ({
          id: child.id,
          profile_id: child.profile_id,
          type: 'child' as const,
          title: child.title || '',
          first_names: child.first_names,
          last_name: child.last_name,
          id_number: child.id_number || '',
          phone: child.phone || ''
        }))
      ];

      setFamilyMembers(familyMembers);
      
      // Set selected members based on existing family beneficiaries
      const selectedFamilyMembers = familyMembers.filter(member => 
        familyBeneficiaries.some(b => 
          (b.family_member_type === member.type && 
           ((member.type === 'child' && b.family_member_id === member.id) ||
            (member.type !== 'child' && b.family_member_type === member.type)))
        )
      );
      
      setSelectedMembers(selectedFamilyMembers);
      
      // Cache the data
      setCachedData({
        familyMembers,
        selectedMembers: selectedFamilyMembers,
        manualBeneficiaries: manual
      });

      console.log('Beneficiaries updated:', {
        familyMembers: familyMembers.length,
        selectedMembers: selectedFamilyMembers.length,
        manualBeneficiaries: manual.length
      });

    } catch (error) {
      console.error('Error fetching family members:', error);
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, getCachedData, setCachedData]);

  useEffect(() => {
    if (profile) {
      fetchBeneficiaries();
    }
  }, [fetchBeneficiaries]);

  return {
    loading,
    familyMembers,
    selectedMembers,
    manualBeneficiaries,
    setSelectedMembers,
    setManualBeneficiaries,
    refetch: fetchBeneficiaries,
    clearCache
  };
}