import React from 'react';
import { DailySchedule, Direction, Staff } from '../types';
import { Users, MapPin } from 'lucide-react';

interface GroupViewProps {
  schedule: DailySchedule;
  staffList: Staff[];
  directions: Direction[];
}

export const GroupView: React.FC<GroupViewProps> = ({ schedule, staffList, directions }) => {
  const dirMap = new Map(directions.map((d) => [d.id, d]));
  const groups = Array.from(new Set(staffList.map((s) => s.groupId))).sort();

  return (
    <div id="group-view-export" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {groups.map((groupName) => {
        const groupStaff = staffList.filter((s) => s.groupId === groupName);

        return (
          <div key={groupName} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-3 py-2 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Users className="w-4 h-4 text-indigo-300" />
                <span>{groupName}</span>
              </div>
              <span className="text-xs bg-indigo-700 px-2 py-0.5 rounded-full font-mono">
                {groupStaff.length}人
              </span>
            </div>

            <div className="p-3 space-y-2">
              {groupStaff.map((staff) => {
                const assignedDirId = schedule.assignments[staff.id];
                const dir = assignedDirId ? dirMap.get(assignedDirId) : null;
                const isCaptain = dir?.captainId === staff.id;

                return (
                  <div
                    key={staff.id}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-800">{staff.name}</span>
                        <span className="text-[10px] text-slate-500">{staff.region}</span>
                        {isCaptain && (
                          <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded">
                            队长
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        经验: {staff.experience === 'expert' ? '高手' : staff.experience === 'novice' ? '新手' : '一般人'}
                      </p>
                    </div>

                    <div className="text-right">
                      {dir ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                          <MapPin className="w-3 h-3 text-indigo-500" />
                          <span>{dir.name}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">未排班</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
