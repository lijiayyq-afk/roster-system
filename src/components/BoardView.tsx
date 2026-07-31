import React, { useEffect, useState } from 'react';
import Sortable from 'sortablejs';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, Staff } from '../types';
import { PersonCard, formatGroupMinimal } from './PersonCard';
import { canEditStaff, filterStaffByAuthUser } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Users, GripVertical, CheckCircle2, Pin, Trash2, ChevronDown, ChevronUp, Layers, Package, BookOpen, FolderClosed } from 'lucide-react';

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
export type SceneFoldMode = 'expanded' | 'card_folded' | 'section_folded';

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
  onSwitchToSpecificView,
  onReorderDirections,
  onTogglePinDirection,
  onDeleteDirection,
  activeSlot
}) => {
  const [isUnassignedScenesCollapsed, setIsUnassignedScenesCollapsed] = useState<boolean>(true);
  
  // 三阶段场景折叠模式: 'expanded' (全部展开) | 'card_folded' (各卡片折叠占一行) | 'section_folded' (场景整体收起为单行)
  const [sceneFoldMode, setSceneFoldMode] = useState<SceneFoldMode>('expanded');
  
  // 个别单卡片手动覆盖折叠集合
  const [collapsedSceneIds, setCollapsedSceneIds] = useState<Set<string>>(new Set());

  const visibleStaffList = filterStaffByAuthUser(staffList, authUser);

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

  // 单卡片手动折叠/展开
  const toggleSingleSceneFold = (sceneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // 三阶段总控循环切换逻辑: expanded -> card_folded -> section_folded -> expanded
  const cycleSceneFoldMode = () => {
    if (sceneFoldMode === 'expanded') {
      setSceneFoldMode('card_folded');
    } else if (sceneFoldMode === 'card_folded') {
      setSceneFoldMode('section_folded');
    } else {
      setSceneFoldMode('expanded');
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

  const unassignedList = visibleStaffList.filter((s) => {
    const currentDirId = getStaffDirectionForSlot(s.id);
    return !currentDirId && !s.isExited;
  });

  const isLeaderRole = authUser.role === 'leader' && !!authUser.groupId;

  // 分类与底部分割
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

  const isAllAssigned = unassignedList.length === 0;

  const renderDirectionCard = (dir: Direction) => {
    const isAggregateBranch = isDefaultBoardView && dir.category === 'branch';

    // 如果全局设为 card_folded，则默认卡片折叠；否则取个别手动状态
    const isCardFolded = sceneFoldMode === 'card_folded' || collapsedSceneIds.has(dir.id);

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
        }`}
      >
        {/* Header */}
        <div 
          onClick={(e) => toggleSingleSceneFold(dir.id, e)}
          className="px-2.5 py-1 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center space-x-1 min-w-0">
            {isEditMode && (
              <span className="scene-header-handle cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
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
              {isAggregateBranch ? '厅堂' : dir.name}
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
              <div className="flex items-center space-x-0.5" onClick={(e) => e.stopPropagation()}>
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

            <button
              onClick={(e) => toggleSingleSceneFold(dir.id, e)}
              className="p-0.5 bg-slate-200 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 rounded transition ml-1 border border-slate-300"
              title={isCardFolded ? '展开此场景' : '折叠此场景(只留一行)'}
            >
              {isCardFolded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 人员容器 (当卡片折叠时不渲染) */}
        {!isCardFolded && (
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
              {isAllAssigned ? '本组全员到位' : `${unassignedList.length} 人`}
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
            <div
              data-direction-id=""
              className="drag-container p-1.5 h-16 max-h-16 lg:h-auto lg:max-h-[60vh] overflow-y-auto flex flex-wrap content-start gap-1 bg-slate-50/50"
            >
              {unassignedList.map((staff) => {
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
          )}
        </div>

        {/* 右侧【场景区】与底部【分割公共类别区】 */}
        <div className="flex-1 space-y-3 w-full">
          
          {/* 场景区总控栏 (支持 3 阶段切换: 全部展开 -> 各卡片折叠占一行 -> 场景区整体合为一行) */}
          <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold text-slate-700">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>场景 ({populatedScenes.length} 个)</span>
            </div>

            {/* 三阶段循环切换按钮 */}
            <button
              onClick={cycleSceneFoldMode}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center space-x-1 transition shadow-2xs"
            >
              {sceneFoldMode === 'expanded' ? (
                <>
                  <FolderClosed className="w-3.5 h-3.5 text-indigo-600" />
                  <span>📂 折叠卡片 (各占一行)</span>
                </>
              ) : sceneFoldMode === 'card_folded' ? (
                <>
                  <Package className="w-3.5 h-3.5 text-purple-600" />
                  <span>📦 场景整体折叠 (合为一行)</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>📖 场景全部展开</span>
                </>
              )}
            </button>
          </div>

          {/* 1. 合作方场景区 (如果为 section_folded 整体折叠模式，收缩为极简单行) */}
          {sceneFoldMode === 'section_folded' ? (
            <div 
              onClick={() => setSceneFoldMode('expanded')}
              className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-2.5 text-xs font-bold text-indigo-900 flex items-center justify-between cursor-pointer hover:bg-indigo-100/80 transition"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                <span>全量场景区已整行折叠 (共 {populatedScenes.length} 个场景已收起，不占用空间)</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold bg-white px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                点击展开明细场景 ▾
              </span>
            </div>
          ) : (
            <div className="scene-grid-container grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 w-full">
              {populatedScenes.map(renderDirectionCard)}
            </div>
          )}

          {/* 2. 无人排班场景折叠面板 */}
          {sceneFoldMode !== 'section_folded' && !isEditMode && emptyScenes.length > 0 && (
            <div className="bg-slate-100/90 rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <button
                onClick={() => setIsUnassignedScenesCollapsed(!isUnassignedScenesCollapsed)}
                className="w-full px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 flex items-center justify-between transition"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>无人排班场景 ({emptyScenes.length} 个场景待安排人员)</span>
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
