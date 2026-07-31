import React, { useState } from 'react';
import { AuthUser, DailySchedule, Direction, Staff } from '../types';
import { PersonCard } from './PersonCard';
import { canEditStaff } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Users, Award, MapPin } from 'lucide-react';

interface GroupViewProps {
  schedule: DailySchedule;
  staffList: Staff[];
  directions: Direction[];
  authUser: AuthUser;
  showExperienceColor: boolean;
  onMoveStaff: (staffId: string, targetDirectionId: string) => void;
  onClickStaffCard: (staff: Staff) => void;
}

export const GroupView: React.FC<GroupViewProps> = ({
  schedule,
  staffList,
  directions,
  authUser,
  showExperienceColor,
  onMoveStaff,
  onClickStaffCard
}) => {
  const groups = Array.from(new Set(staffList.map((s) => s.groupId))).sort();
  const [activeGroup, setActiveGroup] = useState<string>(groups[0] || '1组');

  // 过滤出当前选中小组的人员
  const groupStaffList = staffList.filter((s) => s.groupId === activeGroup);

  // 根据方向分类过滤属于当前小组的人员 (队长置顶)
  const getGroupStaffForDirection = (dirId: string): Staff[] => {
    const assignedIds = Object.entries(schedule.assignments)
      .filter(([_, dId]) => dId === dirId)
      .map(([sId, _]) => sId);

    const dirStaff = groupStaffList.filter((s) => assignedIds.includes(s.id));
    const dir = directions.find((d) => d.id === dirId);

    return sortStaffWithCaptain(dirStaff, dir?.captainId);
  };

  return (
    <div id="group-view-export" className="space-y-3">
      {/* 顶部小组切换控制器 (1组 | 2组 | 3组...) */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap px-1 flex items-center">
          <Users className="w-4 h-4 mr-1 text-indigo-600" />
          切换小组看板:
        </span>
        {groups.map((g) => {
          const isSelected = g === activeGroup;
          const count = staffList.filter((s) => s.groupId === g).length;
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
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

      {/* 按 场景、厅堂、名单、自拓... 卡片维度展现当前小组的人员安排 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {directions.map((dir) => {
          const assignedStaff = getGroupStaffForDirection(dir.id);
          const captain = staffList.find((s) => s.id === dir.captainId && s.groupId === activeGroup);

          return (
            <div
              key={dir.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Header of Direction Card */}
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

                <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                  {activeGroup}: {assignedStaff.length}人
                </span>
              </div>

              {/* 队长说明 (若队长在本组) */}
              {captain && (
                <div className="px-3 py-1 bg-amber-50/80 text-[11px] text-amber-800 flex items-center border-b border-amber-100">
                  <Award className="w-3.5 h-3.5 text-amber-600 mr-1 flex-shrink-0" />
                  <span className="font-medium truncate">本组队长: {captain.name}</span>
                </div>
              )}

              {/* 卡片人员容器 */}
              <div className="p-2 flex-1 min-h-[80px] space-y-2 bg-slate-50/50">
                {assignedStaff.map((staff) => {
                  const canEdit = canEditStaff(authUser, staff);
                  return (
                    <PersonCard
                      key={staff.id}
                      staff={staff}
                      isCaptain={dir.captainId === staff.id}
                      canEdit={canEdit}
                      showExperienceColor={showExperienceColor}
                      slotSchedule={schedule.slotAssignments[staff.id]}
                      onClickCard={onClickStaffCard}
                    />
                  );
                })}

                {assignedStaff.length === 0 && (
                  <div className="h-14 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    {activeGroup} 暂无人安排在此方向
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
