import { describe, it, expect } from 'vitest';
import { DailySchedule } from '../types';
import { getOrInheritSchedule } from '../models/ScheduleModel';

describe('ScheduleModel - 跨日继承排班算法测试', () => {
  it('若次日无排班数据，自动继承前一日全量排班', () => {
    const prevDaySchedule: DailySchedule = {
      date: '2026-07-31',
      assignments: {
        'p1': 'd-scene-1',
        'p2': 'd-branch-1'
      },
      slotAssignments: {
        'p1': { morning: 'd-scene-1', afternoon: 'd-scene-2' }
      },
      selfExplorePairs: [
        { id: 'pair-1', staffIds: ['p3', 'p4'], plannedArea: '城东商业街' }
      ]
    };

    const existingSchedules: Record<string, DailySchedule> = {
      '2026-07-31': prevDaySchedule
    };

    const targetDate = '2026-08-01';
    const result = getOrInheritSchedule(targetDate, existingSchedules);

    expect(result.date).toBe('2026-08-01');
    expect(result.assignments['p1']).toBe('d-scene-1');
    expect(result.assignments['p2']).toBe('d-branch-1');
    expect(result.slotAssignments['p1'].afternoon).toBe('d-scene-2');
    expect(result.selfExplorePairs[0].plannedArea).toBe('城东商业街');
  });

  it('修改继承后的次日排班不影响前一日快照', () => {
    const prevDaySchedule: DailySchedule = {
      date: '2026-07-31',
      assignments: { 'p1': 'd-scene-1' },
      slotAssignments: {},
      selfExplorePairs: []
    };

    const existingSchedules: Record<string, DailySchedule> = {
      '2026-07-31': prevDaySchedule
    };

    const inherited = getOrInheritSchedule('2026-08-01', existingSchedules);
    inherited.assignments['p1'] = 'd-vacation'; // 修改次日分配

    expect(existingSchedules['2026-07-31'].assignments['p1']).toBe('d-scene-1');
  });
});
