import React, { useEffect } from 'react';
import Sortable from 'sortablejs';
import { AuthUser, DailySchedule, Direction, Staff } from '../types';
import { PersonCard } from './PersonCard';
import { canEditStaff } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Award, Compass, MapPin } from 'lucide-react';

interface BoardViewProps {
  schedule: DailySchedule;
  staffList: Staff[];
  directions: Direction[];
  authUser: AuthUser;
  showExperienceColor: boolean;
  onMoveStaff: (staffId: string, targetDirectionId: string) => void;
  onClickStaffCard: (staff: Staff) => void;
  onUpdateSelfExploreArea: (pairId: string, area: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  schedule,
  staffList,
  directions,
  authUser,
  showExperienceColor,
  onMoveStaff,
  onClickStaffCard,
  onUpdateSelfExploreArea
}) => {
  useEffect(() => {
    const containers = document.querySelectorAll('.drag-container');
    const sortables: Sortable[] = [];

    containers.forEach((container) => {
      const s = new Sortable(container as HTMLElement, {
        group: 'roster-board',
        animation: 150,
        touchStartThreshold: 5,
        ghostClass: 'opacity-40',
        onEnd: (evt) => {
          const { item, from, to, oldIndex } = evt;
          const staffId = item.getAttribute('data-id');
          const targetDirId = to.getAttribute('data-direction-id');

          // 关键修复：还原 SortableJS 改变的真实 DOM，交由 React 数据状态接管重绘，防止 React 虚拟 DOM removeChild/insertBefore 冲突引发白屏崩溃
          if (from !== to && from && item) {
            if (oldIndex !== undefined && from.children[oldIndex]) {
              from.insertBefore(item, from.children[oldIndex]);
            } else {
              from.appendChild(item);
            }
          }

          if (staffId && targetDirId) {
            // 权限检查
            const staff = staffList.find(s => s.id === staffId);
            if (staff && canEditStaff(authUser, staff)) {
              onMoveStaff(staffId, targetDirId);
            } else if (staff && !canEditStaff(authUser, staff)) {
              alert(`您作为 [${authUser.groupId}组长]，无权修改 [${staff.groupId}] 成员 [${staff.name}] 的排班安排`);
            }
          }
        },
      });
      sortables.push(s);
    });

    return () => {
      sortables.forEach((s) => s.destroy());
    };
  }, [directions, schedule, authUser, staffList]);

  const getStaffForDirection = (dirId: string): Staff[] => {
    const assignedIds = Object.entries(schedule.assignments)
      .filter(([_, dId]) => dId === dirId)
      .map(([sId, _]) => sId);

    const dirStaff = staffList.filter((s) => assignedIds.includes(s.id));
    const dir = directions.find((d) => d.id === dirId);

    return sortStaffWithCaptain(dirStaff, dir?.captainId);
  };

  return (
    <div id="board-view-export" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {directions.map((dir) => {
        const assignedStaff = getStaffForDirection(dir.id);
        const captain = staffList.find((s) => s.id === dir.captainId);

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

              <div className="flex items-center space-x-2">
                <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                  {assignedStaff.length}人
                </span>
              </div>
            </div>

            {captain && (
              <div className="px-3 py-1 bg-amber-50/80 text-[11px] text-amber-800 flex items-center border-b border-amber-100">
                <Award className="w-3.5 h-3.5 text-amber-600 mr-1 flex-shrink-0" />
                <span className="font-medium truncate">队长: {captain.name} ({captain.groupId})</span>
              </div>
            )}

            <div
              data-direction-id={dir.id}
              className="drag-container p-2 flex-1 min-h-[90px] space-y-2 bg-slate-50/50"
            >
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
                <div className="h-16 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                  拖拽人员至此处
                </div>
              )}
            </div>

            {dir.category === 'self_explore' && (
              <div className="p-2 bg-purple-50/60 border-t border-purple-100">
                <div className="text-[11px] font-bold text-purple-900 flex items-center mb-1">
                  <Compass className="w-3.5 h-3.5 mr-1 text-purple-600" />
                  自拓搭档 (1-2人) & 规划区域
                </div>
                {schedule.selfExplorePairs.map((pair) => {
                  const pairStaff = staffList.filter((s) => pair.staffIds.includes(s.id));
                  return (
                    <div key={pair.id} className="p-1.5 bg-white rounded border border-purple-200 text-xs mb-1">
                      <div className="font-semibold text-purple-800 mb-1">
                        搭档: {pairStaff.map((s) => s.name).join(' + ') || '未选定'}
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <input
                          type="text"
                          value={pair.plannedArea}
                          onChange={(e) => onUpdateSelfExploreArea(pair.id, e.target.value)}
                          placeholder="填写自定义规划区域..."
                          className="w-full text-[11px] p-1 border border-slate-200 rounded focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
