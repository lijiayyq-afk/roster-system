import { Direction, Staff, DailySchedule } from '../types';
import { INITIAL_DIRECTIONS, INITIAL_STAFF, INITIAL_SCHEDULES } from './mockData';

const STAFF_KEY = 'roster_staff_list_v4_clean';
const DIRECTIONS_KEY = 'roster_directions_list_v4_clean';
const SCHEDULES_KEY = 'roster_schedules_v4_clean';

export const loadStaff = (): Staff[] => {
  const data = localStorage.getItem(STAFF_KEY);
  if (!data) {
    saveStaff(INITIAL_STAFF);
    return INITIAL_STAFF;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_STAFF;
  }
};

export const saveStaff = (staffList: Staff[]): void => {
  localStorage.setItem(STAFF_KEY, JSON.stringify(staffList));
};

export const loadDirections = (): Direction[] => {
  const data = localStorage.getItem(DIRECTIONS_KEY);
  if (!data) {
    saveDirections(INITIAL_DIRECTIONS);
    return INITIAL_DIRECTIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_DIRECTIONS;
  }
};

export const saveDirections = (directions: Direction[]): void => {
  localStorage.setItem(DIRECTIONS_KEY, JSON.stringify(directions));
};

export const loadSchedules = (): Record<string, DailySchedule> => {
  const data = localStorage.getItem(SCHEDULES_KEY);
  if (!data) {
    saveSchedules(INITIAL_SCHEDULES);
    return INITIAL_SCHEDULES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SCHEDULES;
  }
};

export const saveSchedules = (schedules: Record<string, DailySchedule>): void => {
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
};
