import { DailySchedule } from '../types';

/**
 * 获取或按前一日全量排班继承生成目标日期的排班
 */
export function getOrInheritSchedule(
  targetDate: string,
  existingSchedules: Record<string, DailySchedule>
): DailySchedule {
  // 如果已存在目标日期的排班，深拷贝后返回
  if (existingSchedules[targetDate]) {
    return JSON.parse(JSON.stringify(existingSchedules[targetDate]));
  }

  // 尝试查找最近的前一天排班记录
  const allDates = Object.keys(existingSchedules).sort();
  const prevDates = allDates.filter(d => d < targetDate);
  const latestPrevDate = prevDates.length > 0 ? prevDates[prevDates.length - 1] : null;

  if (latestPrevDate && existingSchedules[latestPrevDate]) {
    const prevSchedule = existingSchedules[latestPrevDate];
    return {
      date: targetDate,
      assignments: JSON.parse(JSON.stringify(prevSchedule.assignments || {})),
      slotAssignments: JSON.parse(JSON.stringify(prevSchedule.slotAssignments || {})),
      selfExplorePairs: JSON.parse(JSON.stringify(prevSchedule.selfExplorePairs || [])),
    };
  }

  // 否则返回空结构的全新排班记录
  return {
    date: targetDate,
    assignments: {},
    slotAssignments: {},
    selfExplorePairs: []
  };
}
