import { DailySchedule, Direction, Staff } from '../types';
import { INITIAL_DIRECTIONS, INITIAL_SCHEDULES, INITIAL_STAFF } from './mockData';

const STORAGE_KEYS = {
  STAFF: 'roster_staff_v1',
  DIRECTIONS: 'roster_directions_v1',
  SCHEDULES: 'roster_schedules_v1',
  AUTH: 'roster_auth_v1',
};

export function loadStaff(): Staff[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STAFF);
    return data ? JSON.parse(data) : INITIAL_STAFF;
  } catch (e) {
    console.error('加载人员数据失败', e);
    return INITIAL_STAFF;
  }
}

export function saveStaff(staff: Staff[]): void {
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
}

export function loadDirections(): Direction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DIRECTIONS);
    return data ? JSON.parse(data) : INITIAL_DIRECTIONS;
  } catch (e) {
    console.error('加载方向数据失败', e);
    return INITIAL_DIRECTIONS;
  }
}

export function saveDirections(directions: Direction[]): void {
  localStorage.setItem(STORAGE_KEYS.DIRECTIONS, JSON.stringify(directions));
}

export function loadSchedules(): Record<string, DailySchedule> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return data ? JSON.parse(data) : INITIAL_SCHEDULES;
  } catch (e) {
    console.error('加载排班历史失败', e);
    return INITIAL_SCHEDULES;
  }
}

export function saveSchedules(schedules: Record<string, DailySchedule>): void {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
}
