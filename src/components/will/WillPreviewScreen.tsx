import React from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../lib/hooks';
import { toast } from 'sonner';
import willTemplate from '../../lib/will_template.txt?raw';
import { WillHeader } from './WillHeader';
import { WillContent } from './WillContent';
import { WillActions } from './WillActions';
import { FullscreenWill } from './FullscreenWill';
import { useWillData } from './WillDataProvider';
import { generateWillContent } from './WillGenerator';
import './WillPreviewScreen.css';
import { useNavigate } from 'react-router-dom';

interface WillPreviewScreenProps {
  onNavigate: (screen: string) => void;
}

function WillPreviewContent({ onNavigate }: WillPreviewScreenProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { score, refetchScore } = useEstateScore(profile?.id);
  const { loading, assets, beneficiaries, executors, children, assetAllocations, residueAllocations, partnerFirm } = useWillData();
  const [willContent, setWillContent] = React.useState('');
  const [willReviewed, setWillReviewed] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (profile) {
      setWillReviewed(profile.will_reviewed || false);
    }
  }, [profile]);

  // Generate will content when data changes
  React.useEffect(() => {
    if (profile && !loading) {
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
      setWillContent(content);
    }
  }, [profile, loading, assets, beneficiaries, executors, children, assetAllocations, residueAllocations, partnerFirm]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMarkAsReviewed = async () => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ will_reviewed: true })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      setWillReviewed(true);
      
      // Update estate score
      await refetchScore();
      
      toast.success('Will marked as reviewed successfully! Your estate score has been updated.', {
        duration: 5000,
        onAutoClose: () => {
          // Navigate back to dashboard and refresh to show updated score
          onNavigate('dashboard');
          setTimeout(() => navigate(0), 300);
        }
      });
      
      // Navigate back to dashboard after successful review
      // This is now handled by the toast callback
    } catch (error) {
      console.error('Error marking will as reviewed:', error);
      toast.error('Failed to mark will as reviewed');
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isFullscreen) {
    return <FullscreenWill 
      content={willContent}
      fullName={profile?.full_name}
      isReviewed={willReviewed}
      onMarkAsReviewed={handleMarkAsReviewed}
      onToggleFullscreen={toggleFullscreen}
    />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <h1 className="text-lg font-semibold text-[#2D2D2D] ml-2">Will Preview</h1>
      </div>

      <div className="bg-white rounded-lg p-6" style={{
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
      }}>
        <WillHeader 
          fullName={undefined} 
          isFullscreen={false} 
          onToggleFullscreen={toggleFullscreen} 
        />
        
        <WillContent 
          content={willContent} 
          isFullscreen={false} 
        />
        
        <WillActions 
          isReviewed={willReviewed} 
          onMarkAsReviewed={handleMarkAsReviewed} 
          isFullscreen={false} 
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

export function WillPreviewScreen(props: WillPreviewScreenProps) {
  const { profile } = useProfile();
  
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  return (
    <WillDataProvider profile={profile}>
      <WillPreviewContent {...props} />
    </WillDataProvider>
  );
}