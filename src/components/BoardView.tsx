import React, { useEffect, useState } from 'react';
import Sortable from 'sortablejs';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, Staff } from '../types';
import { PersonCard } from './PersonCard';
import { canEditStaff, filterStaffByAuthUser } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Compass, MapPin, Users, Search, Filter, GripVertical, CheckCircle2 } from 'lucide-react';

interface BoardViewProps {
  isDefaultBoardView: boolean;
  schedule: DailySchedule;
  staffList: Staff[];
  directions: Direction[];
  authUser: AuthUser;
  colorMode: ColorHighlightMode;
  isEditMode: boolean;
  onMoveStaff: (staffId: string, targetDirectionId: string) => void;
  onClickStaffCard: (staff: Staff) => void;
  onUpdateSelfExploreArea: (pairId: string, area: string) => void;
  onSwitchToSpecificView?: (view: string) => void;
  onReorderDirections?: (newOrderedDirections: Direction[]) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  isDefaultBoardView,
  schedule,
  staffList,
  directions,
  authUser,
  colorMode,
  isEditMode,
  onMoveStaff,
  onClickStaffCard,
  onUpdateSelfExploreArea,
  onSwitchToSpecificView,
  onReorderDirections
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const isLeaderRole = authUser.role === 'leader' && !!authUser.groupId;
  const [filterGroup, setFilterGroup] = useState<string>(isLeaderRole ? (authUser.groupId || 'all') : 'all');

  const cleanGroupLabel = (g: string) => g.replace(/组$/, '');

  // 1. 核心权限过滤：如果为组长，可见人员纯净化为仅本组人员！
  const visibleStaffList = filterStaffByAuthUser(staffList, authUser);

  useEffect(() => {
    if (isLeaderRole && authUser.groupId) {
      setFilterGroup(authUser.groupId);
    } else {
      setFilterGroup('all');
    }
  }, [authUser]);

  useEffect(() => {
    if (!isEditMode) return;

    const personContainers = document.querySelectorAll('.drag-container');
    const personSortables: Sortable[] = [];

    personContainers.forEach((container) => {
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
              alert(`无权修改非本组成员的排班安排`);
            }
          }
        },
      });
      personSortables.push(s);
    });

    const sceneGrid = document.querySelector('.scene-grid-container');
    let sceneSortable: Sortable | null = null;
    if (sceneGrid && onReorderDirections) {
      sceneSortable = new Sortable(sceneGrid as HTMLElement, {
        handle: '.scene-header-handle',
        animation: 200,
        ghostClass: 'opacity-50',
        onEnd: () => {
          const cardNodes = Array.from(sceneGrid.children);
          const newOrderedIds = cardNodes.map(node => node.getAttribute('data-scene-id')).filter(Boolean) as string[];
          
          const reordered: Direction[] = [];
          newOrderedIds.forEach(id => {
            const found = directions.find(d => d.id === id);
            if (found) reordered.push(found);
          });

          directions.forEach(d => {
            if (!newOrderedIds.includes(d.id)) {
              reordered.push(d);
            }
          });

          onReorderDirections(reordered);
        }
      });
    }

    return () => {
      personSortables.forEach((s) => s.destroy());
      if (sceneSortable) sceneSortable.destroy();
    };
  }, [directions, schedule, authUser, staffList, onReorderDirections, isEditMode]);

  // 所有未分配人员 (完全基于 visibleStaffList)
  const unassignedRawList = visibleStaffList.filter((s) => !schedule.assignments[s.id] && !s.isExited);

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

    // 人员只取 visibleStaffList，实现卡片内部的人员纯净过滤
    const dirStaff = visibleStaffList.filter((s) => assignedIds.includes(s.id) && !s.isExited);
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

    const sortedScenes = [...scenes].sort((a, b) => {
      const countA = getStaffForDirection(a.id).length;
      const countB = getStaffForDirection(b.id).length;
      return countB - countA;
    });

    displayDirections = [
      ...sortedScenes,
      ...(branches.length > 0 ? [branches[0]] : []),
      ...listDirs,
      ...exploreDirs,
      ...vacationDirs,
      ...exitDirs,
    ];
  }

  const isAllAssigned = filteredUnassignedList.length === 0;

  return (
    <div id="board-view-export" className="flex flex-col lg:flex-row gap-3 items-start">
      
      {/* 左侧【待排班全员人员库】面板 (组长身份时只展示本组人) */}
      <div className={`w-full lg:w-72 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0 transition-all ${
        isAllAssigned ? 'py-0' : ''
      }`}>
        <div className="px-3 py-2 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-bold text-xs">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {isLeaderRole ? `${cleanGroupLabel(authUser.groupId || '')} 组待排库` : '待排班全员库'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full ${
              isAllAssigned ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
            }`}>
              {isAllAssigned ? '本组已完成排班' : `${filteredUnassignedList.length} 人待定`}
            </span>
          </div>
        </div>

        {/* 当组内/全员完成排班时缩写为精简一行 */}
        {isAllAssigned ? (
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isLeaderRole ? `${cleanGroupLabel(authUser.groupId || '')} 组员已全员到位` : '全员已完成排班规划'}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-mono">
              共 {visibleStaffList.filter(s => !s.isExited).length} 人已就位
            </span>
          </div>
        ) : (
          <>
            {/* 搜姓名与组筛选 */}
            <div className="p-1.5 bg-slate-100/90 border-b border-slate-200 space-y-1">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
                <input
                  type="text"
                  placeholder="搜索人员姓名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-0.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              {!isLeaderRole && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium flex items-center">
                    <Filter className="w-3 h-3 mr-1 text-slate-400" /> 筛选:
                  </span>
                  <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="p-0.5 bg-white border border-slate-300 rounded focus:outline-none font-semibold text-slate-700 text-[11px]"
                  >
                    <option value="all">全部组 ({unassignedRawList.length}人)</option>
                    {allGroupNames.map((g) => (
                      <option key={g} value={g}>{cleanGroupLabel(g)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 待排班人员容器 */}
            <div
              data-direction-id=""
              className="drag-container p-2 max-h-52 lg:max-h-[68vh] overflow-y-auto flex flex-wrap content-start gap-1.5 bg-slate-50/50 min-h-[60px]"
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
            </div>
          </>
        )}
      </div>

      {/* 右侧【各场景/方向看板网格】 */}
      <div className="scene-grid-container flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 w-full">
        {displayDirections.map((dir) => {
          const isAggregateBranch = isDefaultBoardView && dir.category === 'branch';

          let assignedStaff: Staff[] = [];
          if (isAggregateBranch) {
            const branchIds = directions.filter((d) => d.category === 'branch').map((d) => d.id);
            const assignedIds = Object.entries(schedule.assignments)
              .filter(([_, dId]) => branchIds.includes(dId))
              .map(([sId, _]) => sId);
            assignedStaff = visibleStaffList.filter((s) => assignedIds.includes(s.id) && !s.isExited);
          } else {
            assignedStaff = getStaffForDirection(dir.id);
          }

          return (
            <div
              key={dir.id}
              data-scene-id={dir.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-[120px]"
            >
              {/* 场景 Header */}
              <div className="px-2.5 py-1.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  {isEditMode && (
                    <span className="scene-header-handle cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-slate-600" title="拖拽调整场景位置">
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                  )}

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
                  <h3 className="font-bold text-xs text-slate-800 truncate max-w-[150px]">
                    {isAggregateBranch ? '厅堂 (各支行网点)' : dir.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-[11px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded-full">
                    {assignedStaff.length}人
                  </span>
                  {isAggregateBranch && onSwitchToSpecificView && (
                    <button
                      onClick={() => onSwitchToSpecificView('branch')}
                      className="text-[10px] bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-semibold hover:bg-indigo-200"
                    >
                      明细&gt;
                    </button>
                  )}
                </div>
              </div>

              {/* 场景人员 Drop 容器 */}
              <div
                data-direction-id={dir.id}
                className="drag-container p-2 flex-1 min-h-[60px] flex flex-wrap content-start gap-1 bg-slate-50/50"
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
                  <div className="w-full h-10 flex items-center justify-center border border-dashed border-slate-200 rounded text-slate-400 text-[11px]">
                    {isEditMode ? '拖拽或点击指派' : '暂无人安排'}
                  </div>
                )}
              </div>

              {/* 自拓方向专属面板 */}
              {dir.category === 'self_explore' && (
                <div className="p-1.5 bg-purple-50/60 border-t border-purple-100">
                  <div className="text-[10px] font-bold text-purple-900 flex items-center mb-1">
                    <Compass className="w-3 h-3 mr-1 text-purple-600" />
                    自拓搭档 & 规划区域
                  </div>
                  {schedule.selfExplorePairs.map((pair) => {
                    const pairStaff = visibleStaffList.filter((s) => pair.staffIds.includes(s.id));
                    return (
                      <div key={pair.id} className="p-1 bg-white rounded border border-purple-200 text-[11px] mb-1">
                        <div className="font-semibold text-purple-800 mb-0.5">
                          搭档: {pairStaff.map((s) => s.name).join(' + ') || '未选定'}
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <input
                            type="text"
                            value={pair.plannedArea}
                            onChange={(e) => onUpdateSelfExploreArea(pair.id, e.target.value)}
                            placeholder="填写规划区域..."
                            className="w-full text-[10px] p-0.5 border border-slate-200 rounded focus:outline-none focus:border-purple-500"
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
