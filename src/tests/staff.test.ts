import { describe, it, expect } from 'vitest';
import { Staff } from '../types';
import { checkExperienceUpgrade, sortStaffWithCaptain } from '../models/StaffModel';

describe('StaffModel - 人员转正与排序算法测试', () => {
  it('应正确判断新手入职满90天可升级提醒', () => {
    const today = new Date('2026-07-31');

    const newStaff: Staff = {
      id: 'p1',
      name: '张三',
      groupId: '1组',
      region: '昆山',
      experience: 'novice',
      entryDate: '2026-07-01' // 入职30天
    };

    const maturedStaff: Staff = {
      id: 'p2',
      name: '李四',
      groupId: '1组',
      region: '常熟',
      experience: 'novice',
      entryDate: '2026-04-01' // 入职120天 (>90天)
    };

    expect(checkExperienceUpgrade(newStaff, today)).toBe(false);
    expect(checkExperienceUpgrade(maturedStaff, today)).toBe(true);
  });

  it('队长应自动置顶排列在场景最前方', () => {
    const staffList: Staff[] = [
      { id: 'p1', name: '队员A', groupId: '1组', region: '昆山', experience: 'regular', entryDate: '2025-01-01' },
      { id: 'p2', name: '队长B', groupId: '1组', region: '昆山', experience: 'expert', entryDate: '2025-01-01' },
      { id: 'p3', name: '队员C', groupId: '2组', region: '太仓', experience: 'novice', entryDate: '2025-01-01' },
    ];

    const captainId = 'p2';
    const sorted = sortStaffWithCaptain(staffList, captainId);

    expect(sorted[0].id).toBe('p2');
    expect(sorted[0].name).toBe('队长B');
  });
});
