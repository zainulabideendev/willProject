import React from 'react';
import { ArrowLeft, UserPlus, Building2, Loader2 } from 'lucide-react';
import { useProfile, useUpdateProfile } from '../lib/hooks';
import { ManualExecutorForm } from './executor/ManualExecutorForm';
import { ExecutorList } from './executor/ExecutorList';
import { ExecutorHandlingOptions } from './executor/ExecutorHandlingOptions';
import { PartnerFirmsCarousel } from './executor/PartnerFirmsCarousel';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import './ExecutorScreen.css';

type NavSection = 'manual' | 'partner';

interface ExecutorScreenProps {
  onNavigate: (screen: string) => void;
}

export function ExecutorScreen({ onNavigate }: ExecutorScreenProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();
  const [executors, setExecutors] = React.useState<any[]>([]);
  const [activeSection, setActiveSection] = React.useState<NavSection>('manual');
  const [selectedFirm, setSelectedFirm] = React.useState<any>(null);
  const [executorType, setExecutorType] = React.useState<'manual' | 'partner' | null>(null);
  const [hasExecutors, setHasExecutors] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [canComplete, setCanComplete] = React.useState(false);

  const fetchExecutors = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('executors')
        .select('*')
        .eq('profile_id', profile.id);

      if (error) throw error;
      const executorList = data || [];
      setExecutors(executorList);
      setHasExecutors(executorList.length > 0);
      
      // Update executor type if no executors left
      if (executorList.length === 0) {
        setExecutorType(null);
      }
      
      // Update completion status
      setCanComplete(executorList.length > 0 || selectedFirm !== null);
    } catch (error) {
      console.error('Error fetching executors:', error);
    }
  };

  React.useEffect(() => {
    fetchExecutors();
    
    if (profile) {
      const loadSelectedFirm = async () => {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('partner_firm_id, executor_type')
            .eq('id', profile.id)
            .single();

          if (profileData?.partner_firm_id) {
            const { data: firm } = await supabase
              .from('partner_firms')
              .select('*')
              .eq('id', profileData.partner_firm_id)
              .single();
              
            if (firm) {
              setSelectedFirm(firm);
              setExecutorType('partner');
              setCanComplete(true);
            }
          }
          
          if (profileData?.executor_type) {
            setExecutorType(profileData.executor_type as 'manual' | 'partner');
          }
        } catch (error) {
          console.error('Error loading selected firm:', error);
        }
      };

      loadSelectedFirm();
    }
  }, [profile]);

  const handleExecutorChange = React.useCallback(() => {
    fetchExecutors();
    setRefreshTrigger(prev => prev + 1);
  }, [fetchExecutors]);

  // Update canComplete when selectedFirm changes
  React.useEffect(() => {
    setCanComplete(hasExecutors || selectedFirm !== null);
  }, [hasExecutors, selectedFirm]);

  const handleCompleteStep = async () => {
    if (!profile) return;
    
    try {
      // Update profile executor_chosen flag
      await updateProfile(profile.id, {
        executor_chosen: true
      });

      toast.success('Step 5 completed! Executor has been selected successfully.');

      // Navigate back to dashboard
      onNavigate('dashboard');
    } catch (error) {
      console.error('Failed to complete step:', error);
      toast.error('Failed to complete step. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <h1 className="text-lg font-semibold text-[#2D2D2D] ml-2">Choose Executor</h1>
      </div>

      <div className="flex justify-center">
        <div className="executor-nav">
          <div className="flex w-full">
            <button
              onClick={() => {
                setActiveSection('manual');
                if (executorType === 'partner' && !hasExecutors) {
                  // Allow switching to manual if partner is selected but no executors
                  setExecutorType(null);
                }
              }}
              className={`executor-nav-item ${activeSection === 'manual' ? 'active' : ''}`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Manual Entry
            </button>
            <button
              onClick={() => {
                setActiveSection('partner');
                if (executorType === 'manual' && !hasExecutors) {
                  // Allow switching to partner if manual is selected but no executors
                  setExecutorType(null);
                }
              }}
              className={`executor-nav-item ${activeSection === 'partner' ? 'active' : ''}`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Partner Firms
            </button>
          </div>
        </div>
      </div>

      {activeSection === 'manual' ? (
        <div>
          {profile && (
            <div className="space-y-6">
              <ExecutorList
                profileId={profile.id}
                selectedFirm={null}
                onExecutorDeleted={handleExecutorChange}
                key={refreshTrigger}
              />
              {(!executorType || executorType === 'manual') && <ManualExecutorForm
                profileId={profile.id}
                onExecutorSaved={handleExecutorChange}
                key={`form-${refreshTrigger}`}
              />}
              {executors.length > 1 && (
                <ExecutorHandlingOptions
                  profileId={profile.id}
                  executors={executors}
                  onUpdate={fetchExecutors}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          {profile && (
            <>
              <ExecutorList
                profileId={profile.id}
                selectedFirm={selectedFirm}
                onExecutorDeleted={fetchExecutors}
              />
              {(!executorType || executorType === 'partner') && <PartnerFirmsCarousel
                profileId={profile.id}
                onSelect={(firmId, firm) => {
                  setSelectedFirm(firm);
                  setExecutorType('partner');
                }}
                selectedFirmId={selectedFirm?.id}
              />}
            </>
          )}
        </div>
      )}
      <button
        onClick={handleCompleteStep}
        disabled={!canComplete}
        className="w-full mt-6 py-2 px-4 text-white rounded-lg transition-all text-sm"
        style={{
          background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
          boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
          opacity: !canComplete ? 0.5 : 1,
          cursor: !canComplete ? 'not-allowed' : 'pointer'
        }}
      >
        Complete Step 5
      </button>
    </div>
  );
}