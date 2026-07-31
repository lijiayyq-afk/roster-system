import { describe, it, expect } from 'vitest';
import { calculateVacationStats } from '../models/VacationModel';

describe('VacationModel - 做六休一与30天休假状态统计测试', () => {
  it('正确统计指定人员在前后30天（-15天至+15天）的休假频次与连续工作日', () => {
    const todayStr = '2026-07-31';

    // 模拟连续7天工作的排班记录
    const schedules: Record<string, Record<string, string>> = {
      '2026-07-25': { 'p1': 'd-scene-1' },
      '2026-07-26': { 'p1': 'd-scene-1' },
      '2026-07-27': { 'p1': 'd-scene-1' },
      '2026-07-28': { 'p1': 'd-scene-1' },
      '2026-07-29': { 'p1': 'd-scene-1' },
      '2026-07-30': { 'p1': 'd-scene-1' },
      '2026-07-31': { 'p1': 'd-scene-1' },
      '2026-08-01': { 'p1': 'd-vacation' }, // 第8天休息
    };

    const stats = calculateVacationStats('p1', todayStr, schedules, 'd-vacation');

    expect(stats.continuousWorkDays).toBe(7);
    expect(stats.exceedsSixDaysWork).toBe(true); // 触发现六休一预警
    expect(stats.vacationCountIn30Days).toBe(1);
  });
});
