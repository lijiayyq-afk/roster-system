// 经验级别
export type ExperienceLevel = 'novice' | 'regular' | 'expert';

// 显色高亮模式: none(无显色/默认干净), experience(按经验显色), group(按小组显色)
export type ColorHighlightMode = 'none' | 'experience' | 'group';

// 时段执行履约状态: 'on_track' (已到位/按计划执行), 'off_track' (偏离/未到位), 'pending' (待核实)
export type ExecutionStatus = 'on_track' | 'off_track' | 'pending';

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
  assignments: Record<string, string>;
  slotAssignments: Record<string, PersonSlotSchedule>;
  selfExplorePairs: SelfExplorePair[];
  executionRecords?: Record<string, ExecutionStatus>; // 格式: "staffId_slot" -> ExecutionStatus
}

// 系统角色信息
export interface AuthUser {
  role: UserRole;
  groupId?: string;
}
