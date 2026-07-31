import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Shield, Palette, Download, Building, Users, Settings, ChevronDown } from 'lucide-react';
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
  onOpenDirectionModal,
}) => {
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  return (
    <header className="bg-white rounded-xl shadow-xs border border-slate-200 px-3 py-2 mb-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* 左侧：精简系统 Logo 与标题 */}
        <div className="flex items-center space-x-2">
          <div className="px-2 py-0.5 bg-indigo-600 rounded text-white font-bold text-xs">
            排班
          </div>
          <h1 className="text-sm font-bold text-slate-800">智能时段人员排班系统</h1>
        </div>

        {/* 中间：紧凑日期切换器 */}
        <div className="flex items-center space-x-1 bg-slate-100/90 px-1.5 py-0.5 rounded-lg border border-slate-200">
          <button
            onClick={handlePrevDay}
            className="p-0.5 hover:bg-white rounded text-slate-600 transition"
            title="前一天"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center space-x-1 px-1 font-bold text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-800 cursor-pointer"
            />
          </div>

          <button
            onClick={handleNextDay}
            className="p-0.5 hover:bg-white rounded text-slate-600 transition"
            title="后一天"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 右侧：合并紧凑工具区 */}
        <div className="flex items-center space-x-2 flex-wrap justify-end">
          
          {/* 身份/权限模式并排 */}
          <div className="flex items-center space-x-1 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg text-xs">
            <Shield className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <select
              value={authUser.role}
              onChange={(e) => {
                const role = e.target.value as 'manager' | 'leader';
                onAuthUserChange({
                  role,
                  groupId: role === 'leader' ? groups[0] || '20501组' : undefined
                });
              }}
              className="bg-transparent font-bold text-indigo-900 focus:outline-none cursor-pointer text-xs"
            >
              <option value="manager">经理 (全局)</option>
              <option value="leader">组长 (本组)</option>
            </select>

            {authUser.role === 'leader' && (
              <select
                value={authUser.groupId}
                onChange={(e) => onAuthUserChange({ ...authUser, groupId: e.target.value })}
                className="bg-white border border-indigo-300 rounded px-1 text-xs font-bold text-indigo-700 focus:outline-none"
              >
                {groups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            )}
          </div>

          {/* 显色模式紧凑并排 */}
          <div className="flex items-center space-x-0.5 bg-slate-100 p-0.5 rounded-lg text-xs">
            <Palette className="w-3 h-3 text-slate-400 ml-1 mr-0.5" />
            <button
              onClick={() => onChangeColorMode('none')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                colorMode === 'none' ? 'bg-white text-slate-800 shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              无
            </button>
            <button
              onClick={() => onChangeColorMode('experience')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                colorMode === 'experience' ? 'bg-white text-amber-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              经验
            </button>
            <button
              onClick={() => onChangeColorMode('group')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                colorMode === 'group' ? 'bg-white text-indigo-900 shadow-2xs font-bold' : 'text-slate-500'
              }`}
            >
              小组
            </button>
          </div>

          {/* 合并管理功能下拉 */}
          <div className="relative">
            <button
              onClick={() => {
                setIsManageMenuOpen(!isManageMenuOpen);
                setIsExportMenuOpen(false);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-slate-300 transition"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>管理功能</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isManageMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs animate-fade-in"
                onMouseLeave={() => setIsManageMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    setIsManageMenuOpen(false);
                    onOpenDirectionModal();
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center space-x-1.5 font-medium"
                >
                  <Building className="w-3.5 h-3.5 text-blue-500" />
                  <span>场景/网点管理</span>
                </button>
                <button
                  onClick={() => {
                    setIsManageMenuOpen(false);
                    onOpenStaffModal();
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center space-x-1.5 font-medium"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  <span>人员名单管理</span>
                </button>
              </div>
            )}
          </div>

          {/* 合并导出功能下拉 */}
          <div className="relative">
            <button
              onClick={() => {
                setIsExportMenuOpen(!isExportMenuOpen);
                setIsManageMenuOpen(false);
              }}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
              <ChevronDown className="w-3 h-3 text-indigo-200" />
            </button>

            {isExportMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs animate-fade-in"
                onMouseLeave={() => setIsExportMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onExportExcel();
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-emerald-50 text-emerald-800 flex items-center space-x-1.5 font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>导出 Excel</span>
                </button>
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onExportImage();
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-50 text-indigo-800 flex items-center space-x-1.5 font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>导出图片</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
