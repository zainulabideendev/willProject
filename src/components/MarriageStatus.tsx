import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, BellRing as Ring, Users, UserCircle, BadgeCheck, User, Mail, Phone, FileText, Edit, Save, MapPin } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { AccrualModal } from './modals/AccrualModal';
import { CommunityPropertyModal } from './modals/CommunityPropertyModal';
import { StepProgressBar } from './StepProgressBar';
import { useProfile, useUpdateProfile } from '../lib/hooks';
import './MarriageStatus.css';

interface MarriageStatusProps {
  onNavigate: (screen: string) => void;
}

export function MarriageStatus({ onNavigate }: MarriageStatusProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();
  const [editMode, setEditMode] = React.useState(false);
  const [isFormValid, setIsFormValid] = React.useState(false);
  const [showAccrualModal, setShowAccrualModal] = React.useState(false);
  const [showCommunityPropertyModal, setShowCommunityPropertyModal] = React.useState(false);
  const [isMarried, setIsMarried] = React.useState<boolean | null>(() => {
    return profile?.marital_status === 'married' || null;
  });
  const [propertyRegime, setPropertyRegime] = React.useState(() => {
    return profile?.marriage_property_regime || '';
  });
  const [spouseData, setSpouseData] = React.useState({
    title: profile?.spouse_title || '',
    first_names: profile?.spouse_first_name || '',
    last_name: profile?.spouse_last_name || '',
    email: profile?.spouse_email || '',
    cellphone: profile?.spouse_phone || '',
    id_number: profile?.spouse_id_number || '',
    address: profile?.spouse_address || ''
  });

  React.useEffect(() => {
    if (profile) {
      setIsMarried(profile.marital_status === 'married');
      setPropertyRegime(profile?.marriage_property_regime || '');
      setSpouseData({
        title: profile.spouse_title || '',
        first_names: profile.spouse_first_name || '',
        last_name: profile.spouse_last_name || '',
        email: profile.spouse_email || '',
        cellphone: profile.spouse_phone || '', 
        id_number: profile.spouse_id_number || '',
        address: profile.spouse_address || ''
      });
    }
  }, [profile]);
  
  // Set initial edit mode based on profile completion status
  React.useEffect(() => {
    if (profile) {
      // For new users (who haven't completed profile setup), always stay in edit mode
      // For existing users (who have completed profile setup), start in view mode
      setEditMode(!profile.profile_setup_complete || false);
    }
  }, [profile]);

  React.useEffect(() => {
    const validateForm = () => {
      if (isMarried === null) {
        return false;
      }

      if (!isMarried) {
        return true;
      }

      const isSpouseDataComplete = 
        spouseData.title.trim() !== '' &&
        spouseData.first_names.trim() !== '' &&
        spouseData.last_name.trim() !== '' &&
        spouseData.email.trim() !== '' &&
        spouseData.cellphone.trim() !== '' &&
        spouseData.id_number.trim() !== '';

      const isPropertyRegimeSelected = propertyRegime.trim() !== '';

      return isSpouseDataComplete && isPropertyRegimeSelected;
    };

    setIsFormValid(validateForm());
  }, [isMarried, spouseData, propertyRegime]);

  const handleSave = async () => {
    if (!profile || isMarried === null) return;

    if (!isFormValid) {
      return;
    }
    
    try {
      const updates: any = {};
      
      updates.marital_status = isMarried === true ? 'married' : 'single';
      updates.marriage_property_regime = isMarried === true ? propertyRegime : null;

      if (isMarried === true) {
        updates.spouse_title = spouseData.title.trim();
        updates.spouse_first_name = spouseData.first_names.trim();
        updates.spouse_last_name = spouseData.last_name.trim();
        updates.spouse_email = spouseData.email.trim();
        updates.spouse_phone = spouseData.cellphone.trim();
        updates.spouse_id_number = spouseData.id_number.trim();
        updates.spouse_address = spouseData.address.trim();
        
        // Save spouse address to localStorage
        localStorage.setItem('spouse-address', spouseData.address.trim());
      } else {
        updates.spouse_title = null;
        updates.spouse_first_name = null;
        updates.spouse_last_name = null;
        updates.spouse_email = null;
        updates.spouse_phone = null;
        updates.spouse_id_number = null;
        updates.spouse_address = null;
      }

      await updateProfile(profile.id, {
        ...updates
      });
      
      toast.success('Marriage status details saved successfully!');
    } catch (error) {
      console.error('Failed to update marriage status:', error);
      toast.error('Failed to save marriage status. Please try again.');
    }
  };
  
  const handleNext = () => {
    onNavigate('children');
  };
  
  const handleEditSaveToggle = async () => {
    if (editMode) {
      await handleSave();
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };

  if (profileLoading) {
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
        currentStep={1}
        steps={['Profile', 'Marriage', 'Children']}
        onStepClick={(step) => {
          if (step === 0) onNavigate('profile');
          if (step === 1) onNavigate('marriage-status');
          if (step === 2) onNavigate('children');
        }}
      />
      
      <div className="flex items-center mb-6">
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors" 
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <div className="flex items-center justify-between flex-1">
          <h1 className="text-lg font-semibold text-[#2D2D2D] ml-2">Marriage Status</h1>
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

      <div className="marriage-status-container">
        <div className="flex items-center gap-2 mb-4">
          <Ring className="w-5 h-5 text-[#2D2D2D]" />
          <p className="text-[#2D2D2D] font-medium">Are you married?</p>
        </div>

        <div className="options-container">
          <button
            disabled={!editMode}
            className={`option-button ${isMarried === true ? 'selected' : ''}`}
            onClick={() => setIsMarried(true)}
            style={{
              opacity: !editMode ? 0.7 : 1,
              cursor: !editMode ? 'not-allowed' : 'pointer'
            }}
          >
            Yes
          </button>
          <button
            disabled={!editMode}
            className={`option-button ${isMarried === false ? 'selected' : ''}`}
            onClick={() => setIsMarried(false)}
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
        {isMarried && (
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
            <div className="spouse-details">
              <div className="spouse-details-title">
                <Users className="w-5 h-5 text-[#2D2D2D]" />
                <h2 className="text-[#2D2D2D] font-medium">Spouse Details</h2>
              </div>

              <div className="space-y-6">
            <div className="input-group">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                Title
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
                <select
                  value={spouseData.title}
                  onChange={(e) => setSpouseData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field pl-10"
                   disabled={!editMode}
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
                  value={spouseData.first_names}
                  onChange={(e) => setSpouseData(prev => ({ ...prev, first_names: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="Enter spouse's first names"
                   disabled={!editMode}
                   style={{
                     opacity: !editMode ? 0.7 : 1,
                     cursor: !editMode ? 'not-allowed' : 'auto'
                   }}
                  required={isMarried}
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
                  value={spouseData.last_name}
                  onChange={(e) => setSpouseData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="Enter spouse's last name"
                   disabled={!editMode}
                   style={{
                     opacity: !editMode ? 0.7 : 1,
                     cursor: !editMode ? 'not-allowed' : 'auto'
                   }}
                  required={isMarried}
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
                  value={spouseData.email}
                  onChange={(e) => setSpouseData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="Enter spouse's email address"
                   disabled={!editMode}
                   style={{
                     opacity: !editMode ? 0.7 : 1,
                     cursor: !editMode ? 'not-allowed' : 'auto'
                   }}
                  required={isMarried}
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
                  value={spouseData.cellphone}
                  onChange={(e) => setSpouseData(prev => ({ ...prev, cellphone: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="Enter spouse's cellphone number"
                   disabled={!editMode}
                   style={{
                     opacity: !editMode ? 0.7 : 1,
                     cursor: !editMode ? 'not-allowed' : 'auto'
                   }}
                  required={isMarried}
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
                  value={spouseData.address || ''}
                  onChange={(e) => setSpouseData(prev => ({ ...prev, address: e.target.value }))}
                  className="input-field pl-10 min-h-[100px]"
                  placeholder="Enter spouse's address"
                  disabled={!editMode}
                  style={{
                    opacity: !editMode ? 0.7 : 1,
                    cursor: !editMode ? 'not-allowed' : 'auto'
                  }}
                  required={isMarried}
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
                  value={spouseData.id_number}
                  onChange={(e) => setSpouseData(prev => ({ ...prev, id_number: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="Enter spouse's ID number"
                   disabled={!editMode}
                   style={{
                     opacity: !editMode ? 0.7 : 1,
                     cursor: !editMode ? 'not-allowed' : 'auto'
                   }}
                  required={isMarried}
                />
              </div>
            </div>
              </div>
            </div>
            <div className="marriage-property-regime mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Ring className="w-5 h-5 text-[#2D2D2D]" />
                <p className="text-[#2D2D2D] font-medium">Marriage Property Regime</p>
              </div>
              <div className="input-group relative">
                <div className="relative">
                  <Ring className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
                  <select
                    value={propertyRegime}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPropertyRegime(value);
                      if (value === 'out_of_community_with_accrual') {
                        setShowAccrualModal(true);
                      } else if (value === 'in_community') {
                        setShowCommunityPropertyModal(true);
                      }
                    }}
                    className="input-field pl-10"
                   disabled={!editMode}
                   style={{
                     opacity: !editMode ? 0.7 : 1,
                     cursor: !editMode ? 'not-allowed' : 'pointer'
                   }}
                    required={isMarried}
                  >
                    <option value="">Select marriage property regime</option>
                    <option value="in_community">In Community of Property</option>
                    <option value="out_of_community_without_accrual">Out of Community of Property Without Accrual</option>
                    <option value="out_of_community_with_accrual">Out of Community of Property With Accrual</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AccrualModal 
        isOpen={showAccrualModal} 
        onClose={() => setShowAccrualModal(false)} 
      />
      
      <CommunityPropertyModal
        isOpen={showCommunityPropertyModal}
        onClose={() => setShowCommunityPropertyModal(false)}
      />

      <button
        onClick={handleNext}
        disabled={!isFormValid}
        className="next-button"
      >
        Next
      </button>
    </div>
  );
}