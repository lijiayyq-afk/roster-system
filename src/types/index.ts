// 经验级别
export type ExperienceLevel = 'novice' | 'regular' | 'expert';

// 作业方向分类
export type DirectionCategory = 'scene' | 'branch' | 'list' | 'self_explore' | 'vacation' | 'pending_exit';

// 用户角色
export type UserRole = 'manager' | 'leader';

// 时段定义
export type TimeSlot = 'morning' | 'afternoon' | 'evening';

// 时段分配详情
export interface PersonSlotSchedule {
  morning?: string;   // Direction/Scene ID
  afternoon?: string; // Direction/Scene ID
  evening?: string;   // Direction/Scene ID
}

// 人员定义
export interface Staff {
  id: string;
  name: string;
  groupId: string;         // 小组：如 "1组", "2组"
  region: string;          // 区域：如 "昆山", "常熟", "太仓", "工业园区", "姑苏区"
  experience: ExperienceLevel;
  entryDate: string;       // 入职日期：YYYY-MM-DD
  isPendingExit?: boolean; // 是否待离职
  notes?: string;          // 个人备注
}

// 作业方向/场景/支行定义
export interface Direction {
  id: string;
  name: string;
  category: DirectionCategory;
  captainId?: string | null;  // 队长 ID
}

// 自拓搭档与作业区域安排
export interface SelfExplorePair {
  id: string;
  staffIds: string[];         // 1-2 人搭档
  plannedArea: string;       // 规划作业区域
}

// 某日排班记录
export interface DailySchedule {
  date: string;               // 日期 YYYY-MM-DD
  // 人员到主方向的映射 (staffId -> directionId)
  assignments: Record<string, string>;
  // 精细时段分配 (staffId -> PersonSlotSchedule)
  slotAssignments: Record<string, PersonSlotSchedule>;
  // 自拓组合
  selfExplorePairs: SelfExplorePair[];
}

// 系统角色信息
export interface AuthUser {
  role: UserRole;
  groupId?: string; // 组长绑定的组ID
}
