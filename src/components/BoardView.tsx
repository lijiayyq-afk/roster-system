import React, { useEffect, useState } from 'react';
import Sortable from 'sortablejs';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, Staff } from '../types';
import { PersonCard } from './PersonCard';
import { canEditStaff } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Award, Compass, MapPin, Users, HelpCircle, Search, Filter } from 'lucide-react';

interface BoardViewProps {
  isDefaultBoardView: boolean;
  schedule: DailySchedule;
  staffList: Staff[];
  directions: Direction[];
  authUser: AuthUser;
  colorMode: ColorHighlightMode;
  onMoveStaff: (staffId: string, targetDirectionId: string) => void;
  onClickStaffCard: (staff: Staff) => void;
  onUpdateSelfExploreArea: (pairId: string, area: string) => void;
  onSwitchToSpecificView?: (view: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  isDefaultBoardView,
  schedule,
  staffList,
  directions,
  authUser,
  colorMode,
  onMoveStaff,
  onClickStaffCard,
  onUpdateSelfExploreArea,
  onSwitchToSpecificView
}) => {
  // 待排班全员库内部搜索与过滤
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');

  useEffect(() => {
    const containers = document.querySelectorAll('.drag-container');
    const sortables: Sortable[] = [];

    containers.forEach((container) => {
      const s = new Sortable(container as HTMLElement, {
        group: 'roster-board',
        animation: 150,
        touchStartThreshold: 3,
        ghostClass: 'opacity-40',
        onEnd: (evt) => {
          const { item, from, to, oldIndex } = evt;
          const staffId = item.getAttribute('data-id');
          const targetDirId = to.getAttribute('data-direction-id');

          if (from !== to && from && item) {
            if (oldIndex !== undefined && from.children[oldIndex]) {
              from.insertBefore(item, from.children[oldIndex]);
            } else {
              from.appendChild(item);
            }
          }

          if (staffId && targetDirId) {
            const staff = staffList.find((s) => s.id === staffId);
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

  // 所有未排班人员
  const unassignedRawList = staffList.filter((s) => !schedule.assignments[s.id]);

  // 根据搜索与组过滤出的全员库人员
  const filteredUnassignedList = unassignedRawList.filter((s) => {
    const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = filterGroup === 'all' || s.groupId === filterGroup;
    return matchName && matchGroup;
  });

  const allGroupNames = Array.from(new Set(staffList.map((s) => s.groupId))).sort();

  const getStaffForDirection = (dirId: string): Staff[] => {
    const assignedIds = Object.entries(schedule.assignments)
      .filter(([_, dId]) => dId === dirId)
      .map(([sId, _]) => sId);

    const dirStaff = staffList.filter((s) => assignedIds.includes(s.id));
    const dir = directions.find((d) => d.id === dirId);

    return sortStaffWithCaptain(dirStaff, dir?.captainId);
  };

  let displayDirections = [...directions];

  if (isDefaultBoardView) {
    const scenes = directions.filter((d) => d.category === 'scene');
    const branches = directions.filter((d) => d.category === 'branch');
    const listDirs = directions.filter((d) => d.category === 'list');
    const exploreDirs = directions.filter((d) => d.category === 'self_explore');
    const vacationDirs = directions.filter((d) => d.category === 'vacation');
    const exitDirs = directions.filter((d) => d.category === 'pending_exit');

    displayDirections = [
      ...scenes,
      ...(branches.length > 0 ? [branches[0]] : []),
      ...listDirs,
      ...exploreDirs,
      ...vacationDirs,
      ...exitDirs,
    ];
  }

  return (
    <div id="board-view-export" className="flex flex-col lg:flex-row gap-3 items-start">
      
      {/* 左侧/顶部【待排班全员人员库】面板 (含搜姓名+选组过滤) */}
      <div className="w-full lg:w-72 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
        <div className="px-3 py-2.5 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-bold text-xs">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>待排班全员库</span>
          </div>
          <span className="text-[11px] bg-slate-700 text-slate-200 font-mono font-bold px-2 py-0.5 rounded-full">
            {unassignedRawList.length} 人待定
          </span>
        </div>

        {/* 搜姓名与过滤工具栏 */}
        <div className="p-2 bg-slate-100/90 border-b border-slate-200 space-y-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="快速搜索人员姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium flex items-center">
              <Filter className="w-3 h-3 mr-1 text-slate-400" /> 组别筛选:
            </span>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="text-[11px] p-1 bg-white border border-slate-300 rounded-md focus:outline-none font-semibold text-slate-700"
            >
              <option value="all">全部组 ({staffList.length}人)</option>
              {allGroupNames.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 待排班人员容器 */}
        <div
          data-direction-id=""
          className="drag-container p-2 max-h-56 lg:max-h-[72vh] overflow-y-auto flex flex-wrap content-start gap-1.5 bg-slate-50/50 min-h-[90px]"
        >
          {filteredUnassignedList.map((staff) => {
            const canEdit = canEditStaff(authUser, staff);
            return (
              <PersonCard
                key={staff.id}
                staff={staff}
                canEdit={canEdit}
                colorMode={colorMode}
                slotSchedule={schedule.slotAssignments[staff.id]}
                onClickCard={onClickStaffCard}
              />
            );
          })}

          {filteredUnassignedList.length === 0 && (
            <div className="w-full h-16 flex items-center justify-center text-slate-400 text-xs text-center border border-dashed border-slate-200 rounded-lg">
              {unassignedRawList.length === 0 ? '全员已完成排班安排 🎉' : '未搜到匹配人员'}
            </div>
          )}
        </div>
      </div>

      {/* 右侧【各场景/方向看板网格】 */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
        {displayDirections.map((dir) => {
          const isAggregateBranch = isDefaultBoardView && dir.category === 'branch';

          let assignedStaff: Staff[] = [];
          if (isAggregateBranch) {
            const branchIds = directions.filter((d) => d.category === 'branch').map((d) => d.id);
            const assignedIds = Object.entries(schedule.assignments)
              .filter(([_, dId]) => branchIds.includes(dId))
              .map(([sId, _]) => sId);
            assignedStaff = staffList.filter((s) => assignedIds.includes(s.id));
          } else {
            assignedStaff = getStaffForDirection(dir.id);
          }

          const captain = staffList.find((s) => s.id === dir.captainId);

          return (
            <div
              key={dir.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-[140px]"
            >
              {/* 方向 Header */}
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
                  <h3 className="font-bold text-sm text-slate-800 truncate max-w-[170px]">
                    {isAggregateBranch ? '厅堂 (各支行网点)' : dir.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    {assignedStaff.length}人
                  </span>
                  {isAggregateBranch && onSwitchToSpecificView && (
                    <button
                      onClick={() => onSwitchToSpecificView('branch')}
                      className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold hover:bg-indigo-200"
                    >
                      明细&gt;
                    </button>
                  )}
                </div>
              </div>

              {/* 队长信息 */}
              {captain && !isAggregateBranch && (
                <div className="px-3 py-1 bg-amber-50/80 text-[11px] text-amber-800 flex items-center border-b border-amber-100">
                  <Award className="w-3.5 h-3.5 text-amber-600 mr-1 flex-shrink-0" />
                  <span className="font-medium truncate">队长: {captain.name} ({captain.groupId})</span>
                </div>
              )}

              {/* 场景人员 Drop 容器 (超紧凑流动网格) */}
              <div
                data-direction-id={dir.id}
                className="drag-container p-2 flex-1 min-h-[80px] flex flex-wrap content-start gap-1.5 bg-slate-50/50"
              >
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
                  <div className="w-full h-14 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    拖拽或点击指派人员至此
                  </div>
                )}
              </div>

              {/* 自拓方向专属面板 */}
              {dir.category === 'self_explore' && (
                <div className="p-2 bg-purple-50/60 border-t border-purple-100">
                  <div className="text-[11px] font-bold text-purple-900 flex items-center mb-1">
                    <Compass className="w-3.5 h-3.5 mr-1 text-purple-600" />
                    自拓搭档 & 规划区域
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

    </div>
  );
};
