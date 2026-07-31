import { AuthUser, Staff } from '../types';

/**
 * 校验用户是否有权限编辑该人员
 */
export function canEditStaff(authUser: AuthUser, staff: Staff): boolean {
  if (authUser.role === 'manager') {
    return true;
  }

  if (authUser.role === 'leader') {
    return authUser.groupId === staff.groupId;
  }

  return false;
}
