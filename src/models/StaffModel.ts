import { Staff } from '../types';

/**
 * 校验新手是否入职满 90 天
 */
export function checkExperienceUpgrade(staff: Staff, currentDate: Date = new Date()): boolean {
  if (staff.experience !== 'novice' || !staff.entryDate) {
    return false;
  }

  const entry = new Date(staff.entryDate);
  const diffTime = currentDate.getTime() - entry.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 90;
}

/**
 * 人员排序：若指定了队长 ID，队长置顶在列表第 1 位
 */
export function sortStaffWithCaptain(staffList: Staff[], captainId?: string | null): Staff[] {
  if (!captainId) {
    return [...staffList];
  }

  const captain = staffList.find(s => s.id === captainId);
  const others = staffList.filter(s => s.id !== captainId);

  return captain ? [captain, ...others] : staffList;
}
