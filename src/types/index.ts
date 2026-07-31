export type Role = 'manager' | 'leader';

export interface AuthUser {
  role: Role;
  groupId?: string; // 如果是队长/组长，指定所属组别，例如 "20501组"
}

export type ExperienceLevel = 'novice' | 'expert' | 'regular';

export interface Staff {
  id: string;
  name: string;
  groupId: string; // 隶属组别
  region?: string; // 驻扎/常住区域，例如 "昆山"、"常熟"
  experience: ExperienceLevel; // 经验等级
  entryDate: string; // 入职日期 YYYY-MM-DD
  isExited?: boolean; // 是否离职/淘汰
  notes?: string; // 组长备注信息
}

export type DirectionCategory = 
  | 'scene'           // 合作方场景
  | 'branch'          // 厅堂支行
  | 'list'            // 线上名单收件
  | 'self_explore'    // 自助寻找获客（自拓）
  | 'merge_enterprise'// 融合进企 (新增)
  | 'car_loan'        // 车贷 (新增)
  | 'vacation'        // 休假（不作业）
  | 'pending_exit';   // 待离职/已淘汰

export interface Direction {
  id: string;
  name: string;
  category: DirectionCategory;
  captainId: string | null; // 队长/负责人 Staff ID
  isPinned?: boolean;       // 是否置顶卡片
  isDeleted?: boolean;      // 是否软删除
}

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface PersonSlotSchedule {
  morning?: string;   // 上午安排的 Direction ID
  afternoon?: string; // 下午安排的 Direction ID
  evening?: string;   // 晚上安排的 Direction ID
}

export interface SelfExplorePair {
  id: string;
  staff1Id: string;
  staff2Id: string;
  plannedArea?: string; // 规划作业区域，如“工业园区星海街”
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD
  assignments: Record<string, string>; // staffId -> directionId (全天默认/主安排)
  slotAssignments: Record<string, PersonSlotSchedule>; // staffId -> 时段明细安排
  selfExplorePairs: SelfExplorePair[]; // 自拓搭档配对
}

export type ColorHighlightMode = 'none' | 'group' | 'experience';

export type ExecutionStatus = 'pending' | 'success' | 'failed';
