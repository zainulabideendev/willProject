import React from 'react';

interface WillContentProps {
  content: string;
  isFullscreen: boolean;
}

export function WillContent({ content, isFullscreen }: WillContentProps) {
  return (
    <div 
      className={`${isFullscreen ? 'flex-1 overflow-auto p-6 bg-gray-50' : 'bg-white p-6 rounded-lg mb-6'}`}
      style={!isFullscreen ? {
        background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
        boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff'
      } : {}}
    >
      <pre className={`whitespace-pre-wrap ${isFullscreen ? 'text-base' : 'text-sm'} text-[#2D2D2D] leading-relaxed ${isFullscreen ? 'max-w-4xl mx-auto' : 'overflow-auto max-h-[60vh]'}`}>
        {content}
      </pre>
    </div>
  );
}