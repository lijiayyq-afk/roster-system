import React, { useState } from 'react';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, ExecutionStatus, Staff, TimeSlot } from '../types';
import { PersonCard } from './PersonCard';
import { canEditStaff } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Users, Award, Clock, CheckCircle2, XCircle, HelpCircle, Layers, CheckCheck } from 'lucide-react';

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
  
  // 小组内维度模式: 'by_direction' (按场景方向) vs 'by_timeslot' (按时段核查执行)
  const [subViewMode, setSubViewMode] = useState<'by_direction' | 'by_timeslot'>('by_direction');

  const dirMap = new Map(directions.map((d) => [d.id, d]));
  const groupStaffList = staffList.filter((s) => s.groupId === activeGroup);

  const getGroupStaffForDirection = (dirId: string): Staff[] => {
    const assignedIds = Object.entries(schedule.assignments)
      .filter(([_, dId]) => dId === dirId)
      .map(([sId, _]) => sId);

    const dirStaff = groupStaffList.filter((s) => assignedIds.includes(s.id));
    const dir = directions.find((d) => d.id === dirId);

    return sortStaffWithCaptain(dirStaff, dir?.captainId);
  };

  // 时段定义
  const timeSlots: { key: TimeSlot; label: string; time: string; color: string }[] = [
    { key: 'morning', label: '上午段', time: '08:30 - 12:00', color: 'border-sky-300 bg-sky-50/50' },
    { key: 'afternoon', label: '下午段', time: '13:30 - 17:30', color: 'border-amber-300 bg-amber-50/50' },
    { key: 'evening', label: '晚上段', time: '18:00 - 21:00', color: 'border-purple-300 bg-purple-50/50' },
  ];

  // 获取某人员某时段的履约状态
  const getExecStatus = (staffId: string, slot: TimeSlot): ExecutionStatus => {
    const key = `${staffId}_${slot}`;
    return schedule.executionRecords?.[key] || 'pending';
  };

  return (
    <div id="group-view-export" className="space-y-3">
      {/* 小组与子视图控制双栏 */}
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

        {/* 维度模式切换: by场景方向 vs by时段履约核查 */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto justify-end">
          <button
            onClick={() => setSubViewMode('by_direction')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition ${
              subViewMode === 'by_direction'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>by 场景/方向</span>
          </button>

          <button
            onClick={() => setSubViewMode('by_timeslot')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 transition ${
              subViewMode === 'by_timeslot'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>by 时段核查 (按计划执行率)</span>
          </button>
        </div>

      </div>

      {/* 模式 1: by 场景/方向 */}
      {subViewMode === 'by_direction' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {directions.map((dir) => {
            const assignedStaff = getGroupStaffForDirection(dir.id);
            const captain = staffList.find((s) => s.id === dir.captainId && s.groupId === activeGroup);

            return (
              <div
                key={dir.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col"
              >
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

                {captain && (
                  <div className="px-3 py-1 bg-amber-50/80 text-[11px] text-amber-800 flex items-center border-b border-amber-100">
                    <Award className="w-3.5 h-3.5 text-amber-600 mr-1 flex-shrink-0" />
                    <span className="font-medium truncate">本组队长: {captain.name}</span>
                  </div>
                )}

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
                      {activeGroup} 暂无人安排在此方向
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 模式 2: by 时段核查 (对应时段判断是否按计划执行了) */}
      {subViewMode === 'by_timeslot' && (
        <div className="space-y-4">
          <div className="p-3 bg-indigo-900 text-white rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold flex items-center">
                <CheckCheck className="w-4 h-4 mr-1 text-emerald-400" />
                {activeGroup} 时段作业履约核查仪表盘
              </h4>
              <p className="text-xs text-indigo-200 mt-0.5">
                点击员工右侧状态标记，实时核对各时段是否按原定排班计划落实到位
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-700">
              <span className="flex items-center text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 已按计划到位
              </span>
              <span className="flex items-center text-rose-300 font-medium">
                <XCircle className="w-3.5 h-3.5 mr-1" /> 未到位/异常
              </span>
              <span className="flex items-center text-slate-300 font-medium">
                <HelpCircle className="w-3.5 h-3.5 mr-1" /> 待核实
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {timeSlots.map((slot) => {
              // 计算该时段的已到位人数
              const onTrackCount = groupStaffList.filter(
                (s) => getExecStatus(s.id, slot.key) === 'on_track'
              ).length;
              const offTrackCount = groupStaffList.filter(
                (s) => getExecStatus(s.id, slot.key) === 'off_track'
              ).length;

              const totalCount = groupStaffList.length;
              const rate = totalCount > 0 ? Math.round((onTrackCount / totalCount) * 100) : 0;

              return (
                <div
                  key={slot.key}
                  className={`bg-white rounded-xl border ${slot.color} shadow-sm overflow-hidden flex flex-col`}
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-indigo-600" />
                        {slot.label}
                      </h4>
                      <p className="text-[11px] text-slate-500">{slot.time}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        履约率: {rate}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 divide-y divide-slate-100 flex-1 space-y-2">
                    {groupStaffList.map((staff) => {
                      // 查找该人员在该时段计划的方向场景
                      const customSlotDirId = schedule.slotAssignments[staff.id]?.[slot.key];
                      const mainDirId = schedule.assignments[staff.id];
                      const targetDirId = customSlotDirId || mainDirId;
                      const targetDir = targetDirId ? dirMap.get(targetDirId) : null;

                      const status = getExecStatus(staff.id, slot.key);

                      return (
                        <div
                          key={staff.id}
                          className="pt-2 first:pt-0 flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-xs text-slate-800">{staff.name}</span>
                              <span className="text-[9px] text-slate-400">{staff.region}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 flex items-center">
                              计划: {targetDir ? (
                                <span className="font-semibold text-indigo-700 ml-1">{targetDir.name}</span>
                              ) : (
                                <span className="text-slate-400 ml-1">未安排</span>
                              )}
                            </p>
                          </div>

                          {/* 履约状态核查切换工具 */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => onToggleExecutionStatus && onToggleExecutionStatus(staff.id, slot.key, 'on_track')}
                              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center ${
                                status === 'on_track'
                                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                  : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700'
                              }`}
                              title="标记为: 已按计划到位"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onToggleExecutionStatus && onToggleExecutionStatus(staff.id, slot.key, 'off_track')}
                              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center ${
                                status === 'off_track'
                                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                                  : 'bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-700'
                              }`}
                              title="标记为: 未到位/执行异常"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onToggleExecutionStatus && onToggleExecutionStatus(staff.id, slot.key, 'pending')}
                              className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center ${
                                status === 'pending'
                                  ? 'bg-slate-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                              title="标记为: 待核实"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {groupStaffList.length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-400">
                        该小组暂无人员
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
