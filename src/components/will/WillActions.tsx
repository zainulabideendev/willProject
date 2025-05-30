import React from 'react';
import { CheckCircle } from 'lucide-react';

interface WillActionsProps {
  isReviewed: boolean;
  onMarkAsReviewed: () => void;
  isFullscreen: boolean;
  onNavigate: (screen: string) => void;
}

export function WillActions({ isReviewed, onMarkAsReviewed, isFullscreen, onNavigate }: WillActionsProps) {
  return (
    <div className={isFullscreen ? "p-4 border-t bg-white flex justify-between items-center" : ""}>
      <div></div>
      {!isReviewed ? (
        <button
          onClick={() => {
            onMarkAsReviewed();
            onNavigate('dashboard');
          }}
          className={`${isFullscreen ? 'flex' : 'w-full flex'} items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition-all hover:transform hover:scale-[1.02]`}
          style={{
            background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
            boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
          }}
        >
          <CheckCircle className="w-5 h-5" />
          <span>Mark {isFullscreen ? '' : 'Will as '}Reviewed</span>
        </button>
      ) : (
        <div 
          className={`${isFullscreen ? 'flex' : 'flex w-full'} items-center justify-center gap-2 px-4 py-3 rounded-lg text-white`}
          style={{
            background: 'linear-gradient(145deg, #10B981, #059669)',
            boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
          }}
        >
          <CheckCircle className="w-5 h-5" />
          <span>Will Reviewed</span>
        </div>
      )}
    </div>
  );
}