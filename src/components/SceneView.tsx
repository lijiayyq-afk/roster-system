import React, { useState } from 'react';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, Staff } from '../types';
import { PersonCard } from './PersonCard';
import { canEditStaff } from '../models/PermissionModel';
import { sortStaffWithCaptain } from '../models/StaffModel';
import { Building, Award, Users } from 'lucide-react';

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
  onMoveStaff,
  onClickStaffCard
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>('all');

  const sceneDirections = directions.filter((d) => d.category === 'scene');

  const getStaffForScene = (sceneId: string): Staff[] => {
    const assignedIds = Object.entries(schedule.assignments)
      .filter(([_, dId]) => dId === sceneId)
      .map(([sId, _]) => sId);

    const dirStaff = staffList.filter((s) => assignedIds.includes(s.id));
    const dir = sceneDirections.find((d) => d.id === sceneId);

    return sortStaffWithCaptain(dirStaff, dir?.captainId);
  };

  const displayScenes = selectedSceneId === 'all'
    ? sceneDirections
    : sceneDirections.filter(d => d.id === selectedSceneId);

  return (
    <div id="scene-view-export" className="space-y-3">
      <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap px-1 flex items-center">
          <Building className="w-4 h-4 mr-1 text-blue-600" />
          场景视角维度:
        </span>

        <button
          onClick={() => setSelectedSceneId('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
            selectedSceneId === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🌐 所有场景 (总视图)
        </button>

        {sceneDirections.map((scene) => {
          const isSelected = scene.id === selectedSceneId;
          const count = getStaffForScene(scene.id).length;
          return (
            <button
              key={scene.id}
              onClick={() => setSelectedSceneId(scene.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{scene.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}人
              </span>
            </button>
          );
        })}
      </div>

      <div className={`grid gap-3 ${selectedSceneId === 'all' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {displayScenes.map((scene) => {
          const assignedStaff = getStaffForScene(scene.id);
          const captain = staffList.find((s) => s.id === scene.captainId);

          const groupStats: Record<string, number> = {};
          assignedStaff.forEach(s => {
            groupStats[s.groupId] = (groupStats[s.groupId] || 0) + 1;
          });

          return (
            <div
              key={scene.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="px-3.5 py-2.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-blue-300" />
                  <h3 className="font-bold text-sm truncate max-w-[200px]">
                    {scene.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-700 text-blue-100 font-bold px-2 py-0.5 rounded-full">
                    全场景共 {assignedStaff.length} 人
                  </span>
                </div>
              </div>

              <div className="px-3.5 py-2 bg-blue-50/80 border-b border-blue-100 flex flex-wrap items-center justify-between text-xs gap-1">
                <div className="flex items-center text-blue-900 font-semibold">
                  <Award className="w-3.5 h-3.5 text-amber-500 mr-1" />
                  <span>队长: {captain ? `${captain.name} (${captain.groupId})` : '暂未指定'}</span>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-blue-700">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span>组别分布: </span>
                  {Object.entries(groupStats).map(([g, cnt]) => (
                    <span key={g} className="bg-white px-1.5 py-0.2 rounded border border-blue-200 font-mono">
                      {g}:{cnt}人
                    </span>
                  ))}
                  {Object.keys(groupStats).length === 0 && <span>无</span>}
                </div>
              </div>

              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-slate-50/50">
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
                  <div className="col-span-full h-20 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    该场景暂未安排人员
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
