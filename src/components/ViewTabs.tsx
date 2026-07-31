import React from 'react';
import { LayoutGrid, Building2, FileText, MapPin, CalendarDays } from 'lucide-react';

export type ViewType = 'board' | 'scene' | 'branch' | 'list' | 'self_explore' | 'vacation';

interface ViewTabsProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({ activeView, onViewChange }) => {
  const tabs: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'board', label: '整体看板', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'scene', label: '场景', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'branch', label: '厅堂', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'list', label: '名单', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'self_explore', label: '自拓', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'vacation', label: '休假', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center space-x-1 border-b border-slate-200 pb-1.5 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition flex-shrink-0 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
