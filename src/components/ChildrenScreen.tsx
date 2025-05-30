import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Baby as BabyIcon, Users, Plus, Trash2, UserCircle, BadgeCheck, User, Calendar, Mail, Phone, FileText, Edit, Save } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useProfile, useUpdateProfile, useEstateScore } from '../lib/hooks';
import { StepProgressBar } from './StepProgressBar';
import { Child } from '../lib/types';
import { supabase } from '../lib/supabase';
import './ChildrenScreen.css';

interface ChildData {
  title: string;
  first_names: string;
  last_name: string;
  email: string;
  cellphone: string;
  id_number: string;
  date_of_birth: string;
  address: string;
}

interface ChildrenScreenProps {
  onNavigate: (screen: string) => void;
}

const defaultChildData: ChildData = {
  title: '',
  first_names: '',
  last_name: '',
  email: '',
  cellphone: '',
  id_number: '',
  date_of_birth: '',
  address: ''
};

const ChildFormFields: React.FC<{
  childData: ChildData;
  onChange: (updates: Partial<ChildData>) => void;
  required: boolean;
  disabled?: boolean;
}> = ({ childData, onChange, required, disabled = false }) => (
  <div className="space-y-6">
    <div className="input-group">
      <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
        Title
      </label>
      <div className="relative">
        <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
        <select
          value={childData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="input-field pl-10"
          disabled={disabled}
          style={{
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          required={required}
        >
          <option value="">Select a title</option>
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Ms">Ms</option>
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
          value={childData.first_names}
          onChange={(e) => onChange({ first_names: e.target.value })}
          className="input-field pl-10"
          placeholder="Enter child's first names"
          disabled={disabled}
          style={{
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? 'not-allowed' : 'auto'
          }}
          required={required}
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
          value={childData.last_name}
          onChange={(e) => onChange({ last_name: e.target.value })}
          className="input-field pl-10"
          placeholder="Enter child's last name"
          disabled={disabled}
          style={{
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? 'not-allowed' : 'auto'
          }}
          required={required}
        />
      </div>
    </div>

    <div className="input-group">
      <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
        Date of Birth
      </label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
        <input
          type="date"
          value={childData.date_of_birth}
          onChange={(e) => onChange({ date_of_birth: e.target.value })}
          className="input-field pl-10"
          disabled={disabled}
          style={{
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? 'not-allowed' : 'auto'
          }}
          required={required}
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
          type="email"
          value={childData.email}
          onChange={(e) => onChange({ email: e.target.value })}
          className="input-field pl-10"
          placeholder="Enter child's email address"
          disabled={disabled}
          style={{
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? 'not-allowed' : 'auto'
          }}
          required={required}
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
          value={childData.cellphone}
          onChange={(e) => onChange({ cellphone: e.target.value })}
          className="input-field pl-10"
          placeholder="Enter child's cellphone number"
          disabled={disabled}
          style={{
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? 'not-allowed' : 'auto'
          }}
          required={required}
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
          value={childData.id_number}
          onChange={(e) => onChange({ id_number: e.target.value })}
          className="input-field pl-10"
          placeholder="Enter child's ID number"
          disabled={disabled}
          style={{
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? 'not-allowed' : 'auto'
          }}
          required={required}
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
          value={childData.address || ''}
          onChange={(e) => onChange({ address: e.target.value })}
          className="input-field pl-10 min-h-[80px]"
          placeholder="Enter child's address"
          disabled={disabled}
          style={{
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? 'not-allowed' : 'auto'
          }}
          required={required}
        />
      </div>
    </div>
  </div>
);

export function ChildrenScreen({ onNavigate }: ChildrenScreenProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();
  const [previousScreen, setPreviousScreen] = React.useState<string>('marriage-status');
  const { score, loading: scoreLoading } = useEstateScore(profile?.id);
  const [editMode, setEditMode] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [hasChildren, setHasChildren] = React.useState<boolean | null>(null);
  const [existingChildren, setExistingChildren] = React.useState<Child[]>([]);
  const [activeChildIndex, setActiveChildIndex] = React.useState(0);
  const [childrenData, setChildrenData] = React.useState<ChildData[]>([defaultChildData]);
  const [saving, setSaving] = React.useState(false);
  const [showDeleteButtons, setShowDeleteButtons] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setHasChildren(profile.has_children);
      setPreviousScreen(profile.marital_status === 'married' || !profile.has_life_partner 
        ? 'marriage-status' 
        : 'life-partner'
      );
      fetchChildData();
      // For new users (who haven't completed profile setup), always stay in edit mode
      // For existing users (who have completed profile setup), start in view mode
      setEditMode(!profile.profile_setup_complete || false);
    }
  }, [profile]);

  const fetchChildData = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', profile.id)
        .order('order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setExistingChildren(data);
        setChildrenData(data.map(child => ({
          title: child.title || '',
          first_names: child.first_names || '',
          last_name: child.last_name || '',
          email: child.email || '',
          cellphone: child.phone || '',
          id_number: child.id_number || '',
          date_of_birth: child.date_of_birth || '',
          address: child.address || ''
        })));
      } else {
        setExistingChildren([]);
        setChildrenData([defaultChildData]);
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || hasChildren === null) return;

    setSaving(true);

    try {
      const updates: any = {
        has_children: hasChildren,
        profile_setup_complete: true
      };

      await updateProfile(profile.id, updates);

      if (!hasChildren) {
        const { error: deleteError } = await supabase
          .from('children')
          .delete()
          .eq('profile_id', profile.id);

        if (deleteError) throw deleteError;
      }

      if (hasChildren) {
        if (existingChildren.length > 0) {
          const { error: deleteError } = await supabase
            .from('children')
            .delete()
            .eq('profile_id', profile.id);

          if (deleteError) throw deleteError;
        }

        for (let i = 0; i < childrenData.length; i++) {
          const child = childrenData[i];
          const childDetails = {
            profile_id: profile.id,
            title: child.title,
            first_names: child.first_names,
            last_name: child.last_name,
            date_of_birth: child.date_of_birth || null,
            email: child.email,
            phone: child.cellphone,
            id_number: child.id_number,
            address: child.address,
            order: i
          };

          const { data: insertedChild, error: childError } = await supabase
            .from('children')
            .insert(childDetails)
            .select()
            .single();

          if (childError) throw childError;
          
          setExistingChildren(prev => [...prev, insertedChild]);
        }
      }

      if (!profile.profile_setup_complete) {
        const newScore = Math.min((score?.total_score || 0) + 20, 100);
        const { error: scoreError } = await supabase
          .from('estate_score')
          .update({
            total_score: newScore,
            last_updated: new Date().toISOString()
          })
          .eq('profile_id', profile.id);

        if (scoreError) throw scoreError;
      }
      
      toast.success('Step 1 completed! Profile has been set up successfully.', {
        duration: 3000
      });
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update children status:', error);
      toast.error('Failed to save children details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    onNavigate('dashboard');
  };

  const handleEditSaveToggle = async () => {
    if (editMode) {
      await handleSave();
    } else {
      setEditMode(true);
    }
  };

  const handleAddChild = React.useCallback(() => {
    setChildrenData(prev => [...prev, defaultChildData]);
    setActiveChildIndex(childrenData.length);
    setShowDeleteButtons(true);
  }, [childrenData.length]);

  const handleDeleteChild = (indexToDelete: number) => {
    setChildrenData(prev => prev.filter((_, i) => i !== indexToDelete));
    if (activeChildIndex >= indexToDelete) {
      setActiveChildIndex(Math.max(0, activeChildIndex - 1));
    }
    if (childrenData.length <= 2) {
      setShowDeleteButtons(false);
    }
  };

  const updateChildData = React.useCallback((index: number, updates: Partial<ChildData>) => {
    setChildrenData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], ...updates };
      return newData;
    });
  }, []);

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" expand={false} richColors />
      <StepProgressBar 
        currentStep={2}
        steps={['Profile', 'Marriage', 'Children']}
        onStepClick={(step) => {
          if (step === 0) onNavigate('profile');
          if (step === 1) onNavigate('marriage-status');
          if (step === 2) onNavigate('children');
        }}
      />
      
      <div className="flex items-center mb-6">
        <button
          onClick={() => onNavigate(previousScreen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <div className="flex items-center justify-between flex-1">
          <h1 className="text-lg font-semibold text-[#2D2D2D] ml-2">Children</h1>
          {/* Only show edit/save button for users who have completed profile setup */}
          {profile?.profile_setup_complete && (
            <button
              onClick={handleEditSaveToggle}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {editMode ? (
                <Save className="w-5 h-5 text-[#0047AB]" />
              ) : (
                <Edit className="w-5 h-5 text-[#0047AB]" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="children-status-container">
        <div className="flex items-center gap-2 mb-4">
          <BabyIcon className="w-5 h-5 text-[#2D2D2D]" />
          <p className="text-[#2D2D2D] font-medium">Do you have any children?</p>
        </div>

        <div className="options-container">
          <button
            disabled={!editMode}
            className={`option-button ${hasChildren === true ? 'selected' : ''}`}
            onClick={() => setHasChildren(true)}
            style={{
              opacity: !editMode ? 0.7 : 1,
              cursor: !editMode ? 'not-allowed' : 'pointer'
            }}
          >
            Yes
          </button>
          <button
            disabled={!editMode}
            className={`option-button ${hasChildren === false ? 'selected' : ''}`}
            onClick={() => setHasChildren(false)}
            style={{
              opacity: !editMode ? 0.7 : 1,
              cursor: !editMode ? 'not-allowed' : 'pointer'
            }}
          >
            No
          </button>
        </div>
      </div>

      <AnimatePresence>
        {hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 100,
              damping: 20,
              mass: 1,
              opacity: { duration: 0.4 }
            }}
            style={{ overflow: "hidden" }}
          >
            <div className="children-details">
              <div className="children-details-title">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2D2D2D]" />
                  <h2 className="text-[#2D2D2D] font-medium">Child Details</h2>
                </div>
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        disabled={!editMode}
                        onClick={handleAddChild}
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
                        Add another child
                        <Tooltip.Arrow className="fill-[#2D2D2D]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>
              
              <div className="children-pills-container">
                {childrenData.map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <button
                      disabled={!editMode}
                      onClick={() => setActiveChildIndex(index)}
                      className={`child-pill ${activeChildIndex === index ? 'active' : ''}`}
                      style={{
                        opacity: !editMode ? 0.7 : 1,
                        cursor: !editMode ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Child {index + 1}
                      {showDeleteButtons && index > 0 && (
                        <button
                          disabled={!editMode}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChild(index);
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

              <ChildFormFields
                childData={childrenData[activeChildIndex]}
                onChange={(updates) => updateChildData(activeChildIndex, updates)}
                required={hasChildren}
                disabled={!editMode}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleSave}
        disabled={hasChildren === null || updateLoading || saving || (editMode && !hasChildren && !childrenData[0].first_names)}
        className="next-button"
      >
        {(updateLoading || saving) ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          profile?.profile_setup_complete ? 'Back to Dashboard' : 'Complete Step 1'
        )}
      </button>
    </div>
  );
}