import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ImportantNoteProps {
  message: string;
}

export function ImportantNote({ message }: ImportantNoteProps) {
  return (
    <div className="important-note">
      <div className="important-note-icon">
        <AlertCircle className="w-3.5 h-3.5" />
      </div>
      <p className="important-note-text">{message}</p>
    </div>
  );
}