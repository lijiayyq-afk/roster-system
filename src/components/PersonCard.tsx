import React from 'react';
import { Award, Lock, Clock, FileText } from 'lucide-react';
import { ColorHighlightMode, PersonSlotSchedule, Staff } from '../types';

interface PersonCardProps {
  staff: Staff;
  isCaptain?: boolean;
  canEdit: boolean;
  colorMode: ColorHighlightMode;
  slotSchedule?: PersonSlotSchedule;
  onClickCard: (staff: Staff) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  staff,
  isCaptain = false,
  canEdit,
  colorMode,
  slotSchedule,
  onClickCard
}) => {
  const hasCustomSlots = slotSchedule && (slotSchedule.morning || slotSchedule.afternoon || slotSchedule.evening);

  // 根据显色模式获取卡片专属风格
  const getCardStyle = () => {
    if (colorMode === 'experience') {
      switch (staff.experience) {
        case 'expert':
          return 'bg-amber-50/90 border-amber-300 text-amber-900';
        case 'novice':
          return 'bg-emerald-50/90 border-emerald-300 text-emerald-900';
        default:
          return 'bg-blue-50/90 border-blue-200 text-blue-900';
      }
    } else if (colorMode === 'group') {
      if (staff.groupId.includes('1')) return 'bg-indigo-50/90 border-indigo-200 text-indigo-900';
      if (staff.groupId.includes('2')) return 'bg-teal-50/90 border-teal-200 text-teal-900';
      if (staff.groupId.includes('3')) return 'bg-purple-50/90 border-purple-200 text-purple-900';
      if (staff.groupId.includes('4')) return 'bg-orange-50/90 border-orange-200 text-orange-900';
      return 'bg-sky-50/90 border-sky-200 text-sky-900';
    }

    // 默认极简风格
    return 'bg-white border-slate-200 hover:border-indigo-400';
  };

  return (
    <div
      onClick={() => onClickCard(staff)}
      data-id={staff.id}
      className={`relative px-2.5 py-1.5 rounded-lg border shadow-xs transition-all active:scale-[0.99] cursor-pointer ${
        !canEdit ? 'opacity-70 bg-slate-100/90 border-slate-200 cursor-not-allowed' : getCardStyle()
      } ${isCaptain ? 'ring-2 ring-amber-400 border-amber-400 font-medium' : ''}`}
    >
      {/* 队长徽章 (置顶标识) */}
      {isCaptain && (
        <div className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center shadow-xs">
          <Award className="w-2.5 h-2.5 mr-0.5" />
          <span>队长</span>
        </div>
      )}

      {/* 组长只读锁定标志 */}
      {!canEdit && (
        <div className="absolute top-1.5 right-1.5 text-slate-400" title="非本组人员，仅可查看">
          <Lock className="w-3 h-3" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          {/* 姓名 */}
          <span className="font-bold text-xs md:text-sm text-slate-800 tracking-tight">{staff.name}</span>
          
          {/* 小组标签 (根据显色模式微调) */}
          <span className={`text-[9px] px-1 py-0.2 rounded font-normal ${
            colorMode === 'group' 
              ? 'bg-slate-900/10 font-bold' 
              : 'text-slate-400 bg-slate-100'
          }`}>
            {staff.groupId}
          </span>
        </div>
      </div>

      {/* 显色模式提示 */}
      {colorMode === 'experience' && (
        <div className="mt-1 flex items-center justify-between text-[9px]">
          <span
            className={`px-1 py-0.2 rounded font-medium ${
              staff.experience === 'expert'
                ? 'bg-amber-100 text-amber-800'
                : staff.experience === 'novice'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {staff.experience === 'expert' ? '高手' : staff.experience === 'novice' ? '新手' : '一般人'}
          </span>
          {staff.notes && (
            <span className="text-slate-400 flex items-center">
              <FileText className="w-2.5 h-2.5 mr-0.5" /> 备注
            </span>
          )}
        </div>
      )}

      {/* 精细时段指示 */}
      {hasCustomSlots && (
        <div className="mt-1 pt-0.5 border-t border-slate-100 flex items-center space-x-1 text-[9px] text-indigo-600 font-medium">
          <Clock className="w-2.5 h-2.5" />
          <span>精细时段</span>
        </div>
      )}
    </div>
  );
};
