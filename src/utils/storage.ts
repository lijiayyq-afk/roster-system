import { Direction, Staff, DailySchedule } from '../types';
import { INITIAL_DIRECTIONS, INITIAL_STAFF, INITIAL_SCHEDULES } from './mockData';

const STORAGE_KEYS = {
  STAFF: 'roster_staff_v5_cloud',
  DIRECTIONS: 'roster_directions_v5_cloud',
  SCHEDULES: 'roster_schedules_v5_cloud'
};

// 自动纠偏与清洗方向名称函数
export const sanitizeDirections = (dirs: Direction[]): Direction[] => {
  return dirs.map(d => {
    let name = d.name;
    if (d.category === 'self_explore' || d.id === 'dir-explore' || name.includes('自拓')) {
      name = '自拓';
    } else if (d.category === 'list' || d.id === 'dir-list' || name.includes('名单')) {
      name = '名单';
    } else if (d.category === 'branch' || d.id === 'dir-b1' || name.includes('厅堂')) {
      name = '厅堂';
    } else if (d.category === 'vacation' || d.id === 'dir-vacation' || name.includes('休假')) {
      name = '休假';
    } else if (d.category === 'pending_exit' || d.id === 'dir-exit' || name.includes('离职')) {
      name = '待离职';
    }
    return { ...d, name };
  });
};

export const loadStaff = (): Staff[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!raw) {
      saveStaff(INITIAL_STAFF);
      return INITIAL_STAFF;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STAFF;
  }
};

export const saveStaff = (staffList: Staff[]) => {
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  syncCloudData('staffList', staffList);
};

export const loadDirections = (): Direction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIRECTIONS);
    if (!raw) {
      const sanitized = sanitizeDirections(INITIAL_DIRECTIONS);
      saveDirections(sanitized);
      return sanitized;
    }
    const parsed = JSON.parse(raw);
    return sanitizeDirections(parsed);
  } catch {
    const sanitized = sanitizeDirections(INITIAL_DIRECTIONS);
    return sanitized;
  }
};

export const saveDirections = (directions: Direction[]) => {
  const sanitized = sanitizeDirections(directions);
  localStorage.setItem(STORAGE_KEYS.DIRECTIONS, JSON.stringify(sanitized));
  syncCloudData('directions', sanitized);
};

export const loadSchedules = (): Record<string, DailySchedule> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (!raw) {
      saveSchedules(INITIAL_SCHEDULES);
      return INITIAL_SCHEDULES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SCHEDULES;
  }
};

export const saveSchedules = (schedules: Record<string, DailySchedule>) => {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  syncCloudData('schedules', schedules);
};

// 云端 API 同步封装
const CLOUD_API_ENDPOINT = 'https://roster-system.pages.dev/api/kv-sync';

async function syncCloudData(key: string, data: any) {
  try {
    await fetch(CLOUD_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data })
    });
  } catch {
    // 静默兜底
  }
}

export async function fetchCloudLatestData(): Promise<{
  staffList?: Staff[];
  directions?: Direction[];
  schedules?: Record<string, DailySchedule>;
} | null> {
  try {
    const res = await fetch(`${CLOUD_API_ENDPOINT}?t=${Date.now()}`);
    if (res.ok) {
      const cloudData = await res.json();
      if (cloudData.directions) {
        cloudData.directions = sanitizeDirections(cloudData.directions);
      }
      return cloudData;
    }
  } catch {
    // 静态离线
  }
  return null;
}
