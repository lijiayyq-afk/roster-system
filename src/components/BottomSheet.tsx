import React, { useState } from 'react';
import { X, Award, MapPin, Clock, FileText, Check, RotateCcw, UserMinus, UserCheck } from 'lucide-react';
import { Direction, PersonSlotSchedule, Staff } from '../types';

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
  onToggleExitStaff?: (staffId: string, isExited: boolean) => void;
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
  onSaveNotes,
  onToggleExitStaff
}) => {
  if (!staff) return null;

  const currentDir = directions.find(d => d.id === currentDirectionId);
  const isCaptainOfCurrent = currentDir?.captainId === staff.id;

  const [notes, setNotes] = useState(staff.notes || '');
  const [morningDir, setMorningDir] = useState(slotSchedule?.morning || currentDirectionId || '');
  const [afternoonDir, setAfternoonDir] = useState(slotSchedule?.afternoon || currentDirectionId || '');
  const [eveningDir, setEveningDir] = useState(slotSchedule?.evening || currentDirectionId || '');

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
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto shadow-2xl space-y-3">
        
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-1"></div>

        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-800">{staff.name}</h3>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                {staff.groupId} {staff.region !== '待定' ? `· ${staff.region}` : ''}
              </span>
              {staff.isExited && (
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                  已离职
                </span>
              )}
            </div>
          </div>
          
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 1. 设置队长 & 退回人员库 & 离职管理 */}
        <div className="flex flex-wrap gap-2">
          {currentDir && (currentDir.category === 'scene' || currentDir.category === 'branch') && !staff.isExited && (
            <button
              onClick={() => {
                onSetCaptain(currentDir.id, isCaptainOfCurrent ? null : staff.id);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 shadow-xs ${
                isCaptainOfCurrent
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isCaptainOfCurrent ? '取消队长' : '设为队长'}</span>
            </button>
          )}

          {currentDirectionId && !staff.isExited && (
            <button
              onClick={() => onAssignDirection(staff.id, '')}
              className="py-1.5 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-slate-300"
              title="退回到待排班人员库"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>退回全员库</span>
            </button>
          )}

          {onToggleExitStaff && (
            <button
              onClick={() => {
                if (staff.isExited) {
                  onToggleExitStaff(staff.id, false);
                } else if (confirm(`确定将成员 [${staff.name}] 标记为已离职吗？`)) {
                  onToggleExitStaff(staff.id, true);
                  onAssignDirection(staff.id, '');
                }
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center space-x-1 border shadow-2xs ${
                staff.isExited
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              {staff.isExited ? <UserCheck className="w-3.5 h-3.5" /> : <UserMinus className="w-3.5 h-3.5" />}
              <span>{staff.isExited ? '恢复为在职' : '标记为已离职'}</span>
            </button>
          )}
        </div>

        {/* 2. 快速分配全天方向 */}
        {!staff.isExited && (
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center mb-1.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              一键快捷指派/更换走向
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {directions.map((dir) => {
                const isSelected = dir.id === currentDirectionId;
                return (
                  <button
                    key={dir.id}
                    onClick={() => onAssignDirection(staff.id, dir.id)}
                    className={`p-2 rounded-lg text-left text-xs font-semibold border flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <span className="truncate">{dir.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. 进阶时段排班 (上午 / 下午 / 晚上) */}
        {!staff.isExited && (
          <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <label className="text-xs font-bold text-indigo-900 flex items-center mb-1.5">
              <Clock className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              进阶时段精细排班 (可选)
            </label>
            
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">上午 (08:30-12:00)</span>
                <select
                  value={morningDir}
                  onChange={(e) => setMorningDir(e.target.value)}
                  className="w-full text-xs p-1 bg-white border border-slate-300 rounded focus:outline-none"
                >
                  <option value="">全天默认</option>
                  {directions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">下午 (13:30-17:30)</span>
                <select
                  value={afternoonDir}
                  onChange={(e) => setAfternoonDir(e.target.value)}
                  className="w-full text-xs p-1 bg-white border border-slate-300 rounded focus:outline-none"
                >
                  <option value="">全天默认</option>
                  {directions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">晚上 (18:00-21:00)</span>
                <select
                  value={eveningDir}
                  onChange={(e) => setEveningDir(e.target.value)}
                  className="w-full text-xs p-1 bg-white border border-slate-300 rounded focus:outline-none"
                >
                  <option value="">全天默认</option>
                  {directions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveSlots}
              className="mt-2 w-full py-1 bg-indigo-600 text-white text-xs font-semibold rounded hover:bg-indigo-700 transition shadow-xs"
            >
              保存精细时段
            </button>
          </div>
        )}

        {/* 4. 个人备注编辑 */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center mb-1">
            <FileText className="w-3.5 h-3.5 mr-1 text-slate-600" />
            个人备注信息
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="填写业务说明或特殊排班备注..."
            className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
