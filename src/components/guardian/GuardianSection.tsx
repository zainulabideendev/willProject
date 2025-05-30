import React from 'react';
import { Users, AlertCircle, UserCircle, BadgeCheck, User, FileText, Phone, Heart, MapPin } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Child {
  id: string;
  first_names: string;
  last_name: string;
  date_of_birth: string;
}

interface GuardianSectionProps {
  profileId: string;
  editMode?: boolean;
  onGuardianSaved: () => void;
  guardian_title?: string;
  guardian_first_names?: string;
  guardian_last_name?: string;
  guardian_id_number?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
  guardian_address?: string;
}

export function GuardianSection({ 
  editMode = true,
  profileId,
  onGuardianSaved,
  guardian_title,
  guardian_first_names,
  guardian_last_name,
  guardian_id_number,
  guardian_phone,
  guardian_relationship,
  guardian_address
}: GuardianSectionProps) {
  const [minorChildren, setMinorChildren] = React.useState<Child[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [hasGuardian, setHasGuardian] = React.useState(false);
  const [guardianData, setGuardianData] = React.useState(() => {
    // Try to get data from localStorage first
    const savedData = localStorage.getItem(`guardian-data-${profileId}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
    // Fall back to props
    return {
      title: guardian_title || '',
      first_names: guardian_first_names || '',
      last_name: guardian_last_name || '',
      id_number: guardian_id_number || '',
      phone: guardian_phone || '',
      relationship: guardian_relationship || '',
      address: guardian_address || ''
    };
  });
  const [isFormValid, setIsFormValid] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Validate form whenever fields change
  React.useEffect(() => {
    const isValid = Object.values(guardianData).every(value => value.trim() !== '');
    setHasGuardian(isValid);
    setIsFormValid(isValid);
  }, [guardianData]);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleFieldUpdate = (updates: Partial<typeof guardianData>) => {
    setGuardianData(prev => ({ ...prev, ...updates }));
    // Save to localStorage
    const updatedData = { ...guardianData, ...updates };
    localStorage.setItem(`guardian-data-${profileId}`, JSON.stringify(updatedData));
  };

  const handleSaveGuardian = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          guardian_title: guardianData.title,
          guardian_first_names: guardianData.first_names,
          guardian_last_name: guardianData.last_name,
          guardian_id_number: guardianData.id_number,
          guardian_phone: guardianData.phone,
          guardian_relationship: guardianData.relationship,
          guardian_address: guardianData.address
        })
        .eq('id', profileId);

      if (error) throw error;

      onGuardianSaved();
      toast.success('Guardian details updated successfully');
    } catch (error) {
      console.error('Error updating guardian details:', error);
      toast.error('Failed to update guardian details');
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    async function fetchChildren() {
      try {
        setLoading(true);
        const { data: children, error } = await supabase
          .from('children')
          .select('id, first_names, last_name, date_of_birth')
          .eq('profile_id', profileId)
          .not('date_of_birth', 'is', null);

        if (error) throw error;

        // Filter for children under 18
        const today = new Date();
        const minors = children?.filter(child => {
          if (!child.date_of_birth) return false;
          const birthDate = new Date(child.date_of_birth);
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 < 18;
          }
          return age < 18;
        }) || [];

        setMinorChildren(minors);
      } catch (error) {
        console.error('Error fetching children:', error);
        toast.error('Failed to load children');
      } finally {
        setLoading(false);
      }
    }

    fetchChildren();
  }, [profileId]);

  if (loading) {
    return (
      <div className="mt-4 p-6 rounded-lg\" style={{
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
      }}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0047AB]" />
        </div>
      </div>
    );
  }

  if (minorChildren.length === 0) {
    return (
      <div className="mt-4 p-6 rounded-lg" style={{
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
      }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{
            background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
            color: 'white'
          }}>
            <Users className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-base font-semibold">Legal Guardian</h3>
        </div>

        <div className="text-center py-8">
          <p className="text-[#2D2D2D]/60 text-sm">
            No minor children found. Only children under 18 years old require a legal guardian.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-6 rounded-lg" style={{
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
      boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
    }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{
          background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
          color: 'white'
        }}>
          <Users className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-base font-semibold">Legal Guardian</h3>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button className="p-1 rounded-full hover:bg-black/5 transition-colors">
                <AlertCircle className="w-3.5 h-3.5 text-[#2D2D2D]/60" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="max-w-[calc(100vw-2rem)] sm:max-w-md text-white text-xs px-3 py-2 rounded-lg"
                side="top"
                align="center"
                avoidCollisions={true}
                style={{
                  background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                  boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                }}
                sideOffset={5}
              >
                Appoint a legal guardian for your minor children (under 18 years old).
                <Tooltip.Arrow className="fill-[#0047AB]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      <div className="space-y-4">
        {minorChildren.map((child) => (
          <div
            key={child.id}
            className="family-member-card"
          >
            <div className="member-icon">
              <Users className="w-4 h-4" />
            </div>
            <div className="member-details">
              <h3 className="member-name">
                {child.first_names} {child.last_name}
              </h3>
              <p className="member-type">
                {calculateAge(child.date_of_birth)} years old
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 space-y-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-base font-semibold">Guardian Details</h3>
        </div>

        <div className="space-y-4">
          <div className="input-group">
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Title
            </label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <select
                value={guardianData.title}
                onChange={(e) => {
                  handleFieldUpdate({ title: e.target.value });
                }}
                disabled={!editMode}
                className="input-field pl-10"
                style={{
                  opacity: !editMode ? 0.7 : 1,
                  cursor: !editMode ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">Select a title</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              First Names
            </label>
            <div className="relative">
              <BadgeCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="text"
                value={guardianData.first_names}
                onChange={(e) => {
                  handleFieldUpdate({ first_names: e.target.value });
                }}
                disabled={!editMode}
                className="input-field pl-10"
                placeholder="Enter guardian's first names"
                style={{
                  opacity: !editMode ? 0.7 : 1,
                  cursor: !editMode ? 'not-allowed' : 'auto'
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="text"
                value={guardianData.last_name}
                onChange={(e) => {
                  handleFieldUpdate({ last_name: e.target.value });
                }}
                disabled={!editMode}
                className="input-field pl-10"
                placeholder="Enter guardian's last name"
                style={{
                  opacity: !editMode ? 0.7 : 1,
                  cursor: !editMode ? 'not-allowed' : 'auto'
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              ID Number
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="text"
                value={guardianData.id_number}
                onChange={(e) => {
                  handleFieldUpdate({ id_number: e.target.value });
                }}
                disabled={!editMode}
                className="input-field pl-10"
                placeholder="Enter guardian's ID number"
                style={{
                  opacity: !editMode ? 0.7 : 1,
                  cursor: !editMode ? 'not-allowed' : 'auto'
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Cellphone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="tel"
                value={guardianData.phone}
                onChange={(e) => {
                  handleFieldUpdate({ phone: e.target.value });
                }}
                disabled={!editMode}
                className="input-field pl-10"
                placeholder="Enter guardian's cellphone number"
                style={{
                  opacity: !editMode ? 0.7 : 1,
                  cursor: !editMode ? 'not-allowed' : 'auto'
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Relationship
            </label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <input
                type="text"
                value={guardianData.relationship}
                onChange={(e) => {
                  handleFieldUpdate({ relationship: e.target.value });
                }}
                disabled={!editMode}
                className="input-field pl-10"
                placeholder="Enter relationship to children"
                style={{
                  opacity: !editMode ? 0.7 : 1,
                  cursor: !editMode ? 'not-allowed' : 'auto'
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#2D2D2D]/60" />
              <textarea
                value={guardianData.address}
                onChange={(e) => {
                  handleFieldUpdate({ address: e.target.value });
                }}
                disabled={!editMode}
                className="input-field pl-10 min-h-[100px]"
                placeholder="Enter guardian's address"
                style={{
                  opacity: !editMode ? 0.7 : 1,
                  cursor: !editMode ? 'not-allowed' : 'auto'
                }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveGuardian}
          disabled={!isFormValid || saving || !editMode}
          className="w-full mt-6 py-2 px-4 text-white rounded-lg transition-all text-sm"
          style={{
            background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
            boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
            opacity: (!isFormValid || saving || !editMode) ? 0.5 : 1,
            cursor: (!isFormValid || saving || !editMode) ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
          ) : (
            'Save Guardian Details'
          )}
        </button>
      </div>
    </div>
  );
}