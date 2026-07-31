import React from 'react';
import { LayoutGrid, Building, Landmark, FileText, Compass, Users2, CalendarDays } from 'lucide-react';

export type ViewType = 'board' | 'scene' | 'branch' | 'list' | 'self_explore' | 'group' | 'vacation';

interface ViewTabsProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({ activeView, onViewChange }) => {
  const tabs: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'board', label: '默认看板', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'scene', label: '场景视角', icon: <Building className="w-4 h-4" /> },
    { id: 'branch', label: '厅堂视角', icon: <Landmark className="w-4 h-4" /> },
    { id: 'list', label: '名单视角', icon: <FileText className="w-4 h-4" /> },
    { id: 'self_explore', label: '自拓视角', icon: <Compass className="w-4 h-4" /> },
    { id: 'group', label: '小组视角', icon: <Users2 className="w-4 h-4" /> },
    { id: 'vacation', label: '休假视角(30天)', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <div className="flex overflow-x-auto no-scrollbar space-x-1.5 p-1.5 bg-slate-200/80 backdrop-blur rounded-xl mb-3">
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
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
