import React from 'react';
import { Lock, Clock } from 'lucide-react';
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

  const cleanGroupLabel = (g: string) => g.replace(/组$/, '');

  const getChipStyle = () => {
    if (colorMode === 'experience') {
      switch (staff.experience) {
        case 'expert':
          return 'bg-amber-100/90 border-amber-300 text-amber-900 hover:bg-amber-200';
        case 'novice':
          return 'bg-emerald-100/90 border-emerald-300 text-emerald-900 hover:bg-emerald-200';
        default:
          return 'bg-blue-100/90 border-blue-200 text-blue-900 hover:bg-blue-200';
      }
    } else if (colorMode === 'group') {
      if (staff.groupId.includes('1')) return 'bg-indigo-100/90 border-indigo-300 text-indigo-900 hover:bg-indigo-200';
      if (staff.groupId.includes('2')) return 'bg-teal-100/90 border-teal-300 text-teal-900 hover:bg-teal-200';
      if (staff.groupId.includes('3')) return 'bg-purple-100/90 border-purple-300 text-purple-900 hover:bg-purple-200';
      if (staff.groupId.includes('4')) return 'bg-orange-100/90 border-orange-300 text-orange-900 hover:bg-orange-200';
      return 'bg-sky-100/90 border-sky-300 text-sky-900 hover:bg-sky-200';
    }

    return 'bg-white border-slate-300 hover:border-indigo-500 text-slate-800 shadow-2xs';
  };

  return (
    <div
      onClick={() => onClickCard(staff)}
      data-id={staff.id}
      className={`inline-flex items-center justify-between px-2 py-0.5 rounded-md border text-xs font-semibold transition-all active:scale-95 cursor-pointer max-w-full ${
        !canEdit ? 'opacity-65 bg-slate-100 border-slate-200 cursor-not-allowed' : getChipStyle()
      } ${isCaptain ? 'ring-2 ring-amber-400 border-amber-400 font-bold bg-amber-50' : ''}`}
    >
      <div className="flex items-center space-x-1 truncate">
        {/* 队长金黄星标 👑 */}
        {isCaptain && (
          <span className="text-amber-600 flex-shrink-0 text-xs" title="队长">
            👑
          </span>
        )}

        {/* 姓名 */}
        <span className="truncate">{staff.name}</span>

        {/* 组号（清理去掉“组”字） */}
        <span className="text-[9px] text-slate-400 font-normal scale-90 origin-left">
          {cleanGroupLabel(staff.groupId)}
        </span>
      </div>

      <div className="flex items-center space-x-0.5 ml-1 flex-shrink-0">
        {!canEdit && <Lock className="w-2.5 h-2.5 text-slate-400" />}
        {hasCustomSlots && (
          <span title="已设精细时段" className="inline-flex items-center">
            <Clock className="w-2.5 h-2.5 text-indigo-600" />
          </span>
        )}
      </div>
    </div>
  );
};
