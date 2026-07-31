import React from 'react';
import { Calendar, Eye, Download, Plus, Users, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthUser } from '../types';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  authUser: AuthUser;
  onAuthUserChange: (user: AuthUser) => void;
  showExperienceColor: boolean;
  onToggleExperienceColor: () => void;
  groups: string[];
  onExportExcel: () => void;
  onExportImage: () => void;
  onOpenStaffModal: () => void;
  onOpenDirectionModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  authUser,
  onAuthUserChange,
  showExperienceColor,
  onToggleExperienceColor,
  groups,
  onExportExcel,
  onExportImage,
  onOpenStaffModal,
  onOpenDirectionModal
}) => {
  const changeDateByDays = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    onDateChange(d.toISOString().split('T')[0]);
  };

  return (
    <header className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white p-3 md:p-4 rounded-xl shadow-lg mb-3">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight">智能排班系统</h1>
              <p className="text-xs text-indigo-200 hidden md:block">次日作业规划 & 多维度人力协同</p>
            </div>
          </div>

          <div className="md:hidden">
            <select
              value={authUser.role === 'manager' ? 'manager' : authUser.groupId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'manager') {
                  onAuthUserChange({ role: 'manager' });
                } else {
                  onAuthUserChange({ role: 'leader', groupId: val });
                }
              }}
              className="bg-indigo-800 text-white text-xs px-2 py-1 rounded border border-indigo-600 focus:outline-none"
            >
              <option value="manager">👑 经理 (全局)</option>
              {groups.map(g => (
                <option key={g} value={g}>👤 {g}组长</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center bg-slate-900/60 p-1.5 rounded-lg border border-indigo-500/30">
          <button 
            onClick={() => changeDateByDays(-1)} 
            className="p-1 hover:bg-slate-700 rounded text-slate-300 transition"
            title="前一天"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <input
            type="date"
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-white font-semibold text-sm px-2 focus:outline-none cursor-pointer"
          />

          <button 
            onClick={() => changeDateByDays(1)} 
            className="p-1 hover:bg-slate-700 rounded text-slate-300 transition"
            title="后一天"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="hidden md:flex items-center space-x-1 bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-700">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs text-slate-300">角色:</span>
            <select
              value={authUser.role === 'manager' ? 'manager' : authUser.groupId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'manager') {
                  onAuthUserChange({ role: 'manager' });
                } else {
                  onAuthUserChange({ role: 'leader', groupId: val });
                }
              }}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="manager" className="bg-slate-800">经理 (全员分配)</option>
              {groups.map(g => (
                <option key={g} value={g} className="bg-slate-800">{g}组长 (本组)</option>
              ))}
            </select>
          </div>

          <button
            onClick={onToggleExperienceColor}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition border ${
              showExperienceColor 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                : 'bg-slate-700/50 text-slate-300 border-slate-600'
            }`}
            title="控制卡片上是否色彩区分高手/新手"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showExperienceColor ? '经验显色: 开' : '经验显色: 关'}</span>
          </button>

          {authUser.role === 'manager' && (
            <>
              <button
                onClick={onOpenDirectionModal}
                className="px-2 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增方向/场景</span>
              </button>
              <button
                onClick={onOpenStaffModal}
                className="px-2 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition"
              >
                <Users className="w-3.5 h-3.5" />
                <span>人员管理</span>
              </button>
            </>
          )}

          <button
            onClick={onExportExcel}
            className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出表格</span>
          </button>

          <button
            onClick={onExportImage}
            className="px-2 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出图片</span>
          </button>

        </div>
      </div>
    </header>
  );
};
