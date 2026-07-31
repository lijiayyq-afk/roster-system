import React, { useState } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { ExperienceLevel, Staff } from '../types';

interface StaffModalProps {
  staffList: Staff[];
  groups: string[];
  regions: string[];
  onClose: () => void;
  onAddStaff: (staff: Omit<Staff, 'id'>) => void;
  onDeleteStaff: (staffId: string) => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  staffList,
  groups,
  regions,
  onClose,
  onAddStaff,
  onDeleteStaff
}) => {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState(groups[0] || '1组');
  const [region, setRegion] = useState(regions[0] || '昆山');
  const [experience, setExperience] = useState<ExperienceLevel>('novice');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddStaff({
      name: name.trim(),
      groupId,
      region,
      experience,
      entryDate,
      notes: notes.trim()
    });
    setName('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl p-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">人员档案管理</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <p className="text-xs font-bold text-slate-700">录入新成员</p>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">姓名</span>
              <input
                type="text"
                placeholder="人员姓名..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">经验级别</span>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
              >
                <option value="novice">新手 (新入职)</option>
                <option value="regular">一般人</option>
                <option value="expert">高手</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">所属小组</span>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
              >
                {groups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">所属区域</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block mb-1">入职日期</span>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block mb-1">个人备注</span>
            <input
              type="text"
              placeholder="添加特长或备注..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none"
            />
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center space-x-1"
          >
            <UserPlus className="w-4 h-4" />
            <span>保存人员</span>
          </button>
        </div>

        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-bold text-slate-500 mb-1">现有人员档案 ({staffList.length}人)</p>
          <div className="max-h-52 overflow-y-auto space-y-1">
            {staffList.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-slate-800">{s.name}</span>
                  <span className="ml-2 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {s.groupId} · {s.region}
                  </span>
                  <span className="ml-1 text-[10px] text-slate-400">
                    ({s.experience === 'expert' ? '高手' : s.experience === 'novice' ? '新手' : '一般人'})
                  </span>
                </div>

                <button
                  onClick={() => onDeleteStaff(s.id)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                  title="删除人员"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
