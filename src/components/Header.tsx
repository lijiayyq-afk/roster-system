import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, Shield, Palette, Download, Building, Users, RefreshCw } from 'lucide-react';
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
  onResetData?: () => void;
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
  onResetData
}) => {
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
    <header className="bg-white rounded-xl shadow-xs border border-slate-200 p-3 mb-3 space-y-2">
      {/* 顶栏第一层：标题 + 日期选择器 + 角色权限 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold text-sm">
            排班
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">智能时段人员排班系统</h1>
            <p className="text-[10px] text-slate-400">移动端优先 · 场景视能 · 30天休假预警</p>
          </div>
        </div>

        {/* 日期选择器 */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={handlePrevDay}
            className="p-1 hover:bg-white rounded text-slate-600 transition"
            title="前一天"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1 px-2 font-bold text-xs text-slate-700">
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
            className="p-1 hover:bg-white rounded text-slate-600 transition"
            title="后一天"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 角色与组别权限切换器 */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-900">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>身份:</span>
            <select
              value={authUser.role}
              onChange={(e) => {
                const role = e.target.value as 'manager' | 'leader';
                onAuthUserChange({
                  role,
                  groupId: role === 'leader' ? groups[0] || '20501组' : undefined
                });
              }}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
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
        </div>
      </div>

      {/* 顶栏第二层：三阶显色控制 + 场景/人员管理 + 导出 */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
        
        {/* 三阶显色模式切换 */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg">
          <span className="text-[11px] text-slate-500 font-medium px-2 flex items-center">
            <Palette className="w-3 h-3 mr-1 text-indigo-600" />
            显色:
          </span>
          
          <button
            onClick={() => onChangeColorMode('none')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              colorMode === 'none' ? 'bg-white text-slate-800 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            无显色
          </button>

          <button
            onClick={() => onChangeColorMode('experience')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              colorMode === 'experience' ? 'bg-white text-amber-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            经验
          </button>

          <button
            onClick={() => onChangeColorMode('group')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              colorMode === 'group' ? 'bg-white text-indigo-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            小组
          </button>
        </div>

        {/* 右侧业务工具按钮 */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          {onResetData && (
            <button
              onClick={onResetData}
              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold flex items-center space-x-1 border border-blue-200 transition"
              title="载入真实 148 人与 29 个场景数据"
            >
              <RefreshCw className="w-3 h-3 text-blue-600" />
              <span>载入真实数据</span>
            </button>
          )}

          <button
            onClick={onOpenDirectionModal}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center space-x-1 border border-slate-200 transition"
          >
            <Building className="w-3 h-3 text-slate-500" />
            <span>场景管理</span>
          </button>

          <button
            onClick={onOpenStaffModal}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center space-x-1 border border-slate-200 transition"
          >
            <Users className="w-3 h-3 text-slate-500" />
            <span>人员管理</span>
          </button>

          <button
            onClick={onExportExcel}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center space-x-1 shadow-2xs transition"
          >
            <Download className="w-3 h-3" />
            <span>导出Excel</span>
          </button>

          <button
            onClick={onExportImage}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center space-x-1 shadow-2xs transition"
          >
            <Download className="w-3 h-3" />
            <span>导出图片</span>
          </button>
        </div>

      </div>
    </header>
  );
};
