# 智能时段人员排班系统 (Smart Roster System)

基于 React 18 + TypeScript + Vite + Tailwind CSS 构建的移动端优先、可视化人员作业规划与排班管理系统。

---

## 🌟 核心特性与亮点

### 1. 📱 移动端优先 UX (Mobile-First Experience)
- **手势与触控交互**：基于 SortableJS 的触屏长按拖拽，支持手机/平板顺畅卡片调度。
- **底部抽屉 (Bottom Sheet)**：点击人员卡片即刻弹出移动端底部抽屉，支持快捷指派队长、切换方向、精细设定三时段（上午/下午/晚上）及编辑查看个人备注。

### 2. 👑 队长标识与自动置顶
- 支持将任意成员设置为合作方场景或厅堂支行的队长。
- 队长卡片高亮金黄“队长”勋章，并在场景内**自动置顶**排列在第 1 位。

### 3. 🎨 界面简约与显色控制
- 默认保持极简统一的干净卡片风格（避免界面视觉杂乱）。
- 提供**“经验显色: 开/关”**切换开关，开启后以柔和标签展现`高手`、`新手`、`一般人`，新手满 90 天自动提醒转正。

### 4. 🔄 跨日排班自动继承
- 规划次日排班时，系统**默认自动继承前一日的全量安排**（场景、队长、时段）。
- 组长与经理只需在线进行增量微调，3 秒内完成次日排班。

### 5. 🛡️ 角色与权限隔离 (RBAC)
- **经理 (Manager)**：拥有全局权限，可调整全员排班、维护方向场景与人员档案。
- **组长 (Team Leader)**：绑定小组，仅可调整**本组组员**，非本组组员保持只读锁定状态。

### 6. 📊 7 大多维视角与 30 天做六休一预警
- **默认看板**：全方向拖拽看板
- **场景视角**：聚焦合作方场景
- **厅堂视角**：聚焦各支行网点
- **名单视角**：线上名单收件人员与区域
- **自拓视角**：自拓搭档 (1-2人) 及规划作业区域
- **小组视角**：从组别视角聚合成员走向
- **休假视角 (30天)**：展示 `-15日 ~ +15日` 滚动日历，监测连续工作天数，触发“做六休一”预警。

### 7. 📤 表格与图片导出
- 一键导出 Excel (`.xlsx`) 排班数据表格。
- 基于 `html2canvas` 一键导出特定视图的高清 PNG 图片。

---

## 📁 模块化架构设计 (Modular Architecture)

项目采用高度解耦的模块化结构设计：

```
src/
├── types/                 # 数据类型与接口模块 (Staff, Direction, DailySchedule, AuthUser)
├── models/                # 业务模型与核心算法模块 (TDD驱动)
│   ├── StaffModel.ts      # 人员转正判定与队长置顶排序算法
│   ├── PermissionModel.ts # 组长/经理 RBAC 权限控制算法
│   ├── ScheduleModel.ts   # 跨日排班继承算法
│   └── VacationModel.ts   # 30天做六休一与连续工作日计算
├── services/ & utils/    # 服务与工具模块
│   ├── storage.ts         # 本地与云端持久化存储模块
│   ├── exportUtil.ts      # Excel 与 PNG 图片导出模块
│   └── mockData.ts        # 初始示例数据模块
├── components/            # UI 独立解耦组件模块
│   ├── Header.tsx         # 顶部控制栏与身份/显色/日期切换
│   ├── ViewTabs.tsx       # 7大多视角选择选项卡
│   ├── PersonCard.tsx font# 紧凑人员卡片与队长勋章
│   ├── BottomSheet.tsx    # 移动端底部抽屉弹窗
│   ├── BoardView.tsx      # 拖拽看板主视图
│   ├── GroupView.tsx      # 小组视角视图
│   ├── VacationView.tsx   # 30天休假与健康度视图
│   ├── DirectionModal.tsx # 方向/场景管理模态框
│   └── StaffModal.tsx     # 人员档案管理模态框
└── tests/                 # Vitest 单元测试模块
```

---

## 🛠️ 本地开发与测试

### 安装依赖
```bash
npm install
```

### 启动本地开发服务
```bash
npm run dev
```
打开浏览器访问 `http://localhost:5173`。

### 运行 Vitest 单元测试
```bash
npm run test
```

### 项目打包构建
```bash
npm run build
```

---

## 🚀 部署指引 (Cloudflare Pages + GitHub CI/CD)

1. 将代码 Push 到 GitHub 仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
3. 进入 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
4. 选择对应的 GitHub 仓库 `roster-system`。
5. 构建配置如下：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. 点击 **Save and Deploy**，Cloudflare Pages 将在每次代码提交时自动进行构建部署并上线！
