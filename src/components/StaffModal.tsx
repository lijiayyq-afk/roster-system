import React, { useState } from 'react';
import { X, UserPlus, Trash2, UserMinus, UserCheck, Edit2, Check, RotateCcw } from 'lucide-react';
import { ExperienceLevel, Staff } from '../types';
import { formatGroupMinimal } from './PersonCard';

interface StaffModalProps {
  staffList: Staff[];
  groups: string[];
  regions: string[];
  onClose: () => void;
  onAddStaff: (staff: Omit<Staff, 'id'>) => void;
  onDeleteStaff: (staffId: string) => void;
  onUpdateStaff?: (staff: Staff) => void;
  onToggleExitStaff?: (staffId: string, isExited: boolean) => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  staffList,
  groups,
  regions,
  onClose,
  onAddStaff,
  onDeleteStaff,
  onUpdateStaff,
  onToggleExitStaff
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState(groups[0] || '20501组');
  const [region, setRegion] = useState(regions[0] || '待定');
  const [experience, setExperience] = useState<ExperienceLevel>('novice');
  const [entryDate, setEntryDate] = useState(todayStr);

  const [showExitedOnly, setShowExitedOnly] = useState(false);

  // 当前正在编辑的人员对象
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddStaff({
      name: name.trim(),
      groupId,
      region,
      experience,
      entryDate: entryDate || todayStr,
      notes: ''
    });

    setName('');
    setExperience('novice');
    setEntryDate(todayStr);
  };

  const handleStartEdit = (staff: Staff) => {
    setEditingStaff({ ...staff });
  };

  const handleSaveEdit = () => {
    if (editingStaff && onUpdateStaff) {
      onUpdateStaff(editingStaff);
      setEditingStaff(null);
    }
  };

  const displayList = staffList.filter(s => showExitedOnly ? s.isExited : !s.isExited);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl p-4 max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">团队人员与离职档案管理</h3>
            <p className="text-xs text-slate-500">已在册 {staffList.filter(s => !s.isExited).length} 人在职，{staffList.filter(s => s.isExited).length} 人离职</p>
          </div>
          
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 新增人员表单 */}
        <form onSubmit={handleSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center">
            <UserPlus className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            新增业务代表成员
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">姓名</span>
              <input
                type="text"
                placeholder="业代姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">所属组别</span>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded font-semibold focus:outline-none"
              >
                {groups.map((g) => (
                  <option key={g} value={g}>{formatGroupMinimal(g)}组</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">归属区域</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded focus:outline-none"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">经验等级</span>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-emerald-700 focus:outline-none"
              >
                <option value="novice">新手 (默认入职&lt;90天)</option>
                <option value="regular">一般人</option>
                <option value="expert">高手</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition shadow-xs"
          >
            确认添加人员
          </button>
        </form>

        {/* 在职/离职人员名册 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {showExitedOnly ? '已离职人员档案库' : '在职人员名册'} ({displayList.length}人)
            </span>

            <button
              onClick={() => setShowExitedOnly(!showExitedOnly)}
              className={`px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 border ${
                showExitedOnly
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <UserMinus className="w-3 h-3" />
              <span>{showExitedOnly ? '切回在职名册' : '查看已离职人员'}</span>
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {displayList.map((staff) => {
              const isEditing = editingStaff?.id === staff.id;

              if (isEditing && editingStaff) {
                return (
                  <div key={staff.id} className="p-2.5 bg-indigo-50/70 border border-indigo-300 rounded-xl space-y-2 animate-fade-in">
                    <div className="text-xs font-bold text-indigo-900 flex items-center justify-between">
                      <span>正在编辑成员: {staff.name}</span>
                      <button onClick={() => setEditingStaff(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">姓名</span>
                        <input
                          type="text"
                          value={editingStaff.name}
                          onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                          className="w-full p-1 bg-white border border-slate-300 rounded focus:outline-none"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">所属组别</span>
                        <select
                          value={editingStaff.groupId}
                          onChange={(e) => setEditingStaff({ ...editingStaff, groupId: e.target.value })}
                          className="w-full p-1 bg-white border border-slate-300 rounded font-semibold focus:outline-none"
                        >
                          {groups.map((g) => (
                            <option key={g} value={g}>{formatGroupMinimal(g)}组</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">归属区域</span>
                        <select
                          value={editingStaff.region}
                          onChange={(e) => setEditingStaff({ ...editingStaff, region: e.target.value })}
                          className="w-full p-1 bg-white border border-slate-300 rounded focus:outline-none"
                        >
                          {regions.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block mb-0.5">经验等级</span>
                        <select
                          value={editingStaff.experience}
                          onChange={(e) => setEditingStaff({ ...editingStaff, experience: e.target.value as ExperienceLevel })}
                          className="w-full p-1 bg-white border border-slate-300 rounded focus:outline-none"
                        >
                          <option value="regular">一般人</option>
                          <option value="expert">高手</option>
                          <option value="novice">新手</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-1.5 pt-1">
                      <button
                        onClick={() => setEditingStaff(null)}
                        className="px-2.5 py-1 bg-white text-slate-600 border border-slate-300 text-xs font-semibold rounded hover:bg-slate-100"
                      >
                        取消
                      </button>

                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 shadow-xs flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>保存修改</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={staff.id}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-indigo-300 transition"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{staff.name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded">
                      {formatGroupMinimal(staff.groupId)}组 {staff.region !== '待定' ? `· ${staff.region}` : ''}
                    </span>
                    <span className={`text-[10px] font-semibold ${staff.experience === 'novice' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {staff.experience === 'expert' ? '高手' : staff.experience === 'novice' ? '新手' : '一般人'}
                    </span>
                    {staff.entryDate && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        {staff.entryDate}
                      </span>
                    )}
                    {staff.isExited && (
                      <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1 rounded">
                        已离职
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* 修改编辑按钮 */}
                    <button
                      onClick={() => handleStartEdit(staff)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-200"
                      title="编辑人员信息"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {onToggleExitStaff && (
                      <button
                        onClick={() => onToggleExitStaff(staff.id, !staff.isExited)}
                        className={`p-1 rounded hover:bg-slate-200 text-[10px] font-bold flex items-center space-x-0.5 ${
                          staff.isExited ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                        title={staff.isExited ? '恢复为在职' : '标记离职'}
                      >
                        {staff.isExited ? <UserCheck className="w-3.5 h-3.5" /> : <UserMinus className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`确定彻底删除人员 [${staff.name}] 吗？`)) {
                          onDeleteStaff(staff.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {displayList.length === 0 && (
              <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                {showExitedOnly ? '暂无已离职人员记录' : '暂无人员'}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
