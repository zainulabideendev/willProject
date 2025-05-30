import React from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile, useUpdateProfile } from '../lib/hooks';
import { useBeneficiaries } from '../hooks/useBeneficiaries';
import { useAllocations } from '../hooks/useAllocations';
import { CommunityPropertyModal } from './modals/CommunityPropertyModal';
import { useBeneficiaryActions } from './beneficiary/BeneficiaryActions';
import { supabase } from '../lib/supabase';
import { BeneficiaryNav } from './beneficiary/BeneficiaryNav';
import { BeneficiaryHeader } from './beneficiary/BeneficiaryHeader';
import { BeneficiarySection } from './beneficiary/BeneficiarySection';
import { AllocationSection } from './beneficiary/AllocationSection';
import { ResidueSection } from './beneficiary/ResidueSection';
import { CompletionValidator } from './beneficiary/CompletionValidator';
import { FamilyMember } from '../lib/types';
import './BeneficiaryScreen.css';

interface BeneficiaryScreenProps {
  onNavigate: (screen: string) => void;
}

type NavSection = 'beneficiaries' | 'allocations' | 'residue';
type AddMode = 'family' | 'manual';

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  estimated_value: number;
  details: Record<string, any>;
}

interface AssetAllocation {
  id: string;
  asset_id: string;
  beneficiary_id: string;
  allocation_percentage: number;
}

