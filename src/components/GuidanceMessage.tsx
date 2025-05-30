import React from 'react';
import { AlertCircle } from 'lucide-react';

interface GuidanceMessageProps {
  message: string;
  children?: React.ReactNode;
}

export function GuidanceMessage({ message, children }: GuidanceMessageProps) {
  return (
    <div className="text-sm text-[#2D2D2D]/60 text-center guidance-message">
      {message}
      {children}
    </div>
  );
}