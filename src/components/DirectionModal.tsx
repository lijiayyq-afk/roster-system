import React, { useState } from 'react';
import { X, Plus, Trash2, Building, Eye, RotateCcw } from 'lucide-react';
import { Direction, DirectionCategory } from '../types';

interface DirectionModalProps {
  directions: Direction[];
  onClose: () => void;
  onAddDirection: (name: string, category: DirectionCategory) => void;
  onDeleteDirection: (directionId: string) => void;
  onRestoreDirection?: (directionId: string) => void;
}

export const DirectionModal: React.FC<DirectionModalProps> = ({
  directions,
  onClose,
  onAddDirection,
  onDeleteDirection,
  onRestoreDirection
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DirectionCategory>('scene');
  
  // 是否在弹窗内查看已删除的场景
  const [showDeletedOnly, setShowDeletedOnly] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddDirection(name.trim(), category);
    setName('');
  };

  const getCategoryLabel = (cat: DirectionCategory) => {
    switch (cat) {
      case 'scene': return '合作方场景';
      case 'branch': return '厅堂支行';
      case 'list': return '线上名单';
      case 'self_explore': return '自拓获客';
      case 'vacation': return '休假';
      case 'pending_exit': return '待离职';
      default: return cat;
    }
  };

  const displayList = directions.filter(d => showDeletedOnly ? d.isDeleted : !d.isDeleted);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl p-4 max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">场景与网点管理</h3>
            <p className="text-xs text-slate-500">添加合作方场景或删除不作业网点 (采用软删除保留历史)</p>
          </div>
          
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 新增场景表单 */}
        <form onSubmit={handleSubmit} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center">
            <Plus className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            新增场景 / 网点
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="col-span-2">
              <span className="text-[10px] text-slate-500 block mb-0.5">场景 / 网点名称</span>
              <input
                type="text"
                placeholder="例如：万达广场新店场景..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5">分类类别</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DirectionCategory)}
                className="w-full p-1.5 bg-white border border-slate-300 rounded font-semibold focus:outline-none"
              >
                <option value="scene">合作方场景</option>
                <option value="branch">厅堂支行</option>
                <option value="list">线上名单</option>
                <option value="self_explore">自拓获客</option>
                <option value="vacation">休假</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition shadow-xs"
          >
            添加场景网点
          </button>
        </form>

        {/* 场景列表 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {showDeletedOnly ? '已软删除场景历史库' : '现存可用场景网点名册'} ({displayList.length}个)
            </span>

            <button
              onClick={() => setShowDeletedOnly(!showDeletedOnly)}
              className={`px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 border ${
                showDeletedOnly
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{showDeletedOnly ? '切回现存场景' : '查看已删除场景'}</span>
            </button>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
            {displayList.map((dir) => (
              <div
                key={dir.id}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <Building className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-bold text-slate-800">{dir.name}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded">
                    {getCategoryLabel(dir.category)}
                  </span>
                  {dir.isDeleted && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">
                      已软删除
                    </span>
                  )}
                </div>

                <div>
                  {dir.isDeleted ? (
                    onRestoreDirection && (
                      <button
                        onClick={() => onRestoreDirection(dir.id)}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-[11px] font-bold flex items-center space-x-1"
                        title="恢复场景"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>恢复场景</span>
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        if (confirm(`确定将场景 [${dir.name}] 软删除吗？历史排班记录将完整保留。`)) {
                          onDeleteDirection(dir.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="软删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {displayList.length === 0 && (
              <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                {showDeletedOnly ? '暂无被软删除的场景' : '暂无场景网点'}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