function BeneficiaryScreen({ onNavigate }: BeneficiaryScreenProps) {
  const [activeSection, setActiveSection] = React.useState<NavSection>('beneficiaries');
  const [addMode, setAddMode] = React.useState<AddMode>('family');
  const { profile, loading: profileLoading, refetchProfile } = useProfile();
  const [localLoading, setLocalLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  
  const {
    loading,
    familyMembers,
    selectedMembers,
    manualBeneficiaries,
    setManualBeneficiaries,
    refetch: refetchBeneficiaries,
    clearCache: clearBeneficiariesCache
  } = useBeneficiaries(profile);

  const {
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
  } = useAllocations(profile);

  const { handleAddFamilyMember, handleDeleteBeneficiary } = useBeneficiaryActions({
    profile,
    onRefetch: refetchBeneficiaries,
    clearCache: clearBeneficiariesCache
  });

  const [manualForm, setManualForm] = React.useState({
    title: '',
    first_names: '',
    last_name: '',
    id_number: '',
    relationship: '',
    phone: ''
  });

  const handleAddManualBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setLocalLoading(true);
      
      const beneficiary = {
        profile_id: profile.id,
        ...manualForm,
        is_family_member: false
      };

      const { error } = await supabase
        .from('beneficiaries')
        .insert(beneficiary);

      if (error) throw error;

      setManualForm({
        title: '',
        first_names: '',
        last_name: '',
        id_number: '',
        relationship: '',
        phone: ''
      });

      toast.success('Beneficiary added successfully');
      clearBeneficiariesCache();
      await refetchBeneficiaries();
      await refetchProfile();
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      toast.error('Failed to add beneficiary');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAllocationChange = (assetId: string, beneficiaryId: string, percentage: number) => {
    // For spouse/partner, use the type as the key instead of the ID
    const member = selectedMembers.find(m => m.id === beneficiaryId);
    const allocationKey = member?.type === 'spouse' || member?.type === 'partner'
      ? member.type
      : beneficiaryId;
    
    setAssetAllocations(prev => ({
      ...prev,
      [assetId]: {
        ...(prev[assetId] || {}),
        [allocationKey]: percentage
      }
    }));
    setUnsavedChanges(prev => new Set(prev).add(assetId));
  };

  const handleSaveAllocations = async (assetId: string) => {
    if (!profile) return;
    
    // Fetch current beneficiaries to get the correct mapping
    const { data: beneficiaries, error: beneficiariesError } = await supabase
      .from('beneficiaries').select('*').eq('profile_id', profile.id);

    if (beneficiariesError) {
      toast.error('Failed to verify beneficiaries');
      return;
    }

    const currentAllocations = assetAllocations[assetId] || {};
    
    // Create a mapping of family member/type to beneficiary ID
    const memberToBeneficiaryId = beneficiaries.reduce((acc, b) => {
      if (b.is_family_member) {
        const key = b.family_member_type === 'child' ? b.family_member_id : b.family_member_type;
        acc[key] = b.id;
      } else {
        acc[b.id] = b.id;
      }
      return acc;
    }, {} as Record<string, string>);
    
    try {
      setLocalLoading(true);
      
      // Convert member IDs to beneficiary IDs
      const validAllocations = Object.entries(currentAllocations).filter(([memberId]) => 
        memberId && 
        memberId !== 'undefined' &&
        memberToBeneficiaryId[memberId]
      );
      
      // Calculate total allocation
      const total = validAllocations.reduce((sum, [, value]) => sum + (value || 0), 0);
      
      if (total > 100) {
        toast.error('Total allocation cannot exceed 100%');
        return;
      }

      // Delete existing allocations for this asset
      const { error: deleteError } = await supabase
        .from('asset_allocations')
        .delete()
        .eq('asset_id', assetId);

      if (deleteError) throw deleteError;

      // Process each beneficiary's allocation
      for (const [memberId, percentage] of validAllocations) {
        if (percentage > 0) {
          const beneficiaryId = memberToBeneficiaryId[memberId];
          if (!beneficiaryId) continue;

          // Create new allocation
          const { error } = await supabase
            .from('asset_allocations')
            .insert({
              profile_id: profile.id,
              asset_id: assetId,
              beneficiary_id: beneficiaryId,
              allocation_percentage: Number(percentage)
            });

          if (error) throw error;
        }
      }

      // Remove asset from unsaved changes
      setUnsavedChanges(prev => {
        const next = new Set(prev);
        next.delete(assetId);
        return next;
      });

      toast.success('Allocation updated successfully');
      await refetchProfile();
    } catch (error) {
      console.error('Error updating allocation:', error);
      toast.error('Failed to update allocation');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResidueAllocationChange = (beneficiaryId: string, percentage: number) => {
    const member = selectedMembers.find(m => m.id === beneficiaryId);
    const allocationKey = member?.type === 'spouse' || member?.type === 'partner'
      ? member.type
      : beneficiaryId;
    
    setResidueAllocations(prev => ({
      ...prev,
      [allocationKey]: percentage
    }));
    setResidueUnsavedChanges(true);
  };

  const handleSaveResidueAllocations = async () => {
    if (!profile) return;
    
    try {
      setLocalLoading(true);
      
      // Fetch current beneficiaries to get the correct mapping
      const { data: beneficiaries, error: beneficiariesError } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('profile_id', profile.id);

      if (beneficiariesError) throw beneficiariesError;

      // Create mapping of family member/type to beneficiary ID
      const memberToBeneficiaryId = beneficiaries.reduce((acc, b) => {
        if (b.is_family_member) {
          const key = b.family_member_type === 'child' ? b.family_member_id : b.family_member_type;
          acc[key] = b.id;
        } else {
          acc[b.id] = b.id;
        }
        return acc;
      }, {} as Record<string, string>);

      // Convert member IDs to beneficiary IDs
      const validAllocations = Object.entries(residueAllocations).filter(([memberId]) => 
        memberId && 
        memberId !== 'undefined' &&
        memberToBeneficiaryId[memberId]
      );
      
      // Calculate total allocation
      const total = validAllocations.reduce((sum, [, value]) => sum + (value || 0), 0);
      
      if (total > 100) {
        toast.error('Total allocation cannot exceed 100%');
        return;
      }

      // Delete existing residue allocations
      const { error: deleteError } = await supabase
        .from('residue_allocations')
        .delete()
        .eq('profile_id', profile.id);

      if (deleteError) throw deleteError;

      // Create new allocations
      for (const [memberId, percentage] of Object.entries(residueAllocations)) {
        if (percentage > 0) {
          const beneficiaryId = memberToBeneficiaryId[memberId];
          if (!beneficiaryId) continue;

          const { error } = await supabase
            .from('residue_allocations')
            .insert({
              profile_id: profile.id,
              beneficiary_id: beneficiaryId,
              allocation_percentage: Number(percentage)
            });

          if (error) throw error;
        }
      }

      toast.success('Residue allocations saved successfully');
      await Promise.all([
        refetchBeneficiaries(),
        refetchProfile()
      ]);
      setResidueUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving residue allocations:', error);
      toast.error('Failed to save residue allocations');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCompleteStep = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      
      // Update profile beneficiaries_chosen flag
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          beneficiaries_chosen: true
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update estate score
      const { data: scoreData } = await supabase
        .from('estate_score')
        .select('total_score')
        .eq('profile_id', profile.id)
        .single();

      const newScore = Math.min((scoreData?.total_score || 0) + 20, 100);

      await supabase
        .from('estate_score')
        .update({
          total_score: newScore,
          last_updated: new Date().toISOString()
        })
        .eq('profile_id', profile.id);
      
      toast.success('Step 3 completed! Beneficiaries have been saved successfully.');
      await Promise.all([
        refetchBeneficiaries(),
        refetchProfile()
      ]);
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Failed to complete step');
    } finally {
      setSaving(false);
    }
  };

  const handleBeneficiaryDelete = async (beneficiary: any, isFamily: boolean) => {
    setLocalLoading(true);
    try {
      clearBeneficiariesCache();
      await handleDeleteBeneficiary(beneficiary, isFamily);
      // Refetch all necessary data
      await Promise.all([
        refetchProfile(),
        refetchBeneficiaries(),
        fetchAssets(),
        fetchResidueAllocations()
      ]);
    } finally {
      setLocalLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeSection === 'allocations') {
      fetchAssets();
    } else if (activeSection === 'residue' && profile) {
      fetchResidueAllocations();
    } else {
      // Clear allocations state when leaving the allocations section
      setAssetAllocations({});
      setUnsavedChanges(new Set());
      setResidueAllocations({});
    }
  }, [activeSection, profile]);

  React.useEffect(() => {
    // Scroll to top when component mounts
    document.getElementById('beneficiary-top')?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  const [showCommunityPropertyModal, setShowCommunityPropertyModal] = React.useState(false);
  const [communityPropertyModalShown, setCommunityPropertyModalShown] = React.useState(false);

  React.useEffect(() => {
    if (profile && !communityPropertyModalShown) {
      if (profile.marital_status === 'married' && profile.marriage_property_regime === 'in_community') {
        setShowCommunityPropertyModal(true);
        setCommunityPropertyModalShown(true);
      }
    }
  }, [profile, communityPropertyModalShown]);

  return (
    <div className="space-y-6" id="beneficiary-top">
      <BeneficiaryHeader onNavigate={onNavigate} />

      <BeneficiaryNav
        activeSection={activeSection}
        onSectionChange={(section) => {
          setActiveSection(section);
          if (section === 'beneficiaries') {
            refetchBeneficiaries();
          }
        }}
      />

      {activeSection === 'beneficiaries' && (
        <BeneficiarySection
          addMode={addMode}
          onModeChange={setAddMode}
          familyMembers={familyMembers}
          selectedMembers={selectedMembers}
          manualBeneficiaries={manualBeneficiaries}
          manualForm={manualForm}
          loading={loading || localLoading}
          onManualFormChange={(updates) => setManualForm(prev => ({ ...prev, ...updates }))}
          onAddFamilyMember={handleAddFamilyMember}
          onDeleteBeneficiary={handleBeneficiaryDelete}
          onManualSubmit={handleAddManualBeneficiary}
        />
      )}

      {activeSection === 'allocations' && (
        <AllocationSection
          assets={assets}
          selectedMembers={selectedMembers}
          manualBeneficiaries={manualBeneficiaries}
          assetAllocations={assetAllocations}
          unsavedChanges={unsavedChanges}
          loading={loading || localLoading}
          onAllocationChange={handleAllocationChange}
          onSaveAllocations={handleSaveAllocations}
        />
      )}

      {activeSection === 'residue' && (
        <ResidueSection
          selectedMembers={selectedMembers}
          manualBeneficiaries={manualBeneficiaries}
          residueAllocations={residueAllocations}
          loading={loading || localLoading}
          onResidueChange={handleResidueAllocationChange}
          onSaveResidue={handleSaveResidueAllocations}
          hasUnsavedChanges={residueUnsavedChanges}
        />
      )}
      <CompletionValidator
        profile={profile}
      >
        {(isValid) => (
          <button
            onClick={handleCompleteStep}
            disabled={!isValid || saving}
            className="complete-step-button"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Complete Step 3'
            )}
          </button>
        )}
      </CompletionValidator>
      
      <CommunityPropertyModal
        isOpen={showCommunityPropertyModal}
        onClose={() => setShowCommunityPropertyModal(false)}
      />
    </div>
  );
}

export default BeneficiaryScreen;