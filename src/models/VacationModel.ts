export interface VacationStats {
  continuousWorkDays: number;
  exceedsSixDaysWork: boolean;
  vacationCountIn30Days: number;
}

/**
 * 计算指定人员在以 baseDate 为中心前后 30 天 (-15天到 +15天) 的休假与连续加班天数
 */
export function calculateVacationStats(
  staffId: string,
  baseDateStr: string,
  schedules: Record<string, Record<string, string>>, // date -> (staffId -> directionId)
  vacationDirectionId: string
): VacationStats {
  const baseDate = new Date(baseDateStr);

  // 1. 计算 -15 天至 +15 天范围内的休假次数
  let vacationCount = 0;
  for (let offset = -15; offset <= 15; offset++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offset);
    const dateStr = d.toISOString().split('T')[0];

    const dayAssignments = schedules[dateStr];
    if (dayAssignments && dayAssignments[staffId] === vacationDirectionId) {
      vacationCount++;
    }
  }

  // 2. 计算截至 baseDate 的连续工作天数（往前追溯）
  let continuousWork = 0;
  let checkDate = new Date(baseDate);

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayAssignments = schedules[dateStr];

    // 如果当天没有明确安排，或者当天排班是休假，终止连续计数
    if (!dayAssignments || dayAssignments[staffId] === undefined || dayAssignments[staffId] === vacationDirectionId) {
      break;
    }

    continuousWork++;
    // 往回查一天
    checkDate.setDate(checkDate.getDate() - 1);

    // 最多追溯 30 天
    if (continuousWork >= 30) break;
  }

  return {
    continuousWorkDays: continuousWork,
    exceedsSixDaysWork: continuousWork > 6,
    vacationCountIn30Days: vacationCount
  };
}
