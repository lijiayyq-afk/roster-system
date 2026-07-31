-- 人员表
CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    group_id TEXT NOT NULL,
    region TEXT NOT NULL,
    experience TEXT NOT NULL,
    entry_date TEXT NOT NULL,
    is_pending_exit INTEGER DEFAULT 0,
    notes TEXT
);

-- 方向/场景/厅堂表
CREATE TABLE IF NOT EXISTS directions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    captain_id TEXT
);

-- 每日排班记录表 (按日期储存快照)
CREATE TABLE IF NOT EXISTS daily_schedules (
    schedule_date TEXT PRIMARY KEY,
    assignments_json TEXT NOT NULL,      -- 人员主方向分配 JSON
    slot_assignments_json TEXT NOT NULL, -- 精细时段分配 JSON
    self_explore_pairs_json TEXT NOT NULL-- 自拓搭档分配 JSON
);
