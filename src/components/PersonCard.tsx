import React from 'react';
import { Award, Lock, Clock, FileText } from 'lucide-react';
import { PersonSlotSchedule, Staff } from '../types';

interface PersonCardProps {
  staff: Staff;
  isCaptain?: boolean;
  canEdit: boolean;
  showExperienceColor: boolean;
  slotSchedule?: PersonSlotSchedule;
  onClickCard: (staff: Staff) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  staff,
  isCaptain = false,
  canEdit,
  showExperienceColor,
  slotSchedule,
  onClickCard
}) => {
  const hasCustomSlots = slotSchedule && (slotSchedule.morning || slotSchedule.afternoon || slotSchedule.evening);

  const getExperienceStyle = () => {
    if (!showExperienceColor) {
      return 'bg-white border-slate-200 hover:border-indigo-400';
    }
    switch (staff.experience) {
      case 'expert':
        return 'bg-amber-50/90 border-amber-300 text-amber-900';
      case 'novice':
        return 'bg-emerald-50/90 border-emerald-300 text-emerald-900';
      default:
        return 'bg-blue-50/90 border-blue-200 text-blue-900';
    }
  };

  return (
    <div
      onClick={() => onClickCard(staff)}
      data-id={staff.id}
      className={`relative px-2 py-1.5 rounded-md border shadow-xs transition-all cursor-pointer ${
        !canEdit ? 'opacity-75 bg-slate-100/90 border-slate-200 cursor-not-allowed' : getExperienceStyle()
      } ${isCaptain ? 'ring-2 ring-amber-400 border-amber-400 font-medium' : ''}`}
    >
      {/* 队长徽章 (置顶标识) */}
      {isCaptain && (
        <div className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1 py-0.2 rounded-full flex items-center shadow-xs">
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
          
          {/* 淡化的小组标签 (缩小并使用极低对比度) */}
          <span className="text-[9px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded font-normal">
            {staff.groupId}
          </span>
        </div>
      </div>

      {/* 经验显色开启时的柔和 Badge */}
      {showExperienceColor && (
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
