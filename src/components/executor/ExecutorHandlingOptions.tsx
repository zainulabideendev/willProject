import React from 'react';
import { Users, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import './ExecutorHandlingOptions.css';

interface Executor {
  id: string;
  first_names: string;
  last_name: string;
}

interface ExecutorHandlingOptionsProps {
  profileId: string;
  executors: Executor[];
  editMode?: boolean;
  onUpdate: () => void;
}

type HandlingType = 'jointly' | 'independently' | null;

export function ExecutorHandlingOptions({ 
  profileId,
  editMode = true,
  executors, 
  onUpdate 
}: ExecutorHandlingOptionsProps) {
  const [handlingType, setHandlingType] = React.useState<HandlingType>(() => {
    const saved = localStorage.getItem(`executor-handling-${profileId}`);
    return saved as HandlingType;
  });
  
  const [primaryExecutorId, setPrimaryExecutorId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('executor_handling_type')
          .eq('id', profileId)
          .single();

        if (error) throw error;

        if (profile?.executor_handling_type) {
          setHandlingType(profile.executor_handling_type as HandlingType);
          localStorage.setItem(`executor-handling-${profileId}`, profile.executor_handling_type);
        }

        if (profile?.executor_handling_type === 'independently') {
          const { data: primaryExecutors, error: executorError } = await supabase
            .from('executors')
            .select('id')
            .eq('profile_id', profileId)
            .eq('is_primary', true);

          if (executorError) throw executorError;

          // Check if we have a primary executor and set their ID
          if (primaryExecutors && primaryExecutors.length > 0) {
            setPrimaryExecutorId(primaryExecutors[0].id);
          } else {
            setPrimaryExecutorId(null);
          }
        }
      } catch (error) {
        console.error('Error loading executor preferences:', error);
        // Don't show error toast here as it's not critical for UX
      }
    };

    loadPreferences();
  }, [profileId]);

  const handleSave = async () => {
    if (!handlingType) {
      toast.error('Please select how executors should handle the estate');
      return;
    }

    if (handlingType === 'independently' && !primaryExecutorId) {
      toast.error('Please select a primary executor');
      return;
    }

    try {
      setSaving(true);

      await supabase
        .from('profiles')
        .update({ executor_handling_type: handlingType })
        .eq('id', profileId);

      // Reset all executors to not primary first
      await supabase
        .from('executors')
        .update({ is_primary: false })
        .eq('profile_id', profileId);

      if (handlingType === 'independently' && primaryExecutorId) {
        await supabase
          .from('executors')
          .update({ is_primary: true })
          .eq('id', primaryExecutorId);
      }

      localStorage.setItem(`executor-handling-${profileId}`, handlingType);
      toast.success('Executor handling preferences saved');
      onUpdate();
    } catch (error) {
      console.error('Error saving executor handling:', error);
      toast.error('Failed to save executor handling preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="executor-container">
      <div className="executor-header">
        <div className="executor-icon-container">
          <Users className="executor-icon" />
        </div>
        <h3 className="executor-title">Executor Handling</h3>
      </div>

      <p className="executor-description">
        How should your executors handle the estate execution?
      </p>

      <div className="handling-options">
        <button
          onClick={() => setHandlingType('jointly')}
          onClick={() => {
            setHandlingType('jointly');
            setHasUnsavedChanges(true);
          }}
          disabled={!editMode}
          className={`handling-option ${handlingType === 'jointly' ? 'selected' : ''}`}
          style={{
            opacity: !editMode ? 0.7 : 1,
            cursor: !editMode ? 'not-allowed' : 'pointer'
          }}
        >
          <div className="option-content">
            <Users className="option-icon" />
            <div className="option-details">
              <h4 className="option-label">Jointly</h4>
              <p className="option-description">
                All executors must agree and share responsibilities equally
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setHandlingType('independently');
            setHasUnsavedChanges(true);
          }}
          disabled={!editMode}
          className={`handling-option ${handlingType === 'independently' ? 'selected' : ''}`}
          style={{
            opacity: !editMode ? 0.7 : 1,
            cursor: !editMode ? 'not-allowed' : 'pointer'
          }}
        >
          <div className="option-content">
            <UserCheck className="option-icon" />
            <div className="option-details">
              <h4 className="option-label">Independently</h4>
              <p className="option-description">
                Primary executor has final decision-making power
              </p>
            </div>
          </div>
        </button>
      </div>

      {handlingType === 'independently' && (
        <div className="primary-executor-section">
          <h4 className="primary-executor-title">Select Primary Executor</h4>
          <div className="executor-list">
            {executors.map((executor) => (
              <button
                disabled={!editMode}
                key={executor.id}
                onClick={() => {
                  setPrimaryExecutorId(executor.id);
                  setHasUnsavedChanges(true);
                }}
                className={`executor-button ${primaryExecutorId === executor.id ? 'selected' : ''}`}
                style={{
                  opacity: !editMode ? 0.7 : 1,
                  cursor: !editMode ? 'not-allowed' : 'pointer'
                }}
              >
                {executor.first_names} {executor.last_name}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!handlingType || (handlingType === 'independently' && !primaryExecutorId) || saving || !editMode || !hasUnsavedChanges}
        className="save-button"
        style={{
          opacity: (!handlingType || (handlingType === 'independently' && !primaryExecutorId) || saving || !editMode || !hasUnsavedChanges) ? 0.5 : 1,
          cursor: (!handlingType || (handlingType === 'independently' && !primaryExecutorId) || saving || !editMode || !hasUnsavedChanges) ? 'not-allowed' : 'pointer'
        }}
      >
        {saving ? (
          <span className="loading-spinner" />
        ) : (
          'Save Preferences'
        )}
      </button>
    </div>
  );
  
  // Listen for save events from parent component
  React.useEffect(() => {
    const handleSaveEvent = () => {
      if (editMode) {
        if (hasUnsavedChanges && handlingType) {
          // Only save if there are changes and we have a valid handling type
          if (handlingType === 'independently' && !primaryExecutorId) {
            toast.error('Please select a primary executor');
            return;
          }
          handleSave();
          setHasUnsavedChanges(false);
        } else if (handlingType) {
          // If we have a handling type but no changes, still consider it a success
          // This ensures the save icon works even when no changes were made
          console.log('Executor handling preferences are up to date');
        }
      }
    };
    
    window.addEventListener('executor-handling-save', handleSaveEvent);
    return () => {
      window.removeEventListener('executor-handling-save', handleSaveEvent);
    };
  }, [hasUnsavedChanges, editMode, handlingType, primaryExecutorId]);
}