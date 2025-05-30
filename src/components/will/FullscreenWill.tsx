import React from 'react';
import { WillHeader } from './WillHeader';
import { WillContent } from './WillContent';
import { WillActions } from './WillActions';

interface FullscreenWillProps {
  content: string;
  fullName?: string;
  isReviewed: boolean;
  onMarkAsReviewed: () => void;
  onToggleFullscreen: () => void;
}

export function FullscreenWill({ 
  content, 
  fullName, 
  isReviewed, 
  onMarkAsReviewed, 
  onToggleFullscreen 
}: FullscreenWillProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <WillHeader 
          fullName={fullName} 
          isFullscreen={true} 
          onToggleFullscreen={onToggleFullscreen} 
        />
      </div>
      
      <WillContent 
        content={content} 
        isFullscreen={true} 
      />
      
      <WillActions 
        isReviewed={isReviewed} 
        onMarkAsReviewed={onMarkAsReviewed} 
        isFullscreen={true} 
      />
    </div>
  );
}