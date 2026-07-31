import React, { useState } from 'react';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, ExecutionStatus, Staff, TimeSlot } from '../types';
import { PersonCard } from './PersonCard';
import { canEditStaff } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Users, Award, Clock, Sun, Sunrise, Sunset, Moon } from 'lucide-react';

interface GroupViewProps {
  schedule: DailySchedule;
  staffList: Staff[];
  directions: Direction[];
  authUser: AuthUser;
  colorMode: ColorHighlightMode;
  onMoveStaff: (staffId: string, targetDirectionId: string) => void;
  onClickStaffCard: (staff: Staff) => void;
  onToggleExecutionStatus?: (staffId: string, slot: TimeSlot, status: ExecutionStatus) => void;
}

export type TimeSlotTab = 'all' | 'morning' | 'afternoon' | 'evening';

export const GroupView: React.FC<GroupViewProps> = ({
  schedule,
  staffList,
  directions,
  authUser,
  colorMode,
  onMoveStaff,
  onClickStaffCard,
  onToggleExecutionStatus
}) => {
  const groups = Array.from(new Set(staffList.map((s) => s.groupId))).sort();
  const [activeGroup, setActiveGroup] = useState<string>(groups[0] || '1组');
  
  // 时段子视图: 'all'(全天主走向) | 'morning'(上午段) | 'afternoon'(下午段) | 'evening'(晚上段)
  const [activeSlot, setActiveSlot] = useState<TimeSlotTab>('all');

  const groupStaffList = staffList.filter((s) => s.groupId === activeGroup);

  // 根据当前选中的时段，获取某人员在该时段被排到的方向 ID
  const getStaffDirectionForSlot = (staffId: string): string => {
    const mainDirId = schedule.assignments[staffId] || '';
    const slots = schedule.slotAssignments[staffId];

    if (activeSlot === 'morning' && slots?.morning) return slots.morning;
    if (activeSlot === 'afternoon' && slots?.afternoon) return slots.afternoon;
    if (activeSlot === 'evening' && slots?.evening) return slots.evening;

    return mainDirId;
  };

  // 根据方向和选定时段，过滤出当前小组被排在此方向的人员 (队长置顶)
  const getGroupStaffForDirectionAndSlot = (dirId: string): Staff[] => {
    const dirStaff = groupStaffList.filter((s) => {
      const assignedDirId = getStaffDirectionForSlot(s.id);
      return assignedDirId === dirId;
    });

    const dir = directions.find((d) => d.id === dirId);

    return sortStaffWithCaptain(dirStaff, dir?.captainId);
  };

  const slotTabs: { id: TimeSlotTab; label: string; time: string; icon: React.ReactNode }[] = [
    { id: 'all', label: '全天主走向', time: '全天默认', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'morning', label: '上午段', time: '08:30-12:00', icon: <Sunrise className="w-3.5 h-3.5 text-sky-500" /> },
    { id: 'afternoon', label: '下午段', time: '13:30-17:30', icon: <Sunset className="w-3.5 h-3.5 text-amber-600" /> },
    { id: 'evening', label: '晚上段', time: '18:00-21:00', icon: <Moon className="w-3.5 h-3.5 text-purple-500" /> },
  ];

  return (
    <div id="group-view-export" className="space-y-3">
      {/* 顶部控制栏：小组切换 & 时段微调 Tab */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-2">
        
        {/* 小组切换 Tab */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap px-1 flex items-center">
            <Users className="w-4 h-4 mr-1 text-indigo-600" />
            目标小组:
          </span>
          {groups.map((g) => {
            const isSelected = g === activeGroup;
            const count = staffList.filter((s) => s.groupId === g).length;
            return (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{g}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}人
                </span>
              </button>
            );
          })}
        </div>

        {/* 时段切换 Tab (依然按场景展现，仅人员随着时段微调变化) */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto justify-end overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap px-1 hidden sm:flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            时段切面:
          </span>
          {slotTabs.map((tab) => {
            const isSelected = tab.id === activeSlot;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSlot(tab.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 按场景/方向卡片展示，卡片内人员随着选定的时段(上午/下午/晚上)动态变化 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {directions.map((dir) => {
          const assignedStaff = getGroupStaffForDirectionAndSlot(dir.id);
          const captain = staffList.find((s) => s.id === dir.captainId && s.groupId === activeGroup);

          return (
            <div
              key={dir.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col"
            >
              {/* 方向场景 Header */}
              <div className="px-3 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      dir.category === 'scene'
                        ? 'bg-blue-500'
                        : dir.category === 'branch'
                        ? 'bg-indigo-600'
                        : dir.category === 'list'
                        ? 'bg-emerald-500'
                        : dir.category === 'self_explore'
                        ? 'bg-purple-500'
                        : dir.category === 'vacation'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  ></span>
                  <h3 className="font-bold text-sm text-slate-800 truncate max-w-[180px]">
                    {dir.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    {assignedStaff.length}人
                  </span>
                </div>
              </div>

              {/* 本组队长信息 */}
              {captain && (
                <div className="px-3 py-1 bg-amber-50/80 text-[11px] text-amber-800 flex items-center border-b border-amber-100">
                  <Award className="w-3.5 h-3.5 text-amber-600 mr-1 flex-shrink-0" />
                  <span className="font-medium truncate">本组队长: {captain.name}</span>
                </div>
              )}

              {/* 该时段在此场景的人员容器 */}
              <div className="p-2 flex-1 min-h-[80px] space-y-2 bg-slate-50/50">
                {assignedStaff.map((staff) => {
                  const canEdit = canEditStaff(authUser, staff);
                  return (
                    <PersonCard
                      key={staff.id}
                      staff={staff}
                      isCaptain={dir.captainId === staff.id}
                      canEdit={canEdit}
                      colorMode={colorMode}
                      slotSchedule={schedule.slotAssignments[staff.id]}
                      onClickCard={onClickStaffCard}
                    />
                  );
                })}

                {assignedStaff.length === 0 && (
                  <div className="h-14 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    {activeSlot === 'all' ? '全天' : activeSlot === 'morning' ? '上午' : activeSlot === 'afternoon' ? '下午' : '晚上'}暂无人安排在此场景
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
