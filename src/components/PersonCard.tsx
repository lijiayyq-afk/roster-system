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
      className={`relative p-2.5 rounded-lg border shadow-sm transition-all cursor-pointer ${
        !canEdit ? 'opacity-75 bg-slate-100/90 border-slate-200 cursor-not-allowed' : getExperienceStyle()
      } ${isCaptain ? 'ring-2 ring-amber-400 border-amber-400 font-medium' : ''}`}
    >
      {isCaptain && (
        <div className="absolute -top-2 -right-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center shadow">
          <Award className="w-3 h-3 mr-0.5" />
          <span>队长</span>
        </div>
      )}

      {!canEdit && (
        <div className="absolute top-2 right-2 text-slate-400" title="非本组人员，仅可查看">
          <Lock className="w-3.5 h-3.5" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="font-bold text-sm text-slate-800">{staff.name}</span>
          <span className="text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded font-mono">
            {staff.groupId}
          </span>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          {staff.region}
        </span>
      </div>

      {showExperienceColor && (
        <div className="mt-1.5 flex items-center justify-between text-[10px]">
          <span
            className={`px-1.5 py-0.5 rounded font-medium ${
              staff.experience === 'expert'
                ? 'bg-amber-200/80 text-amber-800'
                : staff.experience === 'novice'
                ? 'bg-emerald-200/80 text-emerald-800'
                : 'bg-blue-200/80 text-blue-800'
            }`}
          >
            {staff.experience === 'expert' ? '高手' : staff.experience === 'novice' ? '新手' : '一般人'}
          </span>
          {staff.notes && (
            <span className="text-slate-400 flex items-center">
              <FileText className="w-3 h-3 mr-0.5" /> 备注
            </span>
          )}
        </div>
      )}

      {hasCustomSlots && (
        <div className="mt-1.5 pt-1 border-t border-slate-200/60 flex items-center space-x-1 text-[10px] text-indigo-600">
          <Clock className="w-3 h-3" />
          <span>已设精细时段</span>
        </div>
      )}
    </div>
  );
};
