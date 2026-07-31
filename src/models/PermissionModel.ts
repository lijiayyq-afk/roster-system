import { AuthUser, Staff } from '../types';

export const canEditStaff = (authUser: AuthUser, targetStaff: Staff): boolean => {
  if (authUser.role === 'manager') {
    return true;
  }
  if (authUser.role === 'leader' && authUser.groupId) {
    return targetStaff.groupId === authUser.groupId;
  }
  return false;
};

// 组权纯净隔离：当为组长身份时，全站仅展示本组人员；当为经理时展示全员
export const filterStaffByAuthUser = (staffList: Staff[], authUser: AuthUser): Staff[] => {
  if (authUser.role === 'manager' || !authUser.groupId) {
    return staffList;
  }
  return staffList.filter((s) => s.groupId === authUser.groupId);
};
