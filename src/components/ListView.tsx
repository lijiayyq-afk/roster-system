import React, { useState } from 'react';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, Staff } from '../types';
import { PersonCard, formatGroupMinimal } from './PersonCard';
import { filterStaffByAuthUser } from '../models/PermissionModel';
import { Users, FileText, CheckCircle2 } from 'lucide-react';

interface ListViewProps {
  schedule: DailySchedule;
  staffList: Staff[];
  directions: Direction[];
  authUser: AuthUser;
  colorMode: ColorHighlightMode;
  onClickStaffCard: (staff: Staff) => void;
}

// 提取颜色的调色板 (Pastel Colors - 柔和非刺眼)
const PASTEL_PALETTES = [
  { bg: 'bg-emerald-50/70', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' },
  { bg: 'bg-indigo-50/70', border: 'border-indigo-200', text: 'text-indigo-900', badge: 'bg-indigo-100 text-indigo-800' },
  { bg: 'bg-sky-50/70', border: 'border-sky-200', text: 'text-sky-900', badge: 'bg-sky-100 text-sky-800' },
  { bg: 'bg-purple-50/70', border: 'border-purple-200', text: 'text-purple-900', badge: 'bg-purple-100 text-purple-800' },
  { bg: 'bg-amber-50/70', border: 'border-amber-200', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800' },
  { bg: 'bg-rose-50/70', border: 'border-rose-200', text: 'text-rose-900', badge: 'bg-rose-100 text-rose-800' },
  { bg: 'bg-teal-50/70', border: 'border-teal-200', text: 'text-teal-900', badge: 'bg-teal-100 text-teal-800' }
];

export const ListView: React.FC<ListViewProps> = ({
  schedule,
  staffList,
  directions,
  authUser,
  colorMode,
  onClickStaffCard,
}) => {
  const listDirections = directions.filter(d => d.category === 'list');
  const listDirIds = listDirections.map(d => d.id);

  const visibleStaff = filterStaffByAuthUser(staffList, authUser);

  // 获取所有安排在名单方向的人员
  const assignedListStaff = visibleStaff.filter(s => {
    const dirId = schedule.assignments[s.id];
    return listDirIds.includes(dirId) && !s.isExited;
  });

  // 按区域 region 进行分组
  const regionMap: Record<string, Staff[]> = {};
  assignedListStaff.forEach(s => {
    const reg = s.region || '待定';
    if (!regionMap[reg]) {
      regionMap[reg] = [];
    }
    regionMap[reg].push(s);
  });

  // 按区域名称排序，让“待定”排在最后
  const sortedRegions = Object.keys(regionMap).sort((a, b) => {
    if (a === '待定') return 1;
    if (b === '待定') return -1;
    return a.localeCompare(b, 'zh-CN');
  });

  return (
    <div id="list-view-export" className="space-y-3 animate-fade-in">
      
      {/* 头部总结 */}
      <div className="bg-white p-3 rounded-xl border border-emerald-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900">名单视角 (按区域色彩区分与排序)</h4>
            <p className="text-[10px] text-emerald-600">已排名单人员按所属区域自动归类并赋予柔和色彩</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            名单排班: {assignedListStaff.length} 人
          </span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            覆盖 {sortedRegions.length} 个区域
          </span>
        </div>
      </div>

      {/* 区域分组列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedRegions.map((regionName, index) => {
          const regionStaffList = regionMap[regionName];
          const stylePalette = PASTEL_PALETTES[index % PASTEL_PALETTES.length];

          return (
            <div
              key={regionName}
              className={`rounded-xl border p-3 shadow-2xs transition-all ${stylePalette.bg} ${stylePalette.border}`}
            >
              <div className="flex items-center justify-between border-b pb-1.5 mb-2 border-slate-200/60">
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg shadow-3xs ${stylePalette.badge}`}>
                    📍 {regionName} 区域
                  </span>
                </div>

                <span className="text-[11px] font-bold text-slate-600">
                  {regionStaffList.length} 人
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {regionStaffList.map(staff => (
                  <PersonCard
                    key={staff.id}
                    staff={staff}
                    canEdit={true}
                    colorMode={colorMode}
                    slotSchedule={schedule.slotAssignments[staff.id]}
                    onClickCard={onClickStaffCard}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {assignedListStaff.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">暂无人员分配在名单方向</p>
            <p className="text-[10px] text-slate-400 mt-0.5">请在整体看板中将人员拖拽至【名单】卡片</p>
          </div>
        )}
      </div>

    </div>
  );
};
