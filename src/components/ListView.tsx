import React from 'react';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, Staff } from '../types';
import { canEditStaff } from '../models/PermissionModel';
import { FileText, MapPin, Award, Lock, Clock } from 'lucide-react';

interface ListViewProps {
  schedule: DailySchedule;
  staffList: Staff[];
  directions: Direction[];
  authUser: AuthUser;
  colorMode: ColorHighlightMode;
  onClickStaffCard: (staff: Staff) => void;
}

// 区域淡色调色板 (Soft Muted Pastels)
const REGION_COLOR_MAP: Record<string, { bg: string; border: string; text: string; tag: string }> = {
  '昆山': { bg: 'bg-sky-50/90', border: 'border-sky-200', text: 'text-sky-900', tag: 'bg-sky-200/80 text-sky-800' },
  '常熟': { bg: 'bg-emerald-50/90', border: 'border-emerald-200', text: 'text-emerald-900', tag: 'bg-emerald-200/80 text-emerald-800' },
  '太仓': { bg: 'bg-purple-50/90', border: 'border-purple-200', text: 'text-purple-900', tag: 'bg-purple-200/80 text-purple-800' },
  '工业园区': { bg: 'bg-amber-50/90', border: 'border-amber-200', text: 'text-amber-900', tag: 'bg-amber-200/80 text-amber-800' },
  '姑苏区': { bg: 'bg-rose-50/90', border: 'border-rose-200', text: 'text-rose-900', tag: 'bg-rose-200/80 text-rose-800' },
};

const DEFAULT_REGION_COLOR = { bg: 'bg-slate-50/90', border: 'border-slate-200', text: 'text-slate-900', tag: 'bg-slate-200 text-slate-700' };

export const ListView: React.FC<ListViewProps> = ({
  schedule,
  staffList,
  directions,
  authUser,
  colorMode,
  onClickStaffCard
}) => {
  // 查找名单方向
  const listDir = directions.find((d) => d.category === 'list');
  const listDirId = listDir?.id || '';

  // 过滤出分配到名单方向的人员
  const assignedIds = Object.entries(schedule.assignments)
    .filter(([_, dId]) => dId === listDirId)
    .map(([sId, _]) => sId);

  const listStaffList = staffList.filter((s) => assignedIds.includes(s.id));

  // 按区域 (region) 分组
  const regionMap: Record<string, Staff[]> = {};
  listStaffList.forEach((s) => {
    const reg = s.region || '未归类区域';
    if (!regionMap[reg]) regionMap[reg] = [];
    regionMap[reg].push(s);
  });

  const regionNames = Object.keys(regionMap).sort();

  return (
    <div id="list-view-export" className="space-y-4">
      {/* 头部说明 */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900">线上名单收件视角 (按区域色彩区分与排序)</h4>
            <p className="text-[10px] text-emerald-700">自动按区域分组排序，淡柔主题色标识人员区域走势</p>
          </div>
        </div>

        <span className="text-xs font-bold bg-emerald-200/80 text-emerald-900 px-2.5 py-1 rounded-full">
          名单总人数: {listStaffList.length}人
        </span>
      </div>

      {/* 按区域展示的卡片网格 */}
      {regionNames.map((regionName) => {
        const regionStaffs = regionMap[regionName];
        const colors = REGION_COLOR_MAP[regionName] || DEFAULT_REGION_COLOR;

        return (
          <div
            key={regionName}
            className={`rounded-xl border ${colors.border} ${colors.bg} p-3 shadow-xs space-y-2`}
          >
            {/* 区域 Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className={`font-bold text-sm ${colors.text}`}>
                  {regionName} 区域名单人员
                </h3>
              </div>

              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.tag}`}>
                {regionStaffs.length}人
              </span>
            </div>

            {/* 区域内人员卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {regionStaffs.map((staff) => {
                const canEdit = canEditStaff(authUser, staff);
                const isCaptain = listDir?.captainId === staff.id;
                const slotSchedule = schedule.slotAssignments[staff.id];
                const hasSlots = slotSchedule && (slotSchedule.morning || slotSchedule.afternoon || slotSchedule.evening);

                return (
                  <div
                    key={staff.id}
                    onClick={() => onClickStaffCard(staff)}
                    className={`relative p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs transition hover:border-emerald-400 cursor-pointer ${
                      !canEdit ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''
                    } ${isCaptain ? 'ring-2 ring-amber-400 border-amber-400 font-medium' : ''}`}
                  >
                    {isCaptain && (
                      <div className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center shadow-xs">
                        <Award className="w-2.5 h-2.5 mr-0.5" />
                        <span>队长</span>
                      </div>
                    )}

                    {!canEdit && (
                      <div className="absolute top-1.5 right-1.5 text-slate-400" title="非本组人员，仅可查看">
                        <Lock className="w-3 h-3" />
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs md:text-sm text-slate-800">{staff.name}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded">
                          {staff.groupId}
                        </span>
                      </div>

                      {/* 区域标签 */}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${colors.tag}`}>
                        📍 {staff.region}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>经验: {staff.experience === 'expert' ? '高手' : staff.experience === 'novice' ? '新手' : '一般人'}</span>
                    </div>

                    {hasSlots && (
                      <div className="mt-1 pt-0.5 border-t border-slate-100 flex items-center space-x-1 text-[9px] text-indigo-600 font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        <span>精细时段</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {regionNames.length === 0 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
          暂无人员分配在线上名单收件方向
        </div>
      )}
    </div>
  );
};
