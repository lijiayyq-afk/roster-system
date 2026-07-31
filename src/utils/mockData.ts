import { Direction, Staff, DailySchedule } from '../types';

export const INITIAL_DIRECTIONS: Direction[] = [
  // 合作方场景 (Scenes)
  { id: 'dir-s1', name: '万达广场场景', category: 'scene', captainId: 'staff-1' },
  { id: 'dir-s2', name: '九方购物中心场景', category: 'scene', captainId: null },
  { id: 'dir-s3', name: '汽车城展厅场景', category: 'scene', captainId: 'staff-5' },
  { id: 'dir-s4', name: '招商会中心场景', category: 'scene', captainId: null },
  { id: 'dir-s5', name: '高新区数码港场景', category: 'scene', captainId: null },
  { id: 'dir-s6', name: '金鹰天地场景', category: 'scene', captainId: null },
  
  // 厅堂支行 (Branches)
  { id: 'dir-b1', name: '昆山支行厅堂', category: 'branch', captainId: 'staff-2' },
  { id: 'dir-b2', name: '常熟支行厅堂', category: 'branch', captainId: null },
  { id: 'dir-b3', name: '太仓支行厅堂', category: 'branch', captainId: null },
  { id: 'dir-b4', name: '园区支行厅堂', category: 'branch', captainId: null },
  { id: 'dir-b5', name: '姑苏支行厅堂', category: 'branch', captainId: null },

  // 名单/自拓/休假/待离职
  { id: 'dir-list', name: '线上名单收件', category: 'list', captainId: null },
  { id: 'dir-explore', name: '自助寻找获客(自拓)', category: 'self_explore', captainId: null },
  { id: 'dir-vacation', name: '休假(不作业)', category: 'vacation', captainId: null },
  { id: 'dir-exit', name: '待离职/已淘汰', category: 'pending_exit', captainId: null },
];

export const INITIAL_STAFF: Staff[] = [
  { id: 'staff-1', name: '张强', groupId: '1组', region: '昆山', experience: 'expert', entryDate: '2024-03-15', notes: '沟通能力强，擅长场景获客大户' },
  { id: 'staff-2', name: '李明', groupId: '1组', region: '昆山', experience: 'regular', entryDate: '2025-02-10', notes: '熟悉厅堂业务流程' },
  { id: 'staff-3', name: '王芳', groupId: '1组', region: '常熟', experience: 'novice', entryDate: '2026-04-10', notes: '新手，需配合老带新安排' },
  { id: 'staff-4', name: '赵伟', groupId: '1组', region: '太仓', experience: 'regular', entryDate: '2025-06-01' },
  
  { id: 'staff-5', name: '陈杰', groupId: '2组', region: '常熟', experience: 'expert', entryDate: '2023-11-20', notes: '汽车城场景负责人' },
  { id: 'staff-6', name: '孙梅', groupId: '2组', region: '常熟', experience: 'regular', entryDate: '2025-08-15' },
  { id: 'staff-7', name: '周涛', groupId: '2组', region: '工业园区', experience: 'novice', entryDate: '2026-06-01', notes: '试用期内表现优异' },

  { id: 'staff-8', name: '吴磊', groupId: '3组', region: '太仓', experience: 'expert', entryDate: '2024-01-10' },
  { id: 'staff-9', name: '郑敏', groupId: '3组', region: '姑苏区', experience: 'regular', entryDate: '2025-09-01' },
  { id: 'staff-10', name: '刘洋', groupId: '3组', region: '工业园区', experience: 'novice', entryDate: '2026-05-15', notes: '协助线上名单收件' },
  { id: 'staff-11', name: '徐峰', groupId: '3组', region: '姑苏区', isPendingExit: true, experience: 'regular', entryDate: '2024-08-01', notes: '离职手续办理中' }
];

export const INITIAL_SCHEDULES: Record<string, DailySchedule> = {
  '2026-07-30': {
    date: '2026-07-30',
    assignments: {
      'staff-1': 'dir-s1',
      'staff-2': 'dir-b1',
      'staff-3': 'dir-s1',
      'staff-4': 'dir-list',
      'staff-5': 'dir-s3',
      'staff-6': 'dir-explore',
      'staff-7': 'dir-explore',
      'staff-8': 'dir-b3',
      'staff-9': 'dir-vacation',
      'staff-10': 'dir-list',
      'staff-11': 'dir-exit',
    },
    slotAssignments: {
      'staff-1': { morning: 'dir-s1', afternoon: 'dir-s1', evening: 'dir-s2' }
    },
    selfExplorePairs: [
      { id: 'pair-101', staffIds: ['staff-6', 'staff-7'], plannedArea: '常熟高新区万达外围' }
    ]
  }
};
