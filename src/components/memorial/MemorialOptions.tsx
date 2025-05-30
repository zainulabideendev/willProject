import React from 'react';
import { Flame, HelpCircle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface MemorialOptionsProps {
  profileId: string;
  editMode?: boolean;
  memorialType?: string;
  memorialMessage?: string;
}

const memorialOptions = [
  {
    id: 'religious_service',
    label: 'Religious Service',
    description: 'A traditional religious service following your faith\'s customs and rituals, held in a place of worship.',
  },
  {
    id: 'life_celebration',
    label: 'Life Celebration',
    description: 'An upbeat gathering focused on celebrating your life, sharing happy memories, and honoring your legacy in a more casual setting.',
  },
  {
    id: 'private_gathering',
    label: 'Private Gathering',
    description: 'An intimate memorial service for close family and friends only, providing a more personal space for remembrance.',
  },
  {
    id: 'memorial_event',
    label: 'Memorial Event',
    description: 'A structured memorial event that can include speeches, music, or activities that were meaningful to you.',
  }
];

export function MemorialOptions({ profileId, editMode = true, memorialType: initialType, memorialMessage: initialMessage }: MemorialOptionsProps) {
  // Initialize state from localStorage or props
  const [memorialType, setMemorialType] = React.useState<string | undefined>(() => {
    const savedType = localStorage.getItem(`memorial-type-${profileId}`);
    return savedType || initialType;
  });
  
  const [memorialMessage, setMemorialMessage] = React.useState(() => {
    const savedMessage = localStorage.getItem(`memorial-message-${profileId}`);
    return savedMessage || initialMessage || '';
  });

  const handleMemorialTypeChange = (type: string) => {
    setMemorialType(type);
    localStorage.setItem(`memorial-type-${profileId}`, type);
  };

  const handleMessageChange = (message: string) => {
    setMemorialMessage(message);
    localStorage.setItem(`memorial-message-${profileId}`, message);
  };

  const handleSavePreferences = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          memorial_type: memorialType,
          memorial_message: memorialMessage
        })
        .eq('id', profileId);

      if (error) throw error;
      
      toast.success('Memorial preferences saved successfully');
    } catch (error) {
      console.error('Error updating memorial preferences:', error);
      toast.error('Failed to update memorial preferences');
    }
  };

  return (
    <div className="mt-4 p-6 rounded-lg" style={{
      background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
      boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
    }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{
          background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
          color: 'white'
        }}>
          <Flame className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-base font-semibold">Memorial Service</h3>
      </div>

      <div className="mb-6">
        <p className="text-xs text-[#2D2D2D]/60 mb-3">
          What type of memorial service would you prefer?
        </p>
        <div className="space-y-3">
          {memorialOptions.map((option) => (
            <Tooltip.Provider key={option.id}>
              <Tooltip.Root>
                <button 
                  disabled={!editMode}
                  onClick={() => handleMemorialTypeChange(option.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    memorialType === option.id
                      ? 'bg-gradient-to-r from-[#0047AB] to-[#D4AF37] text-white'
                      : 'bg-gradient-to-r from-[#ffffff] to-[#f5f5f5]'}`}
                  style={{
                    boxShadow: memorialType === option.id
                      ? '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                      : 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff',
                     opacity: !editMode ? 0.7 : 1,
                     cursor: !editMode ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{option.label}</span>
                    <Tooltip.Trigger asChild>
                      <button 
                        className="p-1 rounded-full hover:bg-black/5 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip.Trigger>
                  </div>
                </button>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="max-w-[calc(100vw-2rem)] sm:max-w-md text-white text-xs px-3 py-2 rounded-lg"
                    side="top"
                    align="center"
                    avoidCollisions={true}
                    style={{
                      background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
                      boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
                    }}
                    sideOffset={5}
                  >
                    {option.description}
                    <Tooltip.Arrow className="fill-[#0047AB]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#2D2D2D]/60 mb-3">
          Additional memorial instructions or wishes:
        </p>
        <textarea
          value={memorialMessage}
          onChange={(e) => handleMessageChange(e.target.value)}
          className="w-full min-h-[120px] p-3 rounded-lg text-sm resize-none"
          disabled={!editMode}
          placeholder="Share any specific wishes for your memorial service..."
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff',
            opacity: !editMode ? 0.7 : 1,
            cursor: !editMode ? 'not-allowed' : 'auto'
          }}
        />
      </div>

      <button
        onClick={handleSavePreferences}
        disabled={!editMode}
        className="w-full mt-6 py-2 px-4 text-white rounded-lg transition-all text-sm"
        style={{
          background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
          boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
          opacity: !editMode ? 0.5 : 1,
          cursor: !editMode ? 'not-allowed' : 'pointer'
        }}
      >
        Save Preferences
      </button>
    </div>
  );
}