import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, UserCircle, BadgeCheck, User, FileText, Phone, Heart, MapPin, Plus, Trash2 } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner'; 

interface ManualFormData {
  title: string;
  first_names: string;
  last_name: string;
  id_number: string;
  relationship: string;
  phone: string;
  address: string;
}

interface ManualBeneficiaryFormProps {
  profileId: string;
  onBeneficiarySaved: () => Promise<void>;
  editMode: boolean;
  loading?: boolean;
}

export function ManualBeneficiaryForm({
  profileId,
  onBeneficiarySaved,
  editMode,
  loading
}: ManualBeneficiaryFormProps) {
  const [manualBeneficiariesData, setManualBeneficiariesData] = useState<(ManualFormData & { id?: string })[]>([{
    title: '',
    first_names: '',
    last_name: '',
    id_number: '',
    relationship: '',
    phone: '',
    address: ''
  }]);
  const [activeBeneficiaryIndex, setActiveBeneficiaryIndex] = useState(0);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const [savedBeneficiaries, setSavedBeneficiaries] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const fetchManualBeneficiaries = useCallback(async () => {
    if (!profileId) return;
    
    try {
      setLocalLoading(true);
      
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_family_member', false)
        .order('created_at');

      if (error) throw error;

      if (data && data.length > 0) {
        // Map database records to form data format
        const formattedBeneficiaries = data.map(beneficiary => ({
          id: beneficiary.id,
          title: beneficiary.title || '',
          first_names: beneficiary.first_names || '',
          last_name: beneficiary.last_name || '',
          id_number: beneficiary.id_number || '',
          relationship: beneficiary.relationship || '',
          phone: beneficiary.phone || '',
          address: beneficiary.address || ''
        }));
        
        setManualBeneficiariesData(formattedBeneficiaries);
        
        // Map beneficiary IDs to their indices
        const beneficiaryIds = formattedBeneficiaries.reduce((acc, _, index) => ({
          ...acc,
          [index]: data[index].id
        }), {});
        
        setSavedBeneficiaries(beneficiaryIds);
        setShowDeleteButtons(formattedBeneficiaries.length > 1);
      } else {
        // Reset to default empty state
        setManualBeneficiariesData([{
          title: '',
          first_names: '',
          last_name: '',
          id_number: '',
          relationship: '',
          phone: '',
          address: ''
        }]);
        setSavedBeneficiaries({});
        setShowDeleteButtons(false);
      }
      
      setActiveBeneficiaryIndex(0);
    } catch (error) {
      console.error('Error fetching manual beneficiaries:', error);
      toast.error('Failed to load beneficiaries');
    } finally {
      setLocalLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchManualBeneficiaries();
  }, [fetchManualBeneficiaries]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setManualBeneficiariesData(prev => {
      const newData = [...prev];
      if (!newData[activeBeneficiaryIndex]) {
        newData[activeBeneficiaryIndex] = {
          title: '',
          first_names: '',
          last_name: '',
          id_number: '',
          relationship: '',
          phone: '',
          address: ''
        };
      }
      newData[activeBeneficiaryIndex] = {
        ...newData[activeBeneficiaryIndex],
        [field]: value
      };
      setHasUnsavedChanges(true);
      return newData;
    });
  }, [activeBeneficiaryIndex]);

  const handleAddBeneficiary = useCallback(() => {
    const emptyBeneficiary = {
      title: '',
      first_names: '',
      last_name: '',
      id_number: '',
      relationship: '',
      phone: '',
      address: ''
    };
    setManualBeneficiariesData(prev => [...prev, emptyBeneficiary]);
    setActiveBeneficiaryIndex(manualBeneficiariesData.length);
    setShowDeleteButtons(true);
  }, [manualBeneficiariesData.length]);

  const handleDeleteBeneficiary = async (indexToDelete: number) => {
    if (!profileId) return;
    
    try {
      setSaving(true);

      // Check if this beneficiary already exists in the database
      if (savedBeneficiaries[indexToDelete]) {
        // Delete existing beneficiary
        const { error } = await supabase
          .from('beneficiaries')
          .delete()
          .eq('id', savedBeneficiaries[indexToDelete]);

        if (error) throw error;
      }

      // Remove beneficiary from local state
      setManualBeneficiariesData(prev => prev.filter((_, i) => i !== indexToDelete));

      // Update savedBeneficiaries state by removing the deleted beneficiary and adjusting indices
      const newSavedBeneficiaries: Record<number, string> = {};
      Object.entries(savedBeneficiaries).forEach(([key, value]) => {
        const keyNum = parseInt(key);
        if (keyNum < indexToDelete) {
          newSavedBeneficiaries[keyNum] = value;
        } else if (keyNum > indexToDelete) {
          newSavedBeneficiaries[keyNum - 1] = value;
        }
      });
      setSavedBeneficiaries(newSavedBeneficiaries);

      // Update active index if necessary
      if (activeBeneficiaryIndex >= indexToDelete) {
        setActiveBeneficiaryIndex(Math.max(0, activeBeneficiaryIndex - 1));
      }

      // Update delete buttons visibility
      setShowDeleteButtons(Object.keys(newSavedBeneficiaries).length > 0);

      toast.success('Beneficiary removed successfully');
      await onBeneficiarySaved();
    } catch (error) {
      console.error('Error removing beneficiary:', error);
      toast.error('Failed to remove beneficiary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    
    const currentBeneficiaryData = manualBeneficiariesData[activeBeneficiaryIndex];
    if (!currentBeneficiaryData) return;

    try {
      setSaving(true);
      
      const beneficiaryData = {
        profile_id: profileId,
        title: currentBeneficiaryData.title,
        first_names: currentBeneficiaryData.first_names,
        last_name: currentBeneficiaryData.last_name,
        id_number: currentBeneficiaryData.id_number,
        relationship: currentBeneficiaryData.relationship,
        phone: currentBeneficiaryData.phone,
        address: currentBeneficiaryData.address,
        is_family_member: false
      };

      if (savedBeneficiaries[activeBeneficiaryIndex]) {
        // Update existing beneficiary
        const { error } = await supabase
          .from('beneficiaries')
          .update(beneficiaryData)
          .eq('id', savedBeneficiaries[activeBeneficiaryIndex]);

        if (error) throw error;
        
        toast.success('Beneficiary updated successfully');
      } else {
        // Create new beneficiary
        const { data, error } = await supabase
          .from('beneficiaries')
          .insert(beneficiaryData)
          .select()
          .single();

        if (error) throw error;

        // Store the beneficiary ID for this index
        setSavedBeneficiaries(prev => ({
          ...prev,
          [activeBeneficiaryIndex]: data.id
        }));

        toast.success('Beneficiary added successfully');
      }

      await onBeneficiarySaved();
    } catch (error) {
      console.error('Error saving beneficiary:', error);
      toast.error('Failed to update beneficiary');
    } finally {
      setSaving(false);
    }
  };

  // Function to save current beneficiary data
  const saveCurrentBeneficiary = async () => {
    if (!profileId || !hasUnsavedChanges) return;
    
    const currentBeneficiaryData = manualBeneficiariesData[activeBeneficiaryIndex];
    if (!currentBeneficiaryData) return;

    try {
      setSaving(true);
      
      const beneficiaryData = {
        profile_id: profileId,
        title: currentBeneficiaryData.title,
        first_names: currentBeneficiaryData.first_names,
        last_name: currentBeneficiaryData.last_name,
        id_number: currentBeneficiaryData.id_number,
        relationship: currentBeneficiaryData.relationship,
        phone: currentBeneficiaryData.phone,
        address: currentBeneficiaryData.address,
        is_family_member: false
      };

      if (savedBeneficiaries[activeBeneficiaryIndex]) {
        // Update existing beneficiary
        const { error } = await supabase
          .from('beneficiaries')
          .update(beneficiaryData)
          .eq('id', savedBeneficiaries[activeBeneficiaryIndex]);

        if (error) throw error;
        
        toast.success('Beneficiary updated successfully');
      } else {
        // Create new beneficiary
        const { data, error } = await supabase
          .from('beneficiaries')
          .insert(beneficiaryData)
          .select()
          .single();

        if (error) throw error;

        // Store the beneficiary ID for this index
        setSavedBeneficiaries(prev => ({
          ...prev,
          [activeBeneficiaryIndex]: data.id
        }));

        toast.success('Beneficiary added successfully');
      }

      setHasUnsavedChanges(false);
      await onBeneficiarySaved();
    } catch (error) {
      console.error('Error saving beneficiary:', error);
      toast.error('Failed to save beneficiary');
    } finally {
      setSaving(false);
    }
  };

  // Expose the save function to parent components
  React.useEffect(() => {
    // Register a global event listener for the save action
    const handleSaveEvent = () => {
      if (hasUnsavedChanges) {
        saveCurrentBeneficiary();
      }
    };

    window.addEventListener('beneficiary-save-changes', handleSaveEvent);
    
    return () => {
      window.removeEventListener('beneficiary-save-changes', handleSaveEvent);
    };
  }, [hasUnsavedChanges, activeBeneficiaryIndex, manualBeneficiariesData]);

  const currentBeneficiary = manualBeneficiariesData[activeBeneficiaryIndex] || {
    title: '',
    first_names: '',
    last_name: '',
    id_number: '',
    relationship: '',
    phone: '',
    address: ''
  };

  if (localLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="children-details-title">
          <h3 className="text-base font-semibold">Beneficiary Details</h3>
        </div>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                disabled={!editMode}
                onClick={handleAddBeneficiary}
                className="add-child-button"
                style={{
                  opacity: !editMode ? 0.7 : 1,
                  cursor: !editMode ? 'not-allowed' : 'pointer'
                }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-[#2D2D2D] text-white text-sm px-2 py-1 rounded"
                sideOffset={5}
              >
                Add another beneficiary
                <Tooltip.Arrow className="fill-[#2D2D2D]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
      
      <div className="flex gap-2 mb-6 flex-wrap">
        {manualBeneficiariesData.map((beneficiary, index) => (
          <div key={index} className="flex items-center gap-2">
            <button
              disabled={!editMode}
              onClick={() => setActiveBeneficiaryIndex(index)}
              className={`child-pill ${
                activeBeneficiaryIndex === index
                  ? 'active' 
                  : ''
              }`}
              style={{
                opacity: !editMode ? 0.7 : 1,
                cursor: !editMode ? 'not-allowed' : 'pointer'
              }}>
              Beneficiary {index + 1}
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="input-group">
        <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
          Title
        </label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
          <select
            value={currentBeneficiary.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={!editMode}
            className="input-field pl-10"
            style={{
              opacity: !editMode ? 0.7 : 1,
              cursor: !editMode ? 'not-allowed' : 'pointer'
            }}
            required
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
            value={currentBeneficiary.first_names}
            disabled={!editMode}
            onChange={(e) => handleInputChange('first_names', e.target.value)}
            className="input-field pl-10"
            placeholder="Enter first names"
            style={{
              opacity: !editMode ? 0.7 : 1,
              cursor: !editMode ? 'not-allowed' : 'auto'
            }}
            required
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
            value={currentBeneficiary.last_name}
            disabled={!editMode}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className="input-field pl-10"
            placeholder="Enter last name"
            style={{
              opacity: !editMode ? 0.7 : 1,
              cursor: !editMode ? 'not-allowed' : 'auto'
            }}
            required
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
            value={currentBeneficiary.id_number}
            disabled={!editMode}
            onChange={(e) => handleInputChange('id_number', e.target.value)}
            className="input-field pl-10"
            placeholder="Enter ID number"
            style={{
              opacity: !editMode ? 0.7 : 1,
              cursor: !editMode ? 'not-allowed' : 'auto'
            }}
            required
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
            value={currentBeneficiary.relationship}
            disabled={!editMode}
            onChange={(e) => handleInputChange('relationship', e.target.value)}
            className="input-field pl-10"
            placeholder="Enter relationship"
            style={{
              opacity: !editMode ? 0.7 : 1,
              cursor: !editMode ? 'not-allowed' : 'auto'
            }}
            required
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
            value={currentBeneficiary.address || ''}
            disabled={!editMode}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="input-field pl-10 min-h-[80px]"
            placeholder="Enter address"
            style={{
              opacity: !editMode ? 0.7 : 1,
              cursor: !editMode ? 'not-allowed' : 'auto'
            }}
            required
          />
        </div>
      </div>

      <div className="input-group">
        <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
          Cell Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
          <input
            type="tel"
            value={currentBeneficiary.phone}
            disabled={!editMode}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="input-field pl-10"
            placeholder="Enter cell number"
            style={{
              opacity: !editMode ? 0.7 : 1,
              cursor: !editMode ? 'not-allowed' : 'auto'
            }}
            required
          />
        </div>
      </div>

      <button
        type={savedBeneficiaries[activeBeneficiaryIndex] ? 'button' : 'submit'}
        disabled={saving || loading}
        className={`add-beneficiary-button ${savedBeneficiaries[activeBeneficiaryIndex] ? 'bg-red-500 hover:bg-red-600' : ''}`}
        style={{
          opacity: (saving || loading) ? 0.5 : 1,
          cursor: (saving || loading) ? 'not-allowed' : 'pointer',
          background: savedBeneficiaries[activeBeneficiaryIndex] ? '#ef4444' : ''
        }}
        onClick={(e) => {
          if (savedBeneficiaries[activeBeneficiaryIndex]) {
            e.preventDefault();
            handleDeleteBeneficiary(activeBeneficiaryIndex);
          } else if (editMode && !savedBeneficiaries[activeBeneficiaryIndex]) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      >
        {saving || loading ? (
          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
        ) : (savedBeneficiaries[activeBeneficiaryIndex]) ? (
          'Remove Beneficiary'
        ) : (
          'Add Beneficiary'
        )}
      </button>
    </form>
    </div>
  );
}