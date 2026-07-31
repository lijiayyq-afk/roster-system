import { describe, it, expect } from 'vitest';
import { getOrInheritSchedule } from '../models/ScheduleModel';
import { DailySchedule } from '../types';

describe('Schedule Inheritance System', () => {
  it('应准确从前一日继承排班分配逻辑', () => {
    const existingSchedules: Record<string, DailySchedule> = {
      '2026-07-30': {
        date: '2026-07-30',
        assignments: {
          'staff-1': 'dir-b1',
          'staff-2': 'dir-explore'
        },
        slotAssignments: {},
        selfExplorePairs: [
          { id: 'p1', staff1Id: 'staff-2', staff2Id: 'staff-3', plannedArea: '园区星海街' }
        ]
      }
    };

    const targetDate = '2026-07-31';
    const inherited = getOrInheritSchedule(targetDate, existingSchedules);

    expect(inherited.date).toBe('2026-07-31');
    expect(inherited.assignments['staff-1']).toBe('dir-b1');
    expect(inherited.assignments['staff-2']).toBe('dir-explore');
  });

  it('如果历史无排班，应返回空的全新排班表', () => {
    const inherited = getOrInheritSchedule('2026-07-31', {});
    expect(inherited.date).toBe('2026-07-31');
    expect(Object.keys(inherited.assignments).length).toBe(0);
  });
});
