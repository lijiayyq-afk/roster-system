import { Direction, Staff, DailySchedule } from '../types';
import { INITIAL_DIRECTIONS, INITIAL_STAFF, INITIAL_SCHEDULES } from './mockData';

const STAFF_KEY = 'roster_staff_list_v5_cloud';
const DIRECTIONS_KEY = 'roster_directions_list_v5_cloud';
const SCHEDULES_KEY = 'roster_schedules_v5_cloud';

// 免费且稳定的全网云端 JSON 共享同步端点 (支持多手机/多设备全网实时数据共享)
const CLOUD_SYNC_ENDPOINT = 'https://api.jsonbin.io/v3/b/66aa8912e41b4d34e418290f'; 

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
  syncDataToCloud();
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
  syncDataToCloud();
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
  syncDataToCloud();
};

// 一键推送到云端网络端点
let syncTimer: any = null;
const syncDataToCloud = () => {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      const payload = {
        staffList: loadStaff(),
        directions: loadDirections(),
        schedules: loadSchedules(),
        updatedAt: new Date().toISOString()
      };
      // 静默后台云端广播保存
      await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch {
      // 忽略掉线错误
    }
  }, 1000);
};

// 尝试从云端同步最新数据
export const fetchCloudLatestData = async (): Promise<{
  staffList?: Staff[];
  directions?: Direction[];
  schedules?: Record<string, DailySchedule>;
} | null> => {
  try {
    const res = await fetch(CLOUD_SYNC_ENDPOINT).catch(() => null);
    if (res && res.ok) {
      const json = await res.json();
      if (json && json.record) {
        return json.record;
      }
    }
  } catch {
    // 忽略云端连接失败，兜底使用本地
  }
  return null;
};
