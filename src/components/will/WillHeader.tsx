import React from 'react';
import { FileText, Maximize2, Minimize2 } from 'lucide-react';

interface WillHeaderProps {
  fullName?: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function WillHeader({ fullName, isFullscreen, onToggleFullscreen }: WillHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#0047AB]" />
        <h2 className="text-xl font-semibold">
          {fullName ? `Last Will and Testament of ${fullName}` : 'Last Will and Testament'}
        </h2>
      </div>
      <div>
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={isFullscreen ? "Exit fullscreen" : "View in fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-[#2D2D2D]" />
          ) : (
            <Maximize2 className="w-5 h-5 text-[#2D2D2D]" />
          )}
        </button>
      </div>
    </div>
  );
}