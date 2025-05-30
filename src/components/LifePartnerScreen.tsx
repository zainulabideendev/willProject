import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Heart, Users } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useProfile, useUpdateProfile } from '../lib/hooks';
import './LifePartnerScreen.css';

interface LifePartnerScreenProps {
  onNavigate: (screen: string) => void;
}

export function LifePartnerScreen({ onNavigate }: LifePartnerScreenProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();
  const [previousScreen, setPreviousScreen] = React.useState('marriage-status');
  const [hasLifePartner, setHasLifePartner] = React.useState<boolean | null>(() => {
    return null;
  });
  const [partnerData, setPartnerData] = React.useState(() => ({
    title: '',
    first_names: '',
    last_name: '',
    email: '',
    cellphone: '',
    id_number: ''
  }));

  React.useEffect(() => {
    if (profile) {
      setHasLifePartner(profile.has_life_partner);
      setPartnerData({
        title: profile.partner_title || '',
        first_names: profile.partner_first_name || '',
        last_name: profile.partner_last_name || '',
        email: profile.partner_email || '',
        cellphone: profile.partner_phone || '',
        id_number: profile.partner_id_number || ''
      });
    }
  }, [profile]);

  const handleNext = async () => {
    if (!profile || hasLifePartner === null) return;

    try {
      const updates: any = {
        has_life_partner: hasLifePartner,
        marital_status: hasLifePartner ? 'single' : profile.marital_status,
        marriage_property_regime: hasLifePartner ? null : profile.marriage_property_regime
      };

      if (hasLifePartner) {
        Object.assign(updates, {
          partner_title: partnerData.title || null,
          partner_first_name: partnerData.first_names || null,
          partner_last_name: partnerData.last_name || null,
          partner_email: partnerData.email || null,
          partner_phone: partnerData.cellphone || null,
          partner_id_number: partnerData.id_number || null
        });
      } else {
        Object.assign(updates, {
          partner_title: null,
          partner_first_name: null,
          partner_last_name: null,
          partner_email: null,
          partner_phone: null,
          partner_id_number: null
        });
      }

      await updateProfile(profile.id, updates);
      toast.success('Life partner details saved successfully!');
      // Pass the current screen as the previous screen for the children component
      onNavigate('children');
    } catch (error) {
      console.error('Failed to update life partner status:', error);
      toast.error('Failed to save life partner details. Please try again.');
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
          onClick={() => onNavigate(previousScreen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <h1 className="text-lg font-semibold text-[#2D2D2D] ml-2">Life Partner</h1>
      </div>

      <div className="life-partner-status-container">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-[#2D2D2D]" />
          <p className="text-[#2D2D2D] font-medium">Do you have a life partner?</p>
        </div>

        <div className="options-container">
          <button
            className={`option-button ${hasLifePartner === true ? 'selected' : ''}`}
            onClick={() => setHasLifePartner(true)}
          >
            Yes
          </button>
          <button
            className={`option-button ${hasLifePartner === false ? 'selected' : ''}`}
            onClick={() => setHasLifePartner(false)}
          >
            No
          </button>
        </div>
      </div>

      <AnimatePresence>
        {hasLifePartner && (
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
            <div className="partner-details">
              <div className="partner-details-title">
                <Users className="w-5 h-5 text-[#2D2D2D]" />
                <h2 className="text-[#2D2D2D] font-medium">Partner Details</h2>
              </div>

              <div className="space-y-6">
                <div className="input-group">
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                    Title
                  </label>
                  <select
                    value={partnerData.title}
                    onChange={(e) => setPartnerData(prev => ({ ...prev, title: e.target.value }))}
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
                    value={partnerData.first_names}
                    onChange={(e) => setPartnerData(prev => ({ ...prev, first_names: e.target.value }))}
                    className="input-field"
                    placeholder="Enter partner's first names"
                    required={hasLifePartner}
                  />
                </div>

                <div className="input-group">
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={partnerData.last_name}
                    onChange={(e) => setPartnerData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="input-field"
                    placeholder="Enter partner's last name"
                    required={hasLifePartner}
                  />
                </div>

                <div className="input-group">
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={partnerData.email}
                    onChange={(e) => setPartnerData(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                    placeholder="Enter partner's email address"
                    required={hasLifePartner}
                  />
                </div>

                <div className="input-group">
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                    Cellphone Number
                  </label>
                  <input
                    type="tel"
                    value={partnerData.cellphone}
                    onChange={(e) => setPartnerData(prev => ({ ...prev, cellphone: e.target.value }))}
                    className="input-field"
                    placeholder="Enter partner's cellphone number"
                    required={hasLifePartner}
                  />
                </div>

                <div className="input-group">
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={partnerData.id_number}
                    onChange={(e) => setPartnerData(prev => ({ ...prev, id_number: e.target.value }))}
                    className="input-field"
                    placeholder="Enter partner's ID number"
                    required={hasLifePartner}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleNext}
        disabled={hasLifePartner === null || updateLoading}
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