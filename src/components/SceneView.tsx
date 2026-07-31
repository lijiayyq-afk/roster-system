import React, { useState } from 'react';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, Staff } from '../types';
import { PersonCard } from './PersonCard';
import { canEditStaff, filterStaffByAuthUser } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Building, Users } from 'lucide-react';

interface SceneViewProps {
  schedule: DailySchedule;
  staffList: Staff[];
  directions: Direction[];
  authUser: AuthUser;
  colorMode: ColorHighlightMode;
  onMoveStaff: (staffId: string, targetDirectionId: string) => void;
  onClickStaffCard: (staff: Staff) => void;
}

export const SceneView: React.FC<SceneViewProps> = ({
  schedule,
  staffList,
  directions,
  authUser,
  colorMode,
  onClickStaffCard
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>('all');

  // 纯净隔离过滤：为组长时仅保留本组人员
  const visibleStaffList = filterStaffByAuthUser(staffList, authUser);

  const sceneDirections = directions.filter((d) => d.category === 'scene');

  const getStaffForScene = (sceneId: string): Staff[] => {
    const assignedIds = Object.entries(schedule.assignments)
      .filter(([_, dId]) => dId === sceneId)
      .map(([sId, _]) => sId);

    const dirStaff = visibleStaffList.filter((s) => assignedIds.includes(s.id) && !s.isExited);
    const dir = sceneDirections.find((d) => d.id === sceneId);

    return sortStaffWithCaptain(dirStaff, dir?.captainId);
  };

  const displayScenes = selectedSceneId === 'all'
    ? sceneDirections
    : sceneDirections.filter(d => d.id === selectedSceneId);

  return (
    <div id="scene-view-export" className="space-y-3">
      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">场景视角看板</h4>
            <p className="text-[10px] text-slate-400">选择查阅总视图或调阅单一场景</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <select
            value={selectedSceneId}
            onChange={(e) => setSelectedSceneId(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50/80 text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-xs"
          >
            <option value="all">🌐 所有场景 (总视图)</option>
            <option disabled className="bg-slate-100 text-slate-400">──────────</option>
            {sceneDirections.map((scene) => {
              const count = getStaffForScene(scene.id).length;
              return (
                <option key={scene.id} value={scene.id} className="bg-white text-slate-800 font-normal">
                  📍 {scene.name} ({count}人)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className={`grid gap-3 ${selectedSceneId === 'all' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {displayScenes.map((scene) => {
          const assignedStaff = getStaffForScene(scene.id);
          const captain = visibleStaffList.find((s) => s.id === scene.captainId);

          const groupStats: Record<string, number> = {};
          assignedStaff.forEach(s => {
            groupStats[s.groupId] = (groupStats[s.groupId] || 0) + 1;
          });

          return (
            <div
              key={scene.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="px-3.5 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-300" />
                  <h3 className="font-bold text-xs truncate max-w-[200px]">
                    {scene.name}
                  </h3>
                </div>

                <span className="text-xs bg-blue-700 text-blue-100 font-bold px-2 py-0.5 rounded-full">
                  共 {assignedStaff.length} 人
                </span>
              </div>

              {captain && (
                <div className="px-3 py-1 bg-amber-50 text-[11px] text-amber-900 border-b border-amber-100">
                  👑 队长: {captain.name}
                </div>
              )}

              <div className="p-2 flex-1 min-h-[60px] flex flex-wrap content-start gap-1 bg-slate-50/50">
                {assignedStaff.map((staff) => {
                  const canEdit = canEditStaff(authUser, staff);
                  return (
                    <PersonCard
                      key={staff.id}
                      staff={staff}
                      isCaptain={scene.captainId === staff.id}
                      canEdit={canEdit}
                      colorMode={colorMode}
                      slotSchedule={schedule.slotAssignments[staff.id]}
                      onClickCard={onClickStaffCard}
                    />
                  );
                })}

                {assignedStaff.length === 0 && (
                  <div className="w-full h-10 flex items-center justify-center border border-dashed border-slate-200 rounded text-slate-400 text-xs">
                    该场景暂无安排人员
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
