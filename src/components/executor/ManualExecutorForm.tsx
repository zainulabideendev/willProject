import React from 'react';
import { Loader2, UserCircle, BadgeCheck, User, FileText, Phone, Mail, MapPin, Plus, Trash2 } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface ManualExecutorFormProps {
  profileId: string;
  onExecutorSaved: () => void;
  editMode: boolean;
}

export function ManualExecutorForm({ profileId, onExecutorSaved, editMode }: ManualExecutorFormProps) {
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [executorsData, setExecutorsData] = React.useState([{
    title: '',
    first_names: '',
    last_name: '',
    id_number: '',
    phone: '',
    email: '',
    address: ''
  }]);
  const [activeExecutorIndex, setActiveExecutorIndex] = React.useState(0);
  const [showDeleteButtons, setShowDeleteButtons] = React.useState(false);
  const [savedExecutors, setSavedExecutors] = React.useState<Record<number, string>>({});
  const [hasPartnerFirm, setHasPartnerFirm] = React.useState(false);
  const [executorCount, setExecutorCount] = React.useState(0);

  // Add state to track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  React.useEffect(() => {
    const checkPartnerFirm = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('partner_firm_id')
          .eq('id', profileId)
          .single();

        if (error) throw error;
        setHasPartnerFirm(Boolean(data?.partner_firm_id));
      } catch (error) {
        console.error('Error checking partner firm:', error);
      }
    };

    checkPartnerFirm();
  }, [profileId]);

  const fetchExecutors = React.useCallback(async () => {
    if (!profileId) return;
    
    try {
      setLoading(true);
      const { data: executors, error } = await supabase
        .from('executors')
        .select('*')
        .eq('profile_id', profileId)
        .order('executor_order');

      if (error) throw error;

      if (executors && executors.length > 0) {
        setExecutorsData(executors.map(executor => ({
          title: executor.title || '',
          first_names: executor.first_names || '',
          last_name: executor.last_name || '',
          id_number: executor.id_number || '',
          phone: executor.phone || '',
          email: executor.email || '',
          address: executor.address || ''
        })));
        
        setExecutorCount(executors.length);
        // Map executor IDs to their indices
        const executorIds = executors.reduce((acc, executor, index) => ({
          ...acc,
          [index]: executor.id
        }), {});
        
        setSavedExecutors(executorIds);
        setShowDeleteButtons(executors.length > 1);
      } else {
        // Reset form if no executors
        setExecutorsData([{
          title: '',
          first_names: '',
          last_name: '',
          id_number: '',
          phone: '',
          email: '',
          address: ''
        }]);
        setExecutorCount(0);
        setSavedExecutors({});
        setShowDeleteButtons(false);
        setActiveExecutorIndex(0);
      }
    } catch (error) {
      console.error('Error fetching executors:', error);
      toast.error('Failed to load executors');
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  React.useEffect(() => {
    fetchExecutors();
  }, [profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    
    // Don't proceed if not in edit mode
    if (!editMode) return;

    try {
      setSaving(true);

      const currentExecutorData = executorsData[activeExecutorIndex];
      
      const { error } = await supabase
        .from('executors');

      if (savedExecutors[activeExecutorIndex]) {
        // Update existing executor
        const { error: updateError } = await supabase
          .from('executors')
          .update({
            ...currentExecutorData,
            updated_at: new Date().toISOString()
          })
          .eq('id', savedExecutors[activeExecutorIndex]);

        if (updateError) throw updateError;
      } else {
        // Insert new executor
        const { data: newExecutor, error: insertError } = await supabase
          .from('executors')
          .insert({
          profile_id: profileId,
          ...currentExecutorData,
          executor_order: activeExecutorIndex,
          is_primary: activeExecutorIndex === 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newExecutor) throw new Error('Failed to create executor');

        // Store the new executor ID
        setSavedExecutors(prev => ({
          ...prev,
          [activeExecutorIndex]: newExecutor.id
        }));
      }

      if (error) throw error;

      toast.success(savedExecutors[activeExecutorIndex] ? 'Executor updated successfully' : 'Executor added successfully');
      onExecutorSaved();
      await fetchExecutors();
    } catch (error) {
      console.error('Error adding executor:', error);
      toast.error('Failed to add executor');
    } finally {
      setSaving(false);
    }
  };

  const handleAddExecutor = React.useCallback(() => {
    setExecutorsData(prev => [...prev, {
      title: '',
      first_names: '',
      last_name: '',
      id_number: '',
      phone: '',
      email: '',
      address: ''
    }]);
    setActiveExecutorIndex(executorsData.length);
    setShowDeleteButtons(true);
  }, [executorsData.length]);

  const handleRemoveExecutor = async (index: number) => {
    try {
      setSaving(true);
      
      // Delete from database if saved
      if (savedExecutors[index]) {
        const { error } = await supabase
          .from('executors')
          .delete()
          .eq('id', savedExecutors[index]);

        if (error) throw error;

        // Update profile if this was the last executor
        if (executorCount === 1) {
          await supabase
            .from('profiles')
            .update({
              executor_type: null
            })
            .eq('id', profileId);
        }
      }

      // Update local state
      setExecutorsData(prev => prev.filter((_, i) => i !== index));
      setActiveExecutorIndex(Math.max(0, activeExecutorIndex - 1));
      setExecutorCount(prev => prev - 1);
      
      if (executorsData.length <= 2) {
        setShowDeleteButtons(false);
      }

      toast.success('Executor removed successfully');
      onExecutorSaved();
      await fetchExecutors();
    } catch (error) {
      console.error('Error removing executor:', error);
      toast.error('Failed to remove executor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 p-6 rounded-lg" style={{
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
      boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
    }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Executor Details</h2>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={handleAddExecutor}
                disabled={hasPartnerFirm || !editMode}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:transform hover:scale-105"
                style={{
                  opacity: (hasPartnerFirm || !editMode) ? 0.5 : 1,
                  cursor: (hasPartnerFirm || !editMode) ? 'not-allowed' : 'pointer'
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
                Add another executor
                <Tooltip.Arrow className="fill-[#2D2D2D]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {executorsData.map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <button 
              disabled={!editMode}
              onClick={() => setActiveExecutorIndex(index)}
              className={`child-pill ${activeExecutorIndex === index ? 'active' : ''}`}
              style={{
                opacity: !editMode ? 0.7 : 1,
                cursor: !editMode ? 'not-allowed' : 'pointer'
              }}
            >
              Executor {index + 1}
              {showDeleteButtons && index > 0 && (
                <button
                  disabled={!editMode}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveExecutor(index);
                  }}
                  className={`delete-child-button ${showDeleteButtons ? 'visible' : ''}`}
                  style={{
                    opacity: !editMode ? 0.7 : 1,
                    cursor: !editMode ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
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
              value={executorsData[activeExecutorIndex]?.title || ''}
              onChange={(e) => {
                const newData = [...executorsData];
                newData[activeExecutorIndex] = { ...newData[activeExecutorIndex], title: e.target.value };
                setExecutorsData(newData);
                setHasUnsavedChanges(true);
              }}
              className="input-field pl-10"
              required
              disabled={!editMode}
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
              disabled={!editMode}
              type="text"
              value={executorsData[activeExecutorIndex]?.first_names || ''}
              onChange={(e) => {
                const newData = [...executorsData];
                newData[activeExecutorIndex] = { ...newData[activeExecutorIndex], first_names: e.target.value };
                setExecutorsData(newData);
                setHasUnsavedChanges(true);
              }}
              className="input-field pl-10"
              placeholder="Enter executor's first names"
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
              disabled={!editMode}
              type="text"
              value={executorsData[activeExecutorIndex]?.last_name || ''}
              onChange={(e) => {
                const newData = [...executorsData];
                newData[activeExecutorIndex] = { ...newData[activeExecutorIndex], last_name: e.target.value };
                setExecutorsData(newData);
                setHasUnsavedChanges(true);
              }}
              className="input-field pl-10"
              placeholder="Enter executor's last name"
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
              disabled={!editMode}
              type="text"
              value={executorsData[activeExecutorIndex]?.id_number || ''}
              onChange={(e) => {
                const newData = [...executorsData];
                newData[activeExecutorIndex] = { ...newData[activeExecutorIndex], id_number: e.target.value };
                setExecutorsData(newData);
                setHasUnsavedChanges(true);
              }}
              className="input-field pl-10"
              placeholder="Enter executor's ID number"
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
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
            <input
              disabled={!editMode}
              type="tel"
              value={executorsData[activeExecutorIndex]?.phone || ''}
              onChange={(e) => {
                const newData = [...executorsData];
                newData[activeExecutorIndex] = { ...newData[activeExecutorIndex], phone: e.target.value };
                setExecutorsData(newData);
                setHasUnsavedChanges(true);
              }}
              className="input-field pl-10"
              placeholder="Enter executor's phone number"
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
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
            <input
              disabled={!editMode}
              type="email"
              value={executorsData[activeExecutorIndex]?.email || ''}
              onChange={(e) => {
                const newData = [...executorsData];
                newData[activeExecutorIndex] = { ...newData[activeExecutorIndex], email: e.target.value };
                setExecutorsData(newData);
                setHasUnsavedChanges(true);
              }}
              className="input-field pl-10"
              placeholder="Enter executor's email address"
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
              disabled={!editMode}
              value={executorsData[activeExecutorIndex]?.address || ''}
              onChange={(e) => {
                const newData = [...executorsData];
                newData[activeExecutorIndex] = { ...newData[activeExecutorIndex], address: e.target.value };
                setExecutorsData(newData);
                setHasUnsavedChanges(true);
              }}
              className="input-field pl-10 min-h-[100px]"
              placeholder="Enter executor's address"
              style={{
                opacity: !editMode ? 0.7 : 1,
                cursor: !editMode ? 'not-allowed' : 'auto'
              }}
              required
            />
          </div>
        </div>

        {savedExecutors[activeExecutorIndex] ? (
        <button
          type="button"
          disabled={saving || hasPartnerFirm || !editMode}
          onClick={(e) => {
            e.preventDefault();
            handleRemoveExecutor(activeExecutorIndex);
          }}
          className="w-full mt-6 py-2 px-4 text-white rounded-lg transition-all text-sm"
          style={{
            background: '#ef4444',
            boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
            opacity: (saving || hasPartnerFirm || !editMode) ? 0.5 : 1,
            cursor: (saving || hasPartnerFirm || !editMode) ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
          ) : hasPartnerFirm ? (
            'Partner Firm Selected'
          ) : (
            'Remove Executor'
          )}
        </button>
        ) : (
        <button
          type="submit"
          disabled={saving || hasPartnerFirm || !editMode || !hasUnsavedChanges}
          className="w-full mt-6 py-2 px-4 text-white rounded-lg transition-all text-sm"
          style={{
            background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
            boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
            opacity: (saving || hasPartnerFirm || !editMode || !hasUnsavedChanges) ? 0.5 : 1,
            cursor: (saving || hasPartnerFirm || !editMode || !hasUnsavedChanges) ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
          ) : hasPartnerFirm ? (
            'Partner Firm Selected'
          ) : (
            'Add Executor'
          )}
        </button>
        )}
      </form>
    </div>
  );
  
  // Listen for save events from parent component
  React.useEffect(() => {
    const handleSaveEvent = () => {
      if (editMode) {
        // Trigger form submission programmatically
        if (hasUnsavedChanges) {
          handleSubmit(new Event('submit') as React.FormEvent);
          setHasUnsavedChanges(false);
        } else if (savedExecutors[activeExecutorIndex]) {
          // If we have a saved executor but no changes, still consider it a success
          toast.success('Executor details are up to date');
        }
      }
    };
    
    window.addEventListener('executor-save-changes', handleSaveEvent);
    return () => {
      window.removeEventListener('executor-save-changes', handleSaveEvent);
    };
  }, [hasUnsavedChanges, editMode, executorsData, activeExecutorIndex]);
}