import React from 'react';
import { Calendar, Eye, Download, Plus, Users, Shield, ArrowLeft, ArrowRight, Palette } from 'lucide-react';
import { AuthUser, ColorHighlightMode } from '../types';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  authUser: AuthUser;
  onAuthUserChange: (user: AuthUser) => void;
  colorMode: ColorHighlightMode;
  onChangeColorMode: (mode: ColorHighlightMode) => void;
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
  colorMode,
  onChangeColorMode,
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

  const handleNextColorMode = () => {
    if (colorMode === 'none') onChangeColorMode('experience');
    else if (colorMode === 'experience') onChangeColorMode('group');
    else onChangeColorMode('none');
  };

  const getColorModeLabel = () => {
    if (colorMode === 'experience') return '显色: 按经验';
    if (colorMode === 'group') return '显色: 按小组';
    return '显色: 无 (默认干净)';
  };

  return (
    <header className="bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900 text-white p-3 md:p-4 rounded-xl shadow-lg mb-3">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2.5">
        
        {/* LOGO & 移动端身份切换 */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold tracking-tight">智能排班系统</h1>
              <p className="text-[11px] text-indigo-200 hidden md:block">次日作业规划 & 移动端可视化协同</p>
            </div>
          </div>

          {/* 移动端快捷身份选择 */}
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
              className="bg-indigo-800 text-white text-xs px-2 py-1 rounded-lg border border-indigo-600 focus:outline-none"
            >
              <option value="manager">👑 经理 (全局)</option>
              {groups.map(g => (
                <option key={g} value={g}>👤 {g}组长</option>
              ))}
            </select>
          </div>
        </div>

        {/* 日期选择与快翻 */}
        <div className="flex items-center bg-slate-900/70 px-2 py-1 rounded-xl border border-indigo-500/30 shadow-inner">
          <button 
            onClick={() => changeDateByDays(-1)} 
            className="p-1 hover:bg-slate-700/80 rounded-lg text-slate-300 transition active:scale-95"
            title="前一天"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <input
            type="date"
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-white font-semibold text-xs md:text-sm px-2 focus:outline-none cursor-pointer"
          />

          <button 
            onClick={() => changeDateByDays(1)} 
            className="p-1 hover:bg-slate-700/80 rounded-lg text-slate-300 transition active:scale-95"
            title="后一天"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 顶部多功能操作区 */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-end">
          
          {/* PC端身份选择 */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-700">
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
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="manager" className="bg-slate-800">经理 (全员分配)</option>
              {groups.map(g => (
                <option key={g} value={g} className="bg-slate-800">{g}组长 (本组)</option>
              ))}
            </select>
          </div>

          {/* 显色控制：无 / 经验 / 小组 */}
          <button
            onClick={handleNextColorMode}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border active:scale-95 shadow-sm ${
              colorMode === 'experience'
                ? 'bg-amber-500/25 text-amber-300 border-amber-500/60'
                : colorMode === 'group'
                ? 'bg-indigo-500/25 text-indigo-300 border-indigo-500/60'
                : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}
            title="点击切换：无显色 -> 经验显色 -> 小组显色"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{getColorModeLabel()}</span>
          </button>

          {/* 场景管理 (按要求从"新增方向/场景"重命名为"场景管理") */}
          {authUser.role === 'manager' && (
            <>
              <button
                onClick={onOpenDirectionModal}
                className="px-2.5 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>场景管理</span>
              </button>
              <button
                onClick={onOpenStaffModal}
                className="px-2.5 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
              >
                <Users className="w-3.5 h-3.5" />
                <span>人员管理</span>
              </button>
            </>
          )}

          {/* 导出菜单 */}
          <button
            onClick={onExportExcel}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出表格</span>
          </button>

          <button
            onClick={onExportImage}
            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出图片</span>
          </button>

        </div>
      </div>
    </header>
  );
};
