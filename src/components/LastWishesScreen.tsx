import React from 'react';
import { ArrowLeft, Cross, Flame, MessageSquare, Users, Settings, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { supabase } from '../lib/supabase';
import { BurialOptions } from './burial/BurialOptions';
import { MemorialOptions } from './memorial/MemorialOptions';
import { LastMessage } from './message/LastMessage';
import { GuardianSection } from './guardian/GuardianSection';
import { useProfile, useUpdateProfile, useEstateScore } from '../lib/hooks';
import './LastWishesScreen.css';

type NavSection = 'burial' | 'memorial' | 'message' | 'guardian';

interface LastWishesScreenProps {
  onNavigate: (screen: string) => void;
}

export function LastWishesScreen({ onNavigate }: LastWishesScreenProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();
  const { refetchScore } = useEstateScore(profile?.id);
  const [activeSection, setActiveSection] = React.useState<NavSection>('burial');
  const [guardianSaved, setGuardianSaved] = React.useState(false);
  const [hasMinorChildren, setHasMinorChildren] = React.useState(false);

  // Check if guardian details are saved when profile loads
  React.useEffect(() => {
    if (profile) {
      // Check for minor children
      const checkMinorChildren = async () => {
        try {
          const { data: children, error } = await supabase
            .from('children')
            .select('date_of_birth')
            .eq('profile_id', profile.id)
            .not('date_of_birth', 'is', null);

          if (error) throw error;

          // Check if any children are under 18
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

          setHasMinorChildren(minors.length > 0);
        } catch (error) {
          console.error('Error checking for minor children:', error);
        }
      };

      checkMinorChildren();

      // Check if guardian details are saved
      const hasGuardianDetails = Boolean(
        profile.guardian_title &&
        profile.guardian_first_names &&
        profile.guardian_last_name &&
        profile.guardian_id_number &&
        profile.guardian_phone &&
        profile.guardian_relationship &&
        profile.guardian_address
      );
      setGuardianSaved(hasGuardianDetails);
    }
  }, [profile]);

  const handleCompleteStep = async () => {
    if (!profile) return;
    
    try {
      // Update profile last_wishes_documented flag
      await updateProfile(profile.id, {
        last_wishes_documented: true
      });

      // Refetch score to update UI
      await refetchScore();

      toast.success('Step 4 completed! Last wishes have been documented successfully.');

      // Navigate back to dashboard
      onNavigate('dashboard');
    } catch (error) {
      console.error('Failed to complete step:', error);
      toast.error('Failed to complete step. Please try again.');
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
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <h1 className="text-lg font-semibold text-[#2D2D2D] ml-2">Document Last Wishes</h1>
      </div>

      <nav className="last-wishes-nav">
        <button
          onClick={() => setActiveSection('burial')}
          className={`nav-item ${activeSection === 'burial' ? 'active' : ''}`}
        >
          <Cross className="w-3.5 h-3.5" />
          Burial
        </button>
        <button
          onClick={() => setActiveSection('memorial')}
          className={`nav-item ${activeSection === 'memorial' ? 'active' : ''}`}
        >
          <Flame className="w-3.5 h-3.5" />
          Memorial
        </button>
        <button
          onClick={() => setActiveSection('message')}
          className={`nav-item ${activeSection === 'message' ? 'active' : ''}`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Message
        </button>
        <button
          onClick={() => setActiveSection('guardian')}
          className={`nav-item ${activeSection === 'guardian' ? 'active' : ''}`}
        >
          <Users className="w-3.5 h-3.5" />
          Guardian
        </button>
      </nav>
      
      {activeSection === 'burial' && profile && (
        <BurialOptions 
          profileId={profile.id}
          burialType={profile.burial_type}
        />
      )}
      
      {activeSection === 'memorial' && profile && (
        <MemorialOptions 
          profileId={profile.id}
          memorialType={profile.memorial_type}
          memorialMessage={profile.memorial_message}
        />
      )}
      
      {activeSection === 'message' && profile && (
        <LastMessage
          profileId={profile.id}
          message={profile.last_message}
        />
      )}
      
      {activeSection === 'guardian' && profile && (
        <GuardianSection
          profileId={profile.id}
          onGuardianSaved={() => setGuardianSaved(true)}
          guardian_title={profile.guardian_title}
          guardian_first_names={profile.guardian_first_names}
          guardian_last_name={profile.guardian_last_name}
          guardian_id_number={profile.guardian_id_number}
          guardian_phone={profile.guardian_phone}
          guardian_relationship={profile.guardian_relationship}
          guardian_address={profile.guardian_address}
        />
      )}
      
      <button
        onClick={handleCompleteStep}
        disabled={updateLoading || (hasMinorChildren && !guardianSaved)}
        className="complete-step-button"
      >
        {updateLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : (
          'Complete Step 4'
        )}
      </button>
    </div>
  );
}