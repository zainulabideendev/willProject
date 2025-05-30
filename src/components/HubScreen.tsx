import React from 'react';
import { ArrowLeft, ClipboardList, DollarSign, Key, Heart, Users, ScrollText, FileSpreadsheet } from 'lucide-react';
import './HubScreen.css';

interface HubScreenProps {
  onNavigate: (screen: string) => void;
}

const resources = [
  {
    title: 'Life Questionnaire',
    description: 'Complete a questionnaire to assess your estate planning needs',
    icon: ClipboardList
  },
  {
    title: 'Estate Calculator',
    description: 'Calculate the estimated value and tax implications of your estate',
    icon: DollarSign
  },
  {
    title: 'Create a Trust',
    description: 'Guide to establish a trust to protect and manage your assets',
    icon: Key
  },
  {
    title: 'Create a Living Will',
    description: 'Document your medical treatment preferences and end-of-life decisions',
    icon: Heart
  },
  {
    title: 'Executor Guide',
    description: 'Resources to help your chosen executor manage your estate',
    icon: Users
  },
  {
    title: 'Power of Attorney',
    description: 'Designate someone to make financial or medical decisions on your behalf',
    icon: ScrollText
  },
  {
    title: 'Liquidation and Distribution Account',
    description: 'Understand the process of settling and distributing your estate',
    icon: FileSpreadsheet
  }
];

export function HubScreen({ onNavigate }: HubScreenProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
        >
          <ArrowLeft className="w-6 h-6 text-[#2D2D2D]" />
        </button>
        <h1 className="text-lg font-semibold text-[#2D2D2D]">Estate Essentials Hub</h1>
      </div>

      <div className="hub-screen text-center">
        <div className="resources-grid">
          {resources.map((resource, index) => (
            <div key={index} className="resource-card">
              <div className="resource-header">
                <div className="resource-icon">
                  <resource.icon />
                </div>
                <h3 className="text-lg font-semibold text-[#2D2D2D]">
                  {resource.title}
                </h3>
              </div>
              <p className="resource-content">
                {resource.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}