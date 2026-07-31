import React from 'react';
import { LayoutGrid, Building2, MapPin, CalendarDays, FileText } from 'lucide-react';

export type ViewType = 'board' | 'scene' | 'branch' | 'list' | 'self_explore' | 'vacation';

interface ViewTabsProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({ activeView, onViewChange }) => {
  const tabs: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'board', label: '整体看板', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'scene', label: '合作方场景', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'branch', label: '厅堂支行', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'list', label: '线上名单', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'self_explore', label: '自拓获客', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'vacation', label: '30天休假', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar bg-slate-200/60 p-1 rounded-xl mb-2 text-xs">
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg font-bold transition whitespace-nowrap ${
              isActive
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
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
