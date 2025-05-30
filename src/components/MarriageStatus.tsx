import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, BellRing as Ring, Users } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { AccrualModal } from './modals/AccrualModal';
import { CommunityPropertyModal } from './modals/CommunityPropertyModal';
import { useProfile, useUpdateProfile } from '../lib/hooks';
import './MarriageStatus.css';

interface MarriageStatusProps {
  onNavigate: (screen: string) => void;
}

export function MarriageStatus({ onNavigate }: MarriageStatusProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();
  const [isFormValid, setIsFormValid] = React.useState(false);
  const [showAccrualModal, setShowAccrualModal] = React.useState(false);
  const [showCommunityPropertyModal, setShowCommunityPropertyModal] = React.useState(false);
  const [isMarried, setIsMarried] = React.useState<boolean | null>(() => {
    if (!profile) return null;
    return profile.marital_status === 'married';
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
    id_number: profile?.spouse_id_number || ''
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
        id_number: profile.spouse_id_number || ''
      });
    }
  }, [profile]);

  // Validate form whenever relevant fields change
  React.useEffect(() => {
    const validateForm = () => {
      // First check if marriage status is selected
      if (isMarried === null) {
        return false;
      }

      // If not married, form is valid
      if (!isMarried) {
        return true;
      }

      // If married, check all required fields
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

  const handleNext = async () => {
    if (!profile || isMarried === null) return;

    if (!isFormValid) {
      return;
    }
    
    try {
      const updates: any = {};
      
      // Set marital status and property regime
      updates.marital_status = isMarried === true ? 'married' : 'single';
      updates.marriage_property_regime = isMarried === true ? propertyRegime : null;

      // Handle spouse details
      if (isMarried === true) {
        updates.spouse_title = spouseData.title.trim();
        updates.spouse_first_name = spouseData.first_names.trim();
        updates.spouse_last_name = spouseData.last_name.trim();
        updates.spouse_email = spouseData.email.trim();
        updates.spouse_phone = spouseData.cellphone.trim();
        updates.spouse_id_number = spouseData.id_number.trim();
      } else {
        // Clear spouse details when not married
        updates.spouse_title = null;
        updates.spouse_first_name = null;
        updates.spouse_last_name = null;
        updates.spouse_email = null;
        updates.spouse_phone = null;
        updates.spouse_id_number = null;
      }

      await updateProfile(profile.id, {
        ...updates
      });
      
      toast.success('Marriage status details saved successfully!');
      onNavigate('children');
    } catch (error) {
      console.error('Failed to update marriage status:', error);
      toast.error('Failed to save marriage status. Please try again.');
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
      <div className="flex items-center mb-6">
        <button
          onClick={() => onNavigate('profile')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <h1 className="text-lg font-semibold text-[#2D2D2D] ml-2">Marriage Status</h1>
      </div>

      <div className="marriage-status-container">
        <div className="flex items-center gap-2 mb-4">
          <Ring className="w-5 h-5 text-[#2D2D2D]" />
          <p className="text-[#2D2D2D] font-medium">Are you married?</p>
        </div>

        <div className="options-container">
          <button
            className={`option-button ${isMarried === true ? 'selected' : ''}`}
            onClick={() => setIsMarried(true)}
          >
            Yes
          </button>
          <button
            className={`option-button ${isMarried === false ? 'selected' : ''}`}
            onClick={() => setIsMarried(false)}
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
              <select
                value={spouseData.title}
                onChange={(e) => setSpouseData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Select a title</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
              </select>
            </div>

            <div className="input-group">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                First Names
              </label>
              <input
                type="text"
                value={spouseData.first_names}
                onChange={(e) => setSpouseData(prev => ({ ...prev, first_names: e.target.value }))}
                className="input-field"
                placeholder="Enter spouse's first names"
                required={isMarried}
              />
            </div>

            <div className="input-group">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={spouseData.last_name}
                onChange={(e) => setSpouseData(prev => ({ ...prev, last_name: e.target.value }))}
                className="input-field"
                placeholder="Enter spouse's last name"
                required={isMarried}
              />
            </div>

            <div className="input-group">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                Email
              </label>
              <input
                type="email"
                value={spouseData.email}
                onChange={(e) => setSpouseData(prev => ({ ...prev, email: e.target.value }))}
                className="input-field"
                placeholder="Enter spouse's email address"
                required={isMarried}
              />
            </div>

            <div className="input-group">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                Cellphone Number
              </label>
              <input
                type="tel"
                value={spouseData.cellphone}
                onChange={(e) => setSpouseData(prev => ({ ...prev, cellphone: e.target.value }))}
                className="input-field"
                placeholder="Enter spouse's cellphone number"
                required={isMarried}
              />
            </div>

            <div className="input-group">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                ID Number
              </label>
              <input
                type="text"
                value={spouseData.id_number}
                onChange={(e) => setSpouseData(prev => ({ ...prev, id_number: e.target.value }))}
                className="input-field"
                placeholder="Enter spouse's ID number"
                required={isMarried}
              />
            </div>
              </div>
            </div>
            <div className="marriage-property-regime mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Ring className="w-5 h-5 text-[#2D2D2D]" />
                <p className="text-[#2D2D2D] font-medium">Marriage Property Regime</p>
              </div>
              <div className="input-group">
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
                  className="input-field"
                  required={isMarried}
                >
                  <option value="">Select marriage property regime</option>
                  <option value="in_community">In Community of Property</option>
                  <option value="out_of_community_without_accrual">Out of Community of Property Without Accrual</option>
                  <option value="out_of_community_with_accrual">Out of Community of Property With Accrual</option>
                </select>
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
        disabled={!isFormValid || updateLoading}
        className="next-button"
      >
        {updateLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          'Next'
        )}
      </button>
    </div>
  );
}