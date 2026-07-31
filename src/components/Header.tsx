import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Shield, Palette, Download, Building, Users, Settings, ChevronDown, Edit3, CheckCircle2 } from 'lucide-react';
import { AuthUser, ColorHighlightMode } from '../types';
import { formatGroupMinimal } from './PersonCard';

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
    <header className="bg-white rounded-xl shadow-xs border border-slate-200 px-3 py-1.5 mb-2.5">
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
        
        {/* 左侧：智能排班与日期选择器合并在同一行 */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 font-bold text-slate-800">
            <span className="p-1 bg-indigo-600 rounded text-white text-[11px]">排班</span>
            <span className="text-xs">智能排班</span>
          </div>

          <div className="flex items-center space-x-0.5 bg-slate-100 px-1 py-0.5 rounded-lg border border-slate-200">
            <button onClick={handlePrevDay} className="p-0.5 hover:bg-white rounded text-slate-600">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center space-x-1 px-1 font-bold text-xs text-slate-700">
              <Calendar className="w-3 h-3 text-indigo-600" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-800 cursor-pointer"
              />
            </div>
            <button onClick={handleNextDay} className="p-0.5 hover:bg-white rounded text-slate-600">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 右侧：高度整合控制组件 */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          
          {/* 编辑模式 / 预览确定 切换按钮 */}
          <button
            onClick={onToggleEditMode}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition shadow-xs ${
              isEditMode
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-300'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            {isEditMode ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>确定完成</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>编辑排班</span>
              </>
            )}
          </button>

          {/* 身份切换 (经理 | 01 | 03 | 04 | 05 | 11 | 71 极简展现) */}
          <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
            <Shield className="w-3 h-3 text-indigo-600 flex-shrink-0" />
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
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="manager">经理 (全盘)</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {formatGroupMinimal(g)} 组
                </option>
              ))}
            </select>
          </div>

          {/* 管理与设置菜单 */}
          <div className="relative">
            <button
              onClick={() => {
                setIsManageMenuOpen(!isManageMenuOpen);
                setIsExportMenuOpen(false);
              }}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-slate-300"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>管理功能</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isManageMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs animate-fade-in space-y-0.5"
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
                  <span>人员与离职管理</span>
                </button>

                <div className="pt-1 border-t border-slate-100 px-3 py-1">
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">显色模式</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onChangeColorMode('none')}
                      className={`flex-1 py-0.5 text-[10px] rounded border font-semibold ${
                        colorMode === 'none' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      无
                    </button>
                    <button
                      onClick={() => onChangeColorMode('experience')}
                      className={`flex-1 py-0.5 text-[10px] rounded border font-semibold ${
                        colorMode === 'experience' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      经验
                    </button>
                    <button
                      onClick={() => onChangeColorMode('group')}
                      className={`flex-1 py-0.5 text-[10px] rounded border font-semibold ${
                        colorMode === 'group' ? 'bg-purple-50 border-purple-300 text-purple-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      小组
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 导出菜单 */}
          <div className="relative">
            <button
              onClick={() => {
                setIsExportMenuOpen(!isExportMenuOpen);
                setIsManageMenuOpen(false);
              }}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出</span>
              <ChevronDown className="w-3 h-3 text-slate-300" />
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
