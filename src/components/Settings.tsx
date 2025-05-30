import React from 'react';
import { supabase } from '../lib/supabase';

export function Settings() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-12rem)]">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-[#2D2D2D] mb-4">Settings</h2>
        
        <div className="space-y-4">
          <div className="pb-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-[#2D2D2D] mb-1">Notifications</h3>
            <p className="text-sm text-[#2D2D2D]/60">Configure your notification preferences</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#2D2D2D] mb-1">Privacy</h3>
            <p className="text-sm text-[#2D2D2D]/60">Manage your privacy settings</p>
          </div>
        </div>
      </div>
      
      <div className="mt-auto p-6">
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full text-sm text-white px-4 py-3 rounded-lg transition-all hover:transform hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(145deg, #0047AB, #D4AF37)',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}