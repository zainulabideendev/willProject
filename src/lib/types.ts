import React from 'react';
import { useProfile } from './hooks';
export interface FamilyMember {
  id: string;
  profile_id?: string;
  type: 'spouse' | 'child';
  title: string;
  first_names: string;
  last_name: string;
  id_number: string;
  phone: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  date_of_birth?: string;
  address?: string;
  marital_status?: string;
  marriage_property_regime?: string;
  email?: string;
  phone?: string;
  id_number?: string;
  title?: string;
  spouse_title?: string;
  spouse_first_name?: string;
  spouse_last_name?: string;
  spouse_email?: string;
  spouse_phone?: string;
  spouse_id_number?: string;
  profile_setup_complete?: boolean;
  assets_added?: boolean;
  beneficiaries_chosen?: boolean;
  last_wishes_documented?: boolean;
  executor_chosen?: boolean;
  will_reviewed?: boolean;
  welcome_modal_shown?: boolean;
  has_children?: boolean;
  spouse_uuid?: string;
  partner_uuid?: string;
  beneficiary_count?: number;
  assets_fully_allocated?: boolean;
  residue_fully_allocated?: boolean;
  has_beneficiaries?: boolean;
  partner_firm_id?: string;
  role?: any;
  guardian_title?: string;
  guardian_first_names?: string;
  guardian_last_name?: string;
  guardian_id_number?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
  guardian_address?: string;
  burial_type?: string;
  memorial_type?: string;
  memorial_message?: string;
  last_message?: string;
  will_downloaded?: boolean;
  // role?: 'super_admin' | 'user';
}

export interface EstateScore {
  id: string;
  profile_id: string;
  total_score: number;
  beneficiary_score?: number;
  asset_coverage_score?: number;
  last_updated: string;
}

export interface Child {
  id: string;
  profile_id: string;
  title?: string;
  first_names: string;
  last_name: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  id_number?: string;
  order?: number;
}

export interface Asset {
  id: string;
  name: string;
  asset_type: string;
  estimated_value: number;
  details: Record<string, any>;
  is_fully_paid?: boolean;
  debt_handling_method?: string;
}

function BeneficiaryPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [activeSection, setActiveSection] = React.useState<NavSection>('beneficiaries');
  const [addMode, setAddMode] = React.useState<AddMode>('family');
  const { profile, loading: profileLoading } = useProfile();
  const [familyMembers, setFamilyMembers] = React.useState<FamilyMember[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedMembers, setSelectedMembers] = React.useState<FamilyMember[]>([]);
  const [manualBeneficiaries, setManualBeneficiaries] = React.useState<any[]>([]);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [assetAllocations, setAssetAllocations] = React.useState<Record<string, Record<string, number>>>({});
  const [unsavedChanges, setUnsavedChanges] = React.useState<Set<string>>(new Set());
  const [saving, setSaving] = React.useState(false);
  const [manualForm, setManualForm] = React.useState({
    title: '',
    first_names: '',
    last_name: '',
    id_number: '',
    relationship: '',
    phone: ''
  });

  React.useEffect(() => {
    if (!profile) return;
    
    async function fetchBeneficiaries() {
      setLoading(true);
      try {
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

        // Set family members
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
      } catch (error) {
        console.error('Error fetching family members:', error);
        toast.error('Failed to load family members');
      } finally {
        setLoading(false);
      }
    }

    fetchBeneficiaries();
  }, [profile]);

  return (
    <div className="space-y-6" id="beneficiary-top">
      {/* Rest of the component JSX */}
    </div>
  );
}