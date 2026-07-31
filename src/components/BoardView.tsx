import React, { useEffect, useState } from 'react';
import Sortable from 'sortablejs';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, Staff } from '../types';
import { PersonCard, formatGroupMinimal } from './PersonCard';
import { canEditStaff, filterStaffByAuthUser } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Compass, Users, Search, Filter, GripVertical, CheckCircle2, Pin, Trash2, ChevronDown, ChevronUp, Layers, FolderClosed, FolderOpen } from 'lucide-react';

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
  onTogglePinDirection?: (directionId: string) => void;
  onDeleteDirection?: (directionId: string) => void;
  activeSlot: TimeSlotTab;
}

export type TimeSlotTab = 'all' | 'morning' | 'afternoon' | 'evening';

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
  onReorderDirections,
  onTogglePinDirection,
  onDeleteDirection,
  activeSlot
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUnassignedScenesCollapsed, setIsUnassignedScenesCollapsed] = useState<boolean>(true);

  // 记录每个卡片的折叠状态 (Set 集合，放死的 sceneId 表示该场景已折叠)
  const [collapsedSceneIds, setCollapsedSceneIds] = useState<Set<string>>(new Set());

  const isLeaderRole = authUser.role === 'leader' && !!authUser.groupId;
  const [filterGroup, setFilterGroup] = useState<string>(isLeaderRole ? (authUser.groupId || 'all') : 'all');

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

    // 1. 人员拖拽
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

    // 2. 场景卡片拖拽排序
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

  const toggleSingleSceneFold = (sceneId: string) => {
    setCollapsedSceneIds((prev) => {
      const next = new Set(prev);
      if (next.has(sceneId)) {
        next.delete(sceneId);
      } else {
        next.add(sceneId);
      }
      return next;
    });
  };

  const toggleFoldAllScenes = () => {
    if (collapsedSceneIds.size === directions.length) {
      // 当前全部折叠，则全部展开
      setCollapsedSceneIds(new Set());
    } else {
      // 批量全部折叠
      setCollapsedSceneIds(new Set(directions.map((d) => d.id)));
    }
  };

  const getStaffDirectionForSlot = (staffId: string): string => {
    const mainDirId = schedule.assignments[staffId] || '';
    const slots = schedule.slotAssignments[staffId];

    if (activeSlot === 'morning' && slots?.morning) return slots.morning;
    if (activeSlot === 'afternoon' && slots?.afternoon) return slots.afternoon;
    if (activeSlot === 'evening' && slots?.evening) return slots.evening;

    return mainDirId;
  };

  const getStaffForDirectionAndSlot = (dirId: string): Staff[] => {
    const dirStaff = visibleStaffList.filter((s) => {
      const assignedDirId = getStaffDirectionForSlot(s.id);
      return assignedDirId === dirId && !s.isExited;
    });

    const dir = directions.find((d) => d.id === dirId);
    return sortStaffWithCaptain(dirStaff, dir?.captainId);
  };

  const unassignedRawList = visibleStaffList.filter((s) => {
    const currentDirId = getStaffDirectionForSlot(s.id);
    return !currentDirId && !s.isExited;
  });

  const filteredUnassignedList = unassignedRawList.filter((s) => {
    const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGroup = filterGroup === 'all' || s.groupId === filterGroup;
    return matchName && matchGroup;
  });

  const allGroupNames = Array.from(new Set(staffList.map((s) => s.groupId))).sort();

  // 分类隔离：
  const allScenes = directions.filter((d) => d.category === 'scene');
  
  const exploreDirs = directions.filter((d) => d.category === 'self_explore');
  const branches = directions.filter((d) => d.category === 'branch');
  const listDirs = directions.filter((d) => d.category === 'list');
  const vacationDirs = directions.filter((d) => d.category === 'vacation');
  const exitDirs = directions.filter((d) => d.category === 'pending_exit');

  const specialCategories: Direction[] = [
    ...exploreDirs,
    ...(isDefaultBoardView ? (branches.length > 0 ? [branches[0]] : []) : branches),
    ...listDirs,
    ...vacationDirs,
    ...exitDirs
  ];

  let activeScenes = [...allScenes];

  if (!isEditMode) {
    activeScenes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const countA = getStaffForDirectionAndSlot(a.id).length;
      const countB = getStaffForDirectionAndSlot(b.id).length;
      return countB - countA;
    });
  }

  const populatedScenes = activeScenes.filter(scene => {
    if (isEditMode) return true;
    if (scene.isPinned) return true;
    const count = getStaffForDirectionAndSlot(scene.id).length;
    return count > 0;
  });

  const emptyScenes = activeScenes.filter(scene => {
    if (isEditMode) return false;
    if (scene.isPinned) return false;
    const count = getStaffForDirectionAndSlot(scene.id).length;
    return count === 0;
  });

  const isAllAssigned = filteredUnassignedList.length === 0;

  const renderDirectionCard = (dir: Direction) => {
    const isAggregateBranch = isDefaultBoardView && dir.category === 'branch';
    const isCollapsed = collapsedSceneIds.has(dir.id);

    let assignedStaff: Staff[] = [];
    if (isAggregateBranch) {
      const branchIds = directions.filter((d) => d.category === 'branch').map((d) => d.id);
      const assignedIds = Object.entries(schedule.assignments)
        .filter(([_, dId]) => branchIds.includes(dId))
        .map(([sId, _]) => sId);
      assignedStaff = visibleStaffList.filter((s) => assignedIds.includes(s.id) && !s.isExited);
    } else {
      assignedStaff = getStaffForDirectionAndSlot(dir.id);
    }

    return (
      <div
        key={dir.id}
        data-scene-id={dir.id}
        className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col transition-all ${
          dir.isPinned ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200/90'
        } ${isCollapsed ? 'min-h-[36px]' : 'min-h-[110px]'}`}
      >
        {/* Header */}
        <div className="px-2.5 py-1 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-1 min-w-0">
            {isEditMode && (
              <span className="scene-header-handle cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-slate-600">
                <GripVertical className="w-3.5 h-3.5" />
              </span>
            )}

            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
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

            <h3 className="font-bold text-xs text-slate-800 truncate max-w-[130px]" title={dir.name}>
              {isAggregateBranch ? '厅堂支行 (汇总)' : dir.name}
            </h3>

            {dir.isPinned && (
              <span className="text-[10px] text-amber-600 bg-amber-100 font-bold px-1 rounded flex-shrink-0">
                置顶
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded-full">
              {assignedStaff.length}人
            </span>

            {isEditMode && dir.category === 'scene' && (
              <div className="flex items-center space-x-0.5">
                {onTogglePinDirection && (
                  <button
                    onClick={() => onTogglePinDirection(dir.id)}
                    className={`p-0.5 rounded hover:bg-slate-200 ${dir.isPinned ? 'text-amber-600' : 'text-slate-400'}`}
                    title={dir.isPinned ? '取消置顶' : '置顶场景'}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                )}

                {onDeleteDirection && (
                  <button
                    onClick={() => {
                      if (confirm(`确定删除场景 [${dir.name}] 吗？`)) {
                        onDeleteDirection(dir.id);
                      }
                    }}
                    className="p-0.5 rounded text-slate-400 hover:text-rose-600"
                    title="删除场景"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {isAggregateBranch && onSwitchToSpecificView && (
              <button
                onClick={() => onSwitchToSpecificView('branch')}
                className="text-[10px] bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-semibold hover:bg-indigo-200"
              >
                明细&gt;
              </button>
            )}

            {/* 单个场景卡片折叠/展开按钮 */}
            <button
              onClick={() => toggleSingleSceneFold(dir.id)}
              className="p-0.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition ml-0.5"
              title={isCollapsed ? '展开此场景' : '折叠此场景(仅占一行)'}
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 人员容器 (折叠时隐藏) */}
        {!isCollapsed && (
          <div
            data-direction-id={dir.id}
            className="drag-container p-1.5 flex-1 min-h-[50px] flex flex-wrap content-start gap-1 bg-slate-50/50"
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
              <div className="w-full h-8 flex items-center justify-center border border-dashed border-slate-200 rounded text-slate-400 text-[10px]">
                {isEditMode ? '拖拽指派' : '无人排班'}
              </div>
            )}
          </div>
        )}

        {!isCollapsed && dir.category === 'self_explore' && (
          <div className="p-1 bg-purple-50/60 border-t border-purple-100">
            <div className="text-[10px] font-bold text-purple-900 flex items-center mb-0.5">
              <Compass className="w-3 h-3 mr-1 text-purple-600" />
              自拓区域规划
            </div>
            {schedule.selfExplorePairs.map((pair) => {
              const pairStaff = visibleStaffList.filter((s) => pair.staffIds.includes(s.id));
              return (
                <div key={pair.id} className="p-1 bg-white rounded border border-purple-200 text-[10px] mb-0.5">
                  <div className="font-semibold text-purple-800 mb-0.5">
                    搭档: {pairStaff.map((s) => s.name).join('+') || '未选'}
                  </div>
                  <input
                    type="text"
                    value={pair.plannedArea}
                    onChange={(e) => onUpdateSelfExploreArea(pair.id, e.target.value)}
                    placeholder="规划区域..."
                    className="w-full text-[10px] p-0.5 border border-slate-200 rounded focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="board-view-export" className="space-y-2.5">

      <div className="flex flex-col lg:flex-row gap-3 items-start">
        
        {/* 左侧【待排班全员库】 */}
        <div className={`w-full lg:w-72 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0 transition-all ${
          isAllAssigned ? 'py-0' : ''
        }`}>
          <div className="px-3 py-1.5 bg-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center space-x-1.5 font-bold text-xs">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {isLeaderRole ? `${formatGroupMinimal(authUser.groupId || '')}组 待排库` : '待排班全员库'}
              </span>
            </div>

            <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full ${
              isAllAssigned ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
            }`}>
              {isAllAssigned ? '本组全员到位' : `${filteredUnassignedList.length} 人`}
            </span>
          </div>

          {isAllAssigned ? (
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isLeaderRole ? `${formatGroupMinimal(authUser.groupId || '')}组 全员排班完成` : '全员完成排班安排'}</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono">
                共 {visibleStaffList.filter(s => !s.isExited).length} 人
              </span>
            </div>
          ) : (
            <>
              <div className="p-1 bg-slate-100/90 border-b border-slate-200 space-y-1">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
                  <input
                    type="text"
                    placeholder="搜索人员..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-2 py-0.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
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
                      className="p-0.5 bg-white border border-slate-300 rounded text-[11px] font-semibold"
                    >
                      <option value="all">全部组 ({unassignedRawList.length}人)</option>
                      {allGroupNames.map((g) => (
                        <option key={g} value={g}>{formatGroupMinimal(g)}组</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div
                data-direction-id=""
                className="drag-container p-1.5 max-h-52 lg:max-h-[65vh] overflow-y-auto flex flex-wrap content-start gap-1 bg-slate-50/50 min-h-[50px]"
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

        {/* 右侧【场景区】与底部【分割公共类别区】 */}
        <div className="flex-1 space-y-3 w-full">
          
          {/* 场景区总控栏：全量一键折叠 / 展开 */}
          <div className="flex items-center justify-between bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold text-slate-700">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>合作方场景 ({populatedScenes.length} 个)</span>
            </div>

            <button
              onClick={toggleFoldAllScenes}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 text-[11px] font-semibold flex items-center space-x-1 transition"
            >
              {collapsedSceneIds.size === directions.length ? (
                <>
                  <FolderOpen className="w-3 h-3 text-indigo-600" />
                  <span>📂 一键全部展开场景</span>
                </>
              ) : (
                <>
                  <FolderClosed className="w-3 h-3 text-slate-600" />
                  <span>📂 一键全部折叠场景 (只留一行)</span>
                </>
              )}
            </button>
          </div>

          {/* 1. 有人排班或置顶的合作方场景卡片区 */}
          <div className="scene-grid-container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 w-full">
            {populatedScenes.map(renderDirectionCard)}
          </div>

          {/* 2. 无人排班场景折叠面板 */}
          {!isEditMode && emptyScenes.length > 0 && (
            <div className="bg-slate-100/90 rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <button
                onClick={() => setIsUnassignedScenesCollapsed(!isUnassignedScenesCollapsed)}
                className="w-full px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>无人排班合作方场景 ({emptyScenes.length} 个场景待安排人员)</span>
                </div>
                {isUnassignedScenesCollapsed ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
              </button>

              {!isUnassignedScenesCollapsed && (
                <div className="p-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 bg-slate-50">
                  {emptyScenes.map(renderDirectionCard)}
                </div>
              )}
            </div>
          )}

          {/* 3. 特殊公共类别分割线区 (按：自拓 -> 厅堂 -> 名单) */}
          <div className="pt-2 border-t-2 border-dashed border-slate-300 space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold px-1">
              <span>常规公共作业方向 (自拓 / 厅堂 / 名单)</span>
              <span className="text-[10px] text-slate-400 font-normal">固定分割显示在底部</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 w-full">
              {specialCategories.map(renderDirectionCard)}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
