import React from 'react';
import { ArrowLeft, Loader2, UserCircle, BadgeCheck, User, Mail, Phone, FileText, MapPin, Edit, Save } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { supabase } from '../lib/supabase';
import { useProfile, useUpdateProfile } from '../lib/hooks';
import { StepProgressBar } from './StepProgressBar';
import './ProfileScreen.css'; 

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();
  const [user, setUser] = React.useState<any>(null);
  const [editMode, setEditMode] = React.useState(true);
  const [formData, setFormData] = React.useState({
    first_names: '',
    last_name: '',
    email: '',
    cellphone: '',
    id_number: '',
    title: '',
    address: ''
  });

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setFormData(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    });
  }, []);

  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_names: profile.full_name ? profile.full_name.split(' ').slice(0, -1).join(' ') : '',
        last_name: profile.full_name ? profile.full_name.split(' ').pop() || '' : '',
        email: profile.email || user?.email || '',
        cellphone: profile.phone || '',
        id_number: profile.id_number || '',
        title: profile.title || '',
        address: profile.address || ''
      });
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
        
    // Navigate to the next screen
    onNavigate('marriage-status');
  };

  const handleEditSaveToggle = async () => {
    if (editMode) {
      // If in edit mode, save changes
      try {
        if (!profile) return;
       
        const full_name = `${formData.first_names} ${formData.last_name}`.trim();
        await updateProfile(profile.id, {
          full_name,
          email: formData.email,
          phone: formData.cellphone,
          id_number: formData.id_number,
          title: formData.title,
          address: formData.address
        });
        
        localStorage.setItem('profile-address', formData.address);
        toast.success('Profile details saved successfully!');
        setEditMode(false);
      } catch (error) {
        console.error('Failed to update profile:', error);
        toast.error('Failed to save profile details. Please try again.');
      }
    } else {
      // If not in edit mode, switch to edit mode
     setEditMode(true);
    }
  };

  // Load address from localStorage if not available in profile
  React.useEffect(() => {
    // Only load from localStorage if the user has completed profile setup before
    // This prevents pre-filling for new users
    if (profile?.profile_setup_complete && !profile.address && formData.address === '') {
      const savedAddress = localStorage.getItem('profile-address');
      if (savedAddress) {
        setFormData(prev => ({
          ...prev,
          address: savedAddress
        }));
      }
    }
    
    // Set initial edit mode based on profile completion status
    if (profile) {
      const isNewUser = !profile.profile_setup_complete;
      setEditMode(isNewUser);
      
      // For new users, ensure address is empty
      if (isNewUser) {
        setFormData(prev => ({
          ...prev,
          address: ''
        }));
      }
    }
  }, [profile]);

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
        currentStep={0}
        steps={['Profile', 'Marriage', 'Children']}
        onStepClick={(step) => {
          if (profile?.profile_setup_complete) {
            if (step === 0) onNavigate('profile');
            if (step === 1) onNavigate('marriage-status');
            if (step === 2) onNavigate('children');
          } else {
            toast.error('Please complete your profile first');
          }
        }}
      />
      
      <div className="flex items-center mb-6">
        <button
          onClick={() => {
            if (profile?.profile_setup_complete) {
              onNavigate('dashboard');
            } else {
              toast.error('Please complete your profile first');
            }
          }}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <div className="flex items-center justify-between flex-1">
          <h1 className="text-lg font-semibold text-[#2D2D2D] ml-2">
            {profile?.profile_setup_complete ? 'Your Profile' : 'Complete Your Profile'}
          </h1>
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

      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="input-group">
            <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
              Title
            </label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2D2D2D]/60" />
              <select
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field pl-10"
                disabled={profile?.profile_setup_complete && !editMode}
                style={{
                  opacity: profile?.profile_setup_complete && !editMode ? 0.7 : 1,
                  cursor: profile?.profile_setup_complete && !editMode ? 'not-allowed' : 'pointer'
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
                value={formData.first_names}
                onChange={(e) => setFormData(prev => ({ ...prev, first_names: e.target.value }))}
                className="input-field pl-10"
                placeholder="Enter your first names"
                disabled={profile?.profile_setup_complete && !editMode}
                style={{
                  opacity: profile?.profile_setup_complete && !editMode ? 0.7 : 1,
                  cursor: profile?.profile_setup_complete && !editMode ? 'not-allowed' : 'auto'
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
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="input-field pl-10"
                placeholder="Enter your last name"
                disabled={profile?.profile_setup_complete && !editMode}
                style={{
                  opacity: profile?.profile_setup_complete && !editMode ? 0.7 : 1,
                  cursor: profile?.profile_setup_complete && !editMode ? 'not-allowed' : 'auto'
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
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-field pl-10"
                placeholder="Enter your email address"
                disabled={profile?.profile_setup_complete && !editMode}
                style={{
                  opacity: profile?.profile_setup_complete && !editMode ? 0.7 : 1,
                  cursor: profile?.profile_setup_complete && !editMode ? 'not-allowed' : 'auto'
                }}
                required
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
                value={formData.cellphone}
                onChange={(e) => setFormData(prev => ({ ...prev, cellphone: e.target.value }))}
                className="input-field pl-10"
                placeholder="Enter your cellphone number"
                disabled={profile?.profile_setup_complete && !editMode}
                style={{
                  opacity: profile?.profile_setup_complete && !editMode ? 0.7 : 1,
                  cursor: profile?.profile_setup_complete && !editMode ? 'not-allowed' : 'auto'
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
                value={formData.id_number}
                onChange={(e) => setFormData(prev => ({ ...prev, id_number: e.target.value }))}
                className="input-field pl-10"
                placeholder="Enter your ID number"
                disabled={profile?.profile_setup_complete && !editMode}
                style={{
                  opacity: profile?.profile_setup_complete && !editMode ? 0.7 : 1,
                  cursor: profile?.profile_setup_complete && !editMode ? 'not-allowed' : 'auto'
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
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="input-field pl-10 min-h-[100px]"
                placeholder="Enter your residential address"
                disabled={profile?.profile_setup_complete && !editMode}
                style={{
                  opacity: profile?.profile_setup_complete && !editMode ? 0.7 : 1,
                  cursor: profile?.profile_setup_complete && !editMode ? 'not-allowed' : 'auto'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updateLoading || !formData.first_names || !formData.last_name || !formData.email || !formData.cellphone || !formData.id_number || !formData.address}
            className={`save-button ${profile?.profile_setup_complete ? 'mt-4' : ''}`}
          >
            {updateLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              'Next'
            )}
          </button>
      </form>
    </div>
  );
}