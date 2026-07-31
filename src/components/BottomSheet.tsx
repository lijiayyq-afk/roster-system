import React, { useState } from 'react';
import { X, Award, MapPin, Clock, FileText, Check, AlertCircle } from 'lucide-react';
import { Direction, PersonSlotSchedule, Staff } from '../types';
import { checkExperienceUpgrade } from '../models/StaffModel';

interface BottomSheetProps {
  staff: Staff | null;
  directions: Direction[];
  currentDirectionId?: string;
  slotSchedule?: PersonSlotSchedule;
  onClose: () => void;
  onAssignDirection: (staffId: string, directionId: string) => void;
  onSetCaptain: (directionId: string, staffId: string | null) => void;
  onSaveSlotSchedule: (staffId: string, slots: PersonSlotSchedule) => void;
  onSaveNotes: (staffId: string, notes: string) => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  staff,
  directions,
  currentDirectionId,
  slotSchedule,
  onClose,
  onAssignDirection,
  onSetCaptain,
  onSaveSlotSchedule,
  onSaveNotes
}) => {
  if (!staff) return null;

  const currentDir = directions.find(d => d.id === currentDirectionId);
  const isCaptainOfCurrent = currentDir?.captainId === staff.id;

  const [notes, setNotes] = useState(staff.notes || '');
  const [morningDir, setMorningDir] = useState(slotSchedule?.morning || currentDirectionId || '');
  const [afternoonDir, setAfternoonDir] = useState(slotSchedule?.afternoon || currentDirectionId || '');
  const [eveningDir, setEveningDir] = useState(slotSchedule?.evening || currentDirectionId || '');

  const isMaturedNovice = checkExperienceUpgrade(staff);

  const handleSaveSlots = () => {
    onSaveSlotSchedule(staff.id, {
      morning: morningDir,
      afternoon: afternoonDir,
      evening: eveningDir,
    });
  };

  const handleSaveNotesSubmit = () => {
    onSaveNotes(staff.id, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3"></div>

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-800">{staff.name}</h3>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                {staff.groupId} · {staff.region}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              经验: {staff.experience === 'expert' ? '高手' : staff.experience === 'novice' ? '新手' : '一般人'}
            </p>
          </div>
          
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {isMaturedNovice && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-xs text-emerald-800">
            <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>已入职满 90 天（新手期），建议可升级为“一般人”或“高手”！</span>
          </div>
        )}

        {currentDir && (currentDir.category === 'scene' || currentDir.category === 'branch') && (
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  当前处于: {currentDir.name}
                </p>
                <p className="text-[11px] text-amber-700">
                  {isCaptainOfCurrent ? '当前为该方向的队长 (已置顶)' : '可将其设为队长'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onSetCaptain(currentDir.id, isCaptainOfCurrent ? null : staff.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
                isCaptainOfCurrent
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {isCaptainOfCurrent ? '取消队长' : '设为队长'}
            </button>
          </div>
        )}

        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 flex items-center mb-2">
            <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            一键更换全天主要走向
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
            {directions.map((dir) => {
              const isSelected = dir.id === currentDirectionId;
              return (
                <button
                  key={dir.id}
                  onClick={() => onAssignDirection(staff.id, dir.id)}
                  className={`p-2 rounded-lg text-left text-xs font-medium border flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <span className="truncate">{dir.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <label className="text-xs font-bold text-indigo-900 flex items-center mb-2">
            <Clock className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            进阶时段精细排班 (可选)
          </label>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">上午 (08:30-12:00)</span>
              <select
                value={morningDir}
                onChange={(e) => setMorningDir(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:outline-none"
              >
                {directions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">下午 (13:30-17:30)</span>
              <select
                value={afternoonDir}
                onChange={(e) => setAfternoonDir(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:outline-none"
              >
                {directions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">晚上 (18:00-21:00)</span>
              <select
                value={eveningDir}
                onChange={(e) => setEveningDir(e.target.value)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded focus:outline-none"
              >
                {directions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveSlots}
            className="mt-2 w-full py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition shadow-sm"
          >
            保存精细时段
          </button>
        </div>

        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 flex items-center mb-1">
            <FileText className="w-3.5 h-3.5 mr-1 text-slate-600" />
            个人备注信息
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="仅在点击人员详情时显示，如能力特长、请假说明等..."
            className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={2}
          ></textarea>
          <button
            onClick={handleSaveNotesSubmit}
            className="mt-1 px-3 py-1 bg-slate-700 text-white text-xs font-medium rounded hover:bg-slate-800"
          >
            保存备注
          </button>
        </div>

      </div>
    </div>
  );
};
