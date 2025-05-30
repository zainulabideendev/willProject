import React from 'react';
import { Cross, Flame, Leaf, PartyPopper, Info } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import './BurialOptions.css';

interface BurialOptionsProps {
  profileId: string;
  burialType?: string;
}

const burialOptions = [
  {
    id: 'traditional',
    label: 'Traditional Burial',
    description: 'A traditional burial service with a casket, cemetery plot, and traditional funeral service. This includes embalming, viewing, and a graveside ceremony.',
    icon: Cross
  },
  {
    id: 'cremation',
    label: 'Cremation',
    description: 'Cremation followed by your choice of ash scattering, storage in an urn, or placement in a columbarium. This can be combined with a memorial service before or after.',
    icon: Flame
  },
  {
    id: 'green_burial',
    label: 'Green Burial',
    description: 'An environmentally conscious burial without embalming, using biodegradable materials. The body is buried in a natural setting that aids decomposition and promotes ecological restoration.',
    icon: Leaf
  },
  {
    id: 'celebration_of_life',
    label: 'Celebration of Life',
    description: 'A personalized celebration focusing on your life and legacy, which can be combined with any burial method. This typically involves sharing memories, music, and stories in a more upbeat atmosphere.',
    icon: PartyPopper
  }
];

export function BurialOptions({ profileId, burialType: initialBurialType }: BurialOptionsProps) {
  // Initialize state from localStorage or prop
  const [burialType, setBurialType] = React.useState<string | undefined>(() => {
    const savedType = localStorage.getItem(`burial-type-${profileId}`);
    return savedType || initialBurialType;
  });

  const handleBurialTypeChange = (type: string) => {
    setBurialType(type);
    localStorage.setItem(`burial-type-${profileId}`, type);
  };

  const handleSavePreference = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ burial_type: burialType })
        .eq('id', profileId);

      if (error) throw error;
      
      toast.success('Burial preference saved successfully');
    } catch (error) {
      console.error('Error updating burial type:', error);
      toast.error('Failed to update burial preference');
    }
  };

  return (
    <div className="burial-container">
      <div className="burial-header">
        <div className="burial-icon-container">
          <Cross className="burial-icon" />
        </div>
        <h3 className="burial-title">Burial Preference</h3>
      </div>
      <div>
        <p className="burial-description">
          How would you like to be laid to rest?
        </p>
        <div className="burial-options-container">
          {burialOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleBurialTypeChange(option.id)}
              className={`burial-option ${option.id === burialType ? 'selected' : ''} relative`}
            >
              <div className="burial-option-content">
                <span className="burial-option-label">{option.label}</span>
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle tooltip click
                        }}
                        className="p-1 rounded-full hover:bg-black/5 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="max-w-[calc(100vw-2rem)] sm:max-w-md text-white text-xs px-3 py-2 rounded-lg"
                        side="top"
                        align="center"
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
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={handleSavePreference}
          className="save-preference-button"
          disabled={!burialType}
        >
          Save Preference
        </button>
      </div>
    </div>
  );
}