import React from 'react';
import { Home, Settings, Loader2 } from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { ProgressSteps } from './ProgressSteps';
import { GuidanceMessage } from './GuidanceMessage';
import { WelcomeModal } from './WelcomeModal';
import { EstateEssentialsHub } from './EstateEssentialsHub';
import { useProfile, useEstateScore, useUpdateProfile } from '../lib/hooks';
import './Dashboard.css';
import { generatePDF, generateWillContent } from './will/WillGenerator';
import willTemplate from '../lib/will_template.txt?raw';
import { useWillData } from './will/WillDataProvider';
import jsPDF from "jspdf";
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LegalComplianceModal } from './modals/LegalComplianceModal';
import * as Tooltip from '@radix-ui/react-tooltip';

interface Step {
  label: string;
  completed: boolean;
  score: number;
  description: string;
}

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [showLegalComplianceModal, setShowLegalComplianceModal] = React.useState(false);
  const [hasConfirmedCompliance, setHasConfirmedCompliance] = React.useState(false);
  const { profile, loading: profileLoading } = useProfile();
  const { score, loading: scoreLoading, refetchScore } = useEstateScore(profile?.id);
  const { updateProfile, loading: updateLoading } = useUpdateProfile();
  const { loading, assets, beneficiaries, executors, children, assetAllocations, residueAllocations, partnerFirm } = useWillData();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Refetch score when dashboard is mounted
    refetchScore?.();
    
    // Check if user has confirmed legal compliance
    const hasConfirmed = localStorage.getItem('legal-compliance-confirmed') === 'true';
    setHasConfirmedCompliance(hasConfirmed);
    
    // Show legal compliance modal for users who have downloaded their will but haven't confirmed compliance
    if (profile?.will_downloaded && !hasConfirmed) {
      setShowLegalComplianceModal(true);
    }
  }, [refetchScore]);

  const willSteps: Step[] = [
    { 
      label: 'Complete Profile', 
      completed: profile?.profile_setup_complete ?? false,
      score: 20,
      description: 'Start by filling in your personal details to create a will that\'s uniquely yours.'
    },
    { 
      label: 'Add Assets', 
      completed: profile?.assets_added ?? false,
      score: 20,
      description: 'List your properties, investments, and valuable possessions for proper distribution.'
    },
    { 
      label: 'Add Beneficiaries', 
      completed: profile?.beneficiaries_chosen ?? false,
      score: 20,
      description: 'Choose who will inherit your assets and specify their allocation.'
    },
    { 
      label: 'Add Last Wishes', 
      completed: profile?.last_wishes_documented ?? false,
      score: 15,
      description: 'Document any specific requests or messages for your loved ones.'
    },
    { 
      label: 'Choose Executor', 
      completed: profile?.executor_chosen ?? false,
      score: 15,
      description: 'Select a trusted person to carry out your will\'s instructions.'
    },
    { 
      label: 'Review Will', 
      completed: profile?.will_reviewed ?? false,
      score: 5,
      description: 'Preview your will document and ensure everything is as you want it.'
    },
    {
      label: 'Download & Sign',
      completed: profile?.will_downloaded ?? false,
      score: 5,
      description: 'Download your will and sign it in the presence of witnesses.'
    }
  ];

  // Find the first incomplete step
  const currentStep = willSteps.find(step => !step.completed) || null;
  
  // Calculate total score based on completed steps
  const calculatedScore = willSteps
    .filter(step => step.completed)
    .reduce((total, step) => total + step.score, 0);

  React.useEffect(() => {
    if (profile && !profile.welcome_modal_shown) {
      setShowWelcome(true);
    }
  }, [profile]);

  const handleWelcomeClose = async () => {
    if (profile) {
      try {
        await updateProfile(profile.id, { welcome_modal_shown: true });
        setShowWelcome(false);
      } catch (error) {
        console.error('Failed to update welcome modal state:', error);
      }
    }
  };

  const handleNextStep = async (step: string) => {
    if (!profile) return;
    
    switch (step) {
      case 'Complete Profile':
        onNavigate('profile');
        break;
      case 'Add Assets':
        onNavigate('assets');
        break;
      case 'Add Beneficiaries':
        onNavigate('beneficiaries');
        break;
      case 'Add Last Wishes':
        onNavigate('last-wishes');
        break;
      case 'Choose Executor':
        onNavigate('executor');
        break;
      case 'Review Will':
        onNavigate('will-preview');
        break;
    }
  };

  const downloadWillInPdf = async() => {
    try {
      if (profile && !loading) {
        toast.info('Preparing your will document...', { duration: 3000 });
        const content = generateWillContent(willTemplate, {
          profile,
          assets,
          beneficiaries,
          executors,
          children,
          assetAllocations,
          residueAllocations,
          partnerFirm
        });
        const doc = generatePDF(content);
        doc.save("will-document.pdf");
        const { error } = await supabase
          .from('profiles')
          .update({ will_downloaded: true })
          .eq('id', profile.id);
        
        if (error) throw error;
      
        // Show legal compliance modal
        setShowLegalComplianceModal(true);
        
        // Update the estate score in the background
        await refetchScore?.();
        toast.success('Will downloaded successfully!');
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to download will document');
    }
  }

  if (profileLoading || scoreLoading || updateLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-20">
      <WelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />
      <LegalComplianceModal 
        isOpen={showLegalComplianceModal} 
        onClose={() => {
          // When closing, mark as confirmed
          localStorage.setItem('legal-compliance-confirmed', 'true');
          setHasConfirmedCompliance(true);
          setShowLegalComplianceModal(false); 
        }} 
      />
      <div className="bg-white rounded-2xl p-6 mb-4 dashboard-card">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#2D2D2D]">Estate Health Score</h2>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-2">
            <Tooltip.Provider>
              {calculatedScore === 100 && (
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button 
                      onClick={downloadWillInPdf} 
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      style={{
                        background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                        color: 'white',
                        boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-[#2D2D2D] text-white text-sm px-2 py-1 rounded"
                      sideOffset={5}
                    >
                      Download your will
                      <Tooltip.Arrow className="fill-[#2D2D2D]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )}
              
              {profile?.will_downloaded && (
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button 
                      onClick={() => toast.info('Upload functionality coming soon!')} 
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      style={{
                        background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                        color: 'white',
                        boxShadow: '4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff'
                      }}
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-[#2D2D2D] text-white text-sm px-2 py-1 rounded"
                      sideOffset={5}
                    >
                      Upload signed will for safe storage
                      <Tooltip.Arrow className="fill-[#2D2D2D]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )}
            </Tooltip.Provider>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <CircularProgress value={calculatedScore} />
            <GuidanceMessage 
              message={currentStep ? currentStep.description : "You've completed your will and secured your legacy."}
            />
        </div>
        <div className="mt-6 pt-4 progress-divider">
          <ProgressSteps 
            steps={willSteps} 
            onNextStep={handleNextStep}
            onStepClick={(index, step) => {
              // Only allow clicking on completed steps
              if (step.completed) {
                handleNextStep(step.label);
              }
            }}
            downloadWill={() => downloadWillInPdf()}
          />
        </div>
      </div>
      
      <EstateEssentialsHub onNavigate={onNavigate} />

      <nav className="fixed bottom-0 left-0 right-0 bottom-nav">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-around">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg nav-button ${
              screen === 'dashboard' ? 'nav-button-active' : 'nav-button-inactive'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg nav-button ${
              screen === 'settings' ? 'nav-button-active' : 'nav-button-inactive'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}