import React from 'react';
import { Calendar, UserCheck, Download, Settings, CheckCircle2, Edit3, Image as ImageIcon, FileSpreadsheet, Eye, Clock, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { AuthUser, ColorHighlightMode } from '../types';
import { ViewType } from './ViewTabs';
import { TimeSlotTab } from './BoardView';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  authUser: AuthUser;
  onAuthUserChange: (user: AuthUser) => void;
  colorMode: ColorHighlightMode;
  onChangeColorMode: (mode: ColorHighlightMode) => void;
  groups: string[];
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onExportExcel: () => void;
  onExportImage: () => void;
  onOpenStaffModal: () => void;
  onOpenDirectionModal: () => void;
  // 新增：视图与时段下拉控制
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  activeSlot: TimeSlotTab;
  onSlotChange: (slot: TimeSlotTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  authUser,
  onAuthUserChange,
  colorMode,
  onChangeColorMode,
  groups,
  isEditMode,
  onToggleEditMode,
  onExportExcel,
  onExportImage,
  onOpenStaffModal,
  onOpenDirectionModal,
  activeView,
  onViewChange,
  activeSlot,
  onSlotChange,
}) => {
  const formatGroupMinimal = (g: string) => {
    const match = g.match(/\d+/);
    return match ? match[0].slice(-2) : g;
  };

  const handleRoleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'manager') {
      onAuthUserChange({ role: 'manager' });
    } else {
      onAuthUserChange({ role: 'leader', groupId: val });
    }
  };

  const currentRoleValue = authUser.role === 'manager' ? 'manager' : (authUser.groupId || groups[0]);

  return (
    <header className="bg-white border border-slate-200/90 rounded-2xl p-2 md:p-2.5 shadow-2xs space-y-2">
      
      {/* 顶栏第一行：标题与全局下拉控制项 (移动端自适应平齐) */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
        
        {/* 左侧：系统标题 */}
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
            排
          </div>
          <h1 className="font-extrabold text-xs md:text-sm text-slate-800 tracking-tight">
            智能排班系统
          </h1>
        </div>

        {/* 中间下拉控制组：日期 / 角色 / 视图 / 时段 (一排整齐对齐) */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 justify-end md:justify-start">
          
          {/* 1. 日期选择下拉框 */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 hover:border-slate-300 transition">
            <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1 flex-shrink-0" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="text-xs bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          {/* 2. 角色/组别选择下拉框 */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 hover:border-slate-300 transition">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600 mr-1 flex-shrink-0" />
            <select
              value={currentRoleValue}
              onChange={handleRoleSelectChange}
              className="text-xs bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="manager">👑 全盘经理视角</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  👥 {formatGroupMinimal(g)}组
                </option>
              ))}
            </select>
          </div>

          {/* 3. 视图选择下拉框 (取代原Tab) */}
          <div className="relative flex items-center bg-indigo-50/70 border border-indigo-200 rounded-lg px-1.5 py-1 hover:border-indigo-300 transition">
            <Eye className="w-3.5 h-3.5 text-indigo-700 mr-1 flex-shrink-0" />
            <select
              value={activeView}
              onChange={(e) => onViewChange(e.target.value as ViewType)}
              className="text-xs bg-transparent font-bold text-indigo-900 focus:outline-none cursor-pointer pr-1"
            >
              <option value="board">📋 整体看板视图</option>
              <option value="scene">🛍️ 合作方场景视图</option>
              <option value="list">📄 线上名单视图</option>
              <option value="vacation">🏖️ 30天休假视图</option>
            </select>
          </div>

          {/* 4. 时段切面下拉框 (取代原横排) */}
          <div className="relative flex items-center bg-amber-50/70 border border-amber-200 rounded-lg px-1.5 py-1 hover:border-amber-300 transition">
            <Clock className="w-3.5 h-3.5 text-amber-700 mr-1 flex-shrink-0" />
            <select
              value={activeSlot}
              onChange={(e) => onSlotChange(e.target.value as TimeSlotTab)}
              className="text-xs bg-transparent font-bold text-amber-900 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">☀️ 时段: 全天作业</option>
              <option value="morning">🌅 时段: 上午 (08:30-12:00)</option>
              <option value="afternoon">🌤️ 时段: 下午 (13:30-17:30)</option>
              <option value="evening">🌙 时段: 晚上 (18:00-21:00)</option>
            </select>
          </div>

        </div>

        {/* 右侧：动作控制组（管理、导出、确定排班 在最后平齐排列） */}
        <div className="flex items-center space-x-1.5 flex-shrink-0 ml-auto pt-1 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
          
          {/* 管理功能下拉菜单 */}
          <div className="relative group">
            <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 border border-slate-200 transition">
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span>⚙️ 管理 ▾</span>
            </button>

            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1 hidden group-hover:block z-40 space-y-0.5 animate-fade-in">
              <button
                onClick={onOpenStaffModal}
                className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
              >
                👥 人员与离职管理
              </button>
              <button
                onClick={onOpenDirectionModal}
                className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
              >
                🏢 场景与网点管理
              </button>
              <div className="border-t border-slate-100 my-0.5"></div>
              <div className="px-2 py-1 text-[10px] text-slate-400 font-bold">高亮颜色:</div>
              <button
                onClick={() => onChangeColorMode(colorMode === 'group' ? 'none' : 'group')}
                className={`w-full text-left px-2 py-1 text-xs rounded-md ${
                  colorMode === 'group' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {colorMode === 'group' ? '✓ 已启用组别区分色' : '按组别淡色高亮'}
              </button>
              <button
                onClick={() => onChangeColorMode(colorMode === 'experience' ? 'none' : 'experience')}
                className={`w-full text-left px-2 py-1 text-xs rounded-md ${
                  colorMode === 'experience' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {colorMode === 'experience' ? '✓ 已启用新手标识色' : '按新手/高手高亮'}
              </button>
            </div>
          </div>

          {/* 导出下拉菜单 */}
          <div className="relative group">
            <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 border border-slate-200 transition">
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>📤 导出 ▾</span>
            </button>

            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-xl p-1 hidden group-hover:block z-40 space-y-0.5 animate-fade-in">
              <button
                onClick={onExportExcel}
                className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg font-medium flex items-center space-x-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>导出 Excel 表格</span>
              </button>
              <button
                onClick={onExportImage}
                className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg font-medium flex items-center space-x-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>导出高清图片</span>
              </button>
            </div>
          </div>

          {/* 确定完成 / 编辑排班 (放在最后且完美对齐) */}
          <button
            onClick={onToggleEditMode}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs transition ${
              isEditMode
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isEditMode ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>✅ 确定完成</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>✏️ 编辑排班</span>
              </>
            )}
          </button>

        </div>

      </div>

    </header>
  );
};
