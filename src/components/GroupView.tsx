import React, { useState } from 'react';
import { DailySchedule, Direction, Staff } from '../types';
import { Users, MapPin, Award } from 'lucide-react';

interface GroupViewProps {
  schedule: DailySchedule;
  staffList: Staff[];
  directions: Direction[];
}

export const GroupView: React.FC<GroupViewProps> = ({ schedule, staffList, directions }) => {
  const dirMap = new Map(directions.map((d) => [d.id, d]));
  const groups = Array.from(new Set(staffList.map((s) => s.groupId))).sort();

  const [activeGroup, setActiveGroup] = useState<string>(groups[0] || '1组');

  const groupStaff = staffList.filter((s) => s.groupId === activeGroup);

  return (
    <div id="group-view-export" className="space-y-3">
      {/* 小组切换控制器 (Tab 栏，避免挤在一个页面) */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap px-1">选择小组:</span>
        {groups.map((g) => {
          const isSelected = g === activeGroup;
          const count = staffList.filter(s => s.groupId === g).length;
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
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'}`}>
                {count}人
              </span>
            </button>
          );
        })}
      </div>

      {/* 单个小组的精细展示 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-base">
            <Users className="w-5 h-5 text-indigo-300" />
            <span>{activeGroup} 成员作业明细</span>
          </div>
          <span className="text-xs bg-indigo-600/80 px-2.5 py-1 rounded-full font-mono font-semibold">
            全组共 {groupStaff.length} 人
          </span>
        </div>

        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {groupStaff.map((staff) => {
            const assignedDirId = schedule.assignments[staff.id];
            const dir = assignedDirId ? dirMap.get(assignedDirId) : null;
            const isCaptain = dir?.captainId === staff.id;
            const slotSchedule = schedule.slotAssignments[staff.id];
            const hasSlots = slotSchedule && (slotSchedule.morning || slotSchedule.afternoon || slotSchedule.evening);

            return (
              <div
                key={staff.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col justify-between space-y-2 hover:border-indigo-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-800">{staff.name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                      {staff.region}
                    </span>
                  </div>

                  {isCaptain && (
                    <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full flex items-center shadow-sm">
                      <Award className="w-3 h-3 mr-0.5" /> 队长
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-xs text-slate-500">
                    经验: {staff.experience === 'expert' ? '高手' : staff.experience === 'novice' ? '新手' : '一般人'}
                  </span>

                  <div>
                    {dir ? (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        <span>{dir.name}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">未排班</span>
                    )}
                  </div>
                </div>

                {hasSlots && (
                  <div className="text-[10px] bg-indigo-50/70 p-1.5 rounded text-indigo-800 space-y-0.5 border border-indigo-100">
                    <div>上午: {slotSchedule.morning ? dirMap.get(slotSchedule.morning)?.name : dir?.name || '未设'}</div>
                    <div>下午: {slotSchedule.afternoon ? dirMap.get(slotSchedule.afternoon)?.name : dir?.name || '未设'}</div>
                    <div>晚上: {slotSchedule.evening ? dirMap.get(slotSchedule.evening)?.name : dir?.name || '未设'}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
