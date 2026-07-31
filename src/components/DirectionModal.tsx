import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Direction, DirectionCategory } from '../types';

interface DirectionModalProps {
  directions: Direction[];
  onClose: () => void;
  onAddDirection: (name: string, category: DirectionCategory) => void;
  onDeleteDirection: (directionId: string) => void;
}

export const DirectionModal: React.FC<DirectionModalProps> = ({
  directions,
  onClose,
  onAddDirection,
  onDeleteDirection
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DirectionCategory>('scene');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddDirection(name.trim(), category);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">方向与场景管理</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-700 mb-2">快速新增方向场景</p>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              placeholder="输入场景/支行名称..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DirectionCategory)}
              className="text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-none"
            >
              <option value="scene">合作方场景</option>
              <option value="branch">厅堂/支行</option>
            </select>
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>添加至列表</span>
          </button>
        </div>

        <div className="mt-4 max-h-60 overflow-y-auto space-y-1.5">
          <p className="text-xs font-bold text-slate-500 mb-1">既有方向列表 ({directions.length})</p>
          {directions.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs">
              <div>
                <span className="font-bold text-slate-800">{d.name}</span>
                <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  {d.category === 'scene' ? '合作方场景' : d.category === 'branch' ? '厅堂支行' : '固定分类'}
                </span>
              </div>

              {d.category === 'scene' || d.category === 'branch' ? (
                <button
                  onClick={() => onDeleteDirection(d.id)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                  title="删除该方向"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[10px] text-slate-400">系统必备</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
