import React, { useEffect, useState } from 'react';
import Sortable from 'sortablejs';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, DirectionCategory, Staff } from '../types';
import { PersonCard, formatGroupMinimal } from './PersonCard';
import { canEditStaff, filterStaffByAuthUser } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Compass, MapPin, Users, Search, Filter, GripVertical, CheckCircle2, Pin, Trash2, Edit2, Clock, Sun, Sunrise, Sunset, Moon, ChevronDown, ChevronUp } from 'lucide-react';

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
  onDeleteDirection
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 独立的时段切面选择
  const [activeSlot, setActiveSlot] = useState<TimeSlotTab>('all');

  // 无人排班场景折叠开关 (默认收起)
  const [isUnassignedScenesCollapsed, setIsUnassignedScenesCollapsed] = useState<boolean>(true);

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

  // 根据时段切面获取人员在该时段的方向
  const getStaffDirectionForSlot = (staffId: string): string => {
    const mainDirId = schedule.assignments[staffId] || '';
    const slots = schedule.slotAssignments[staffId];

    if (activeSlot === 'morning' && slots?.morning) return slots.morning;
    if (activeSlot === 'afternoon' && slots?.afternoon) return slots.afternoon;
    if (activeSlot === 'evening' && slots?.evening) return slots.evening;

    return mainDirId;
  };

  // 获取特定方向在选定时段内的人员列表
  const getStaffForDirectionAndSlot = (dirId: string): Staff[] => {
    const dirStaff = visibleStaffList.filter((s) => {
      const assignedDirId = getStaffDirectionForSlot(s.id);
      return assignedDirId === dirId && !s.isExited;
    });

    const dir = directions.find((d) => d.id === dirId);
    return sortStaffWithCaptain(dirStaff, dir?.captainId);
  };

  // 未分配人员列表
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

  // 场景列表逻辑：
  // 编辑中 (isEditMode === true)：不打乱顺序，保持方向库列表位置稳定！
  // 确定完成 (isEditMode === false)：触发终极排序：置顶场景 (isPinned) > 按人数降序 > 聚合分类置底
  let activeDirections = [...directions];

  if (isDefaultBoardView) {
    const scenes = directions.filter((d) => d.category === 'scene');
    const branches = directions.filter((d) => d.category === 'branch');
    const listDirs = directions.filter((d) => d.category === 'list');
    const exploreDirs = directions.filter((d) => d.category === 'self_explore');
    const vacationDirs = directions.filter((d) => d.category === 'vacation');
    const exitDirs = directions.filter((d) => d.category === 'pending_exit');

    let processedScenes = [...scenes];

    if (!isEditMode) {
      // 确定完成预览时进行终极排序
      processedScenes.sort((a, b) => {
        // 置顶绝对优先
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // 其次按人数从多到少降序
        const countA = getStaffForDirectionAndSlot(a.id).length;
        const countB = getStaffForDirectionAndSlot(b.id).length;
        return countB - countA;
      });
    }

    activeDirections = [
      ...processedScenes,
      ...(branches.length > 0 ? [branches[0]] : []),
      ...listDirs,
      ...exploreDirs,
      ...vacationDirs,
      ...exitDirs,
    ];
  }

  // 确定完成 (isEditMode === false) 时，对于人数为 0 的无人排班场景进行自动折叠隔离
  const populatedDirections = activeDirections.filter(dir => {
    if (isEditMode) return true; // 编辑过程中全量展示
    const isAggregateBranch = isDefaultBoardView && dir.category === 'branch';
    if (isAggregateBranch) return true;
    if (dir.category !== 'scene') return true; // 厅堂/名单/自拓/休假等始终保持
    if (dir.isPinned) return true; // 已置顶的场景始终保持

    const count = getStaffForDirectionAndSlot(dir.id).length;
    return count > 0;
  });

  const emptyScenes = activeDirections.filter(dir => {
    if (isEditMode) return false;
    if (dir.category !== 'scene' || dir.isPinned) return false;
    const count = getStaffForDirectionAndSlot(dir.id).length;
    return count === 0;
  });

  const slotTabs: { id: TimeSlotTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: '全天', icon: <Sun className="w-3 h-3 text-amber-500" /> },
    { id: 'morning', label: '上午', icon: <Sunrise className="w-3 h-3 text-sky-500" /> },
    { id: 'afternoon', label: '下午', icon: <Sunset className="w-3 h-3 text-amber-600" /> },
    { id: 'evening', label: '晚上', icon: <Moon className="w-3 h-3 text-purple-500" /> },
  ];

  const isAllAssigned = filteredUnassignedList.length === 0;

  const renderDirectionCard = (dir: Direction) => {
    const isAggregateBranch = isDefaultBoardView && dir.category === 'branch';

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
        className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col min-h-[110px] ${
          dir.isPinned ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200/90'
        }`}
      >
        {/* 场景 Header */}
        <div className="px-2.5 py-1 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {isEditMode && (
              <span className="scene-header-handle cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-slate-600">
                <GripVertical className="w-3.5 h-3.5" />
              </span>
            )}

            <span
              className={`w-2 h-2 rounded-full ${
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
              {isAggregateBranch ? '厅堂 (各支行网点)' : dir.name}
            </h3>

            {/* 置顶星标 */}
            {dir.isPinned && (
              <span className="text-[10px] text-amber-600 bg-amber-100 font-bold px-1 rounded">
                置顶
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded-full">
              {assignedStaff.length}人
            </span>

            {/* 置顶切换与编辑删除按钮 */}
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
          </div>
        </div>

        {/* 场景人员 Drop 容器 */}
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

        {/* 自拓方向专属 */}
        {dir.category === 'self_explore' && (
          <div className="p-1 bg-purple-50/60 border-t border-purple-100">
            <div className="text-[10px] font-bold text-purple-900 flex items-center mb-0.5">
              <Compass className="w-3 h-3 mr-1 text-purple-600" />
              自拓区域
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
      
      {/* 独立的时段切面选择工具栏 */}
      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-1 text-xs font-bold text-slate-700">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>时段切面:</span>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg">
          {slotTabs.map((tab) => {
            const isSelected = tab.id === activeSlot;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSlot(tab.id)}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold flex items-center space-x-1 transition ${
                  isSelected ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-start">
        
        {/* 左侧【待排班全员库】 (全排完缩缩为一行，高度自适应) */}
        <div className={`w-full lg:w-72 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0 transition-all ${
          isAllAssigned ? 'py-0' : ''
        }`}>
          <div className="px-3 py-1.5 bg-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center space-x-1 font-bold text-xs">
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

        {/* 右侧【各场景/方向看板网格】 */}
        <div className="flex-1 space-y-3 w-full">
          {/* 有安排人/置顶的场景网格 */}
          <div className="scene-grid-container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 w-full">
            {populatedDirections.map(renderDirectionCard)}
          </div>

          {/* 确定完成 (预览) 时，无人排班场景合并折叠，减少干扰 */}
          {!isEditMode && emptyScenes.length > 0 && (
            <div className="bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setIsUnassignedScenesCollapsed(!isUnassignedScenesCollapsed)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 flex items-center justify-between transition"
              >
                <span>🌐 无人排班场景 ({emptyScenes.length} 个场景未安排人员)</span>
                {isUnassignedScenesCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {!isUnassignedScenesCollapsed && (
                <div className="p-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 bg-slate-50">
                  {emptyScenes.map(renderDirectionCard)}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
