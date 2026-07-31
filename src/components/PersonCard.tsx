import React from 'react';
import { ColorHighlightMode, PersonSlotSchedule, Staff } from '../types';
import { Crown, AlertCircle } from 'lucide-react';

interface PersonCardProps {
  staff: Staff;
  isCaptain?: boolean;
  canEdit?: boolean;
  colorMode: ColorHighlightMode;
  slotSchedule?: PersonSlotSchedule;
  onClickCard?: (staff: Staff) => void;
}

export const formatGroupMinimal = (groupId: string): string => {
  const match = groupId.match(/\d+/);
  return match ? match[0].slice(-2) : groupId;
};

// 提取颜色的调色板
const GROUP_PASTEL_COLORS: Record<string, string> = {
  '01': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  '03': 'bg-sky-100 text-sky-800 border-sky-300',
  '04': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  '05': 'bg-purple-100 text-purple-800 border-purple-300',
  '11': 'bg-amber-100 text-amber-800 border-amber-300',
  '71': 'bg-rose-100 text-rose-800 border-rose-300'
};

export const PersonCard: React.FC<PersonCardProps> = ({
  staff,
  isCaptain,
  canEdit = true,
  colorMode,
  slotSchedule,
  onClickCard
}) => {
  const groupTag = formatGroupMinimal(staff.groupId);
  const isNovice = staff.experience === 'novice';
  const isExpert = staff.experience === 'expert';

  const groupColorClass = GROUP_PASTEL_COLORS[groupTag] || 'bg-slate-100 text-slate-700 border-slate-300';

  let colorClasses = 'bg-white text-slate-800 border-slate-200 hover:border-indigo-400';

  if (colorMode === 'group') {
    colorClasses = `${groupColorClass} hover:opacity-90`;
  } else if (colorMode === 'experience') {
    if (isNovice) {
      colorClasses = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold';
    } else if (isExpert) {
      colorClasses = 'bg-purple-50 text-purple-900 border-purple-300 font-bold';
    }
  }

  const hasSlotDiff = slotSchedule && (slotSchedule.morning || slotSchedule.afternoon || slotSchedule.evening);

  return (
    <div
      data-id={staff.id}
      onClick={() => onClickCard && onClickCard(staff)}
      style={{ touchAction: 'pan-y' }}
      className={`group relative flex items-center h-7 px-2 py-0.5 rounded-lg border text-xs font-semibold shadow-3xs cursor-grab active:cursor-grabbing transition-all select-none ${colorClasses} ${
        !canEdit ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      {/* 队长标识 */}
      {isCaptain && (
        <Crown className="w-3 h-3 text-amber-500 mr-1 flex-shrink-0 fill-amber-400" />
      )}

      {/* 姓名 */}
      <span className="truncate max-w-[70px]">{staff.name}</span>

      {/* 极简双字组号标记 */}
      <span className="ml-1 text-[9px] px-1 py-0.1 bg-black/10 text-slate-700 rounded font-mono font-bold flex-shrink-0">
        {groupTag}
      </span>

      {/* 新手绿点/高手星标 */}
      {isNovice && colorMode !== 'experience' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 flex-shrink-0" title="新手(<90天)"></span>
      )}

      {/* 进阶时段微型差异提示点 */}
      {hasSlotDiff && (
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5 animate-pulse flex-shrink-0" title="包含时段排班"></span>
      )}
    </div>
  );
};
