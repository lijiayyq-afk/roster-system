import { describe, it, expect } from 'vitest';
import { AuthUser, Staff } from '../types';
import { canEditStaff } from '../models/PermissionModel';

describe('PermissionModel - 组长与经理权限控制测试', () => {
  const staffInGroup1: Staff = {
    id: 'p1',
    name: '张三',
    groupId: '1组',
    region: '昆山',
    experience: 'regular',
    entryDate: '2025-01-01'
  };

  const staffInGroup2: Staff = {
    id: 'p2',
    name: '李四',
    groupId: '2组',
    region: '常熟',
    experience: 'expert',
    entryDate: '2025-01-01'
  };

  it('经理拥有全员修改权限', () => {
    const managerUser: AuthUser = { role: 'manager' };
    expect(canEditStaff(managerUser, staffInGroup1)).toBe(true);
    expect(canEditStaff(managerUser, staffInGroup2)).toBe(true);
  });

  it('1组组长仅允许修改1组人员，阻止修改2组人员', () => {
    const leaderUser: AuthUser = { role: 'leader', groupId: '1组' };
    expect(canEditStaff(leaderUser, staffInGroup1)).toBe(true);
    expect(canEditStaff(leaderUser, staffInGroup2)).toBe(false);
  });
});
