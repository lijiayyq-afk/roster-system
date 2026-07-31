export type ExperienceLevel = 'regular' | 'expert' | 'novice';
export type DirectionCategory = 'scene' | 'branch' | 'list' | 'self_explore' | 'vacation' | 'pending_exit';
export type UserRole = 'manager' | 'leader';
export type ColorHighlightMode = 'none' | 'experience' | 'group';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type ExecutionStatus = 'on_track' | 'off_track' | 'pending';

export interface Staff {
  id: string;
  name: string;
  groupId: string;
  region: string;
  experience: ExperienceLevel;
  entryDate: string;
  notes?: string;
  isExited?: boolean;
}

export interface Direction {
  id: string;
  name: string;
  category: DirectionCategory;
  captainId: string | null;
  order?: number;
  isPinned?: boolean;
  isDeleted?: boolean; // 新增：软删除标记
}

export interface PersonSlotSchedule {
  morning?: string;
  afternoon?: string;
  evening?: string;
}

export interface SelfExplorePair {
  id: string;
  staffIds: string[];
  plannedArea: string;
}

export interface DailySchedule {
  date: string;
  assignments: Record<string, string>;
  slotAssignments: Record<string, PersonSlotSchedule>;
  selfExplorePairs: SelfExplorePair[];
  executionRecords?: Record<string, ExecutionStatus>;
}

export interface AuthUser {
  role: UserRole;
  groupId?: string;
}
