import React from 'react';
import { MessageSquare, HelpCircle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface LastMessageProps {
  profileId: string;
  message?: string;
}

export function LastMessage({ profileId, message: initialMessage }: LastMessageProps) {
  // Initialize state from localStorage or prop
  const [message, setMessage] = React.useState(() => {
    const savedMessage = localStorage.getItem(`last-message-${profileId}`);
    return savedMessage || initialMessage || '';
  });
  const [saving, setSaving] = React.useState(false);

  const handleMessageChange = (newMessage: string) => {
    setMessage(newMessage);
    localStorage.setItem(`last-message-${profileId}`, newMessage);
  };

  const handleSaveMessage = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          last_message: message
        })
        .eq('id', profileId);

      if (error) throw error;
      
      toast.success('Personal message saved successfully');
    } catch (error) {
      console.error('Error updating personal message:', error);
      toast.error('Failed to update personal message');
    } finally {
      setSaving(false);
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
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-base font-semibold">Personal Message</h3>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[#2D2D2D]/60">
            Write a personal message for your loved ones:
          </p>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="p-1 rounded-full hover:bg-black/5 transition-colors">
                  <HelpCircle className="w-3.5 h-3.5 text-[#2D2D2D]/60" />
                </button>
              </Tooltip.Trigger>
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
                  onPointerDownOutside={(e) => e.preventDefault()}
                >
                  This message will be shared with your loved ones. Take your time to write something meaningful and personal.
                  <Tooltip.Arrow className="fill-[#0047AB]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <textarea
          value={message}
          onChange={(e) => handleMessageChange(e.target.value)}
          className="w-full min-h-[200px] p-4 rounded-lg text-sm resize-none"
          placeholder="Write your personal message here..."
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
          }}
        />
      </div>

      <button
        onClick={handleSaveMessage}
        disabled={saving}
        className="w-full mt-6 py-2 px-4 text-white rounded-lg transition-all text-sm"
        style={{
          background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
          boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff',
          opacity: saving ? 0.5 : 1,
          cursor: saving ? 'not-allowed' : 'pointer'
        }}
      >
        {saving ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
        ) : (
          'Save Message'
        )}
      </button>
    </div>
  );
}