import React from 'react';
import { DailySchedule, Direction, Staff } from '../types';
import { calculateVacationStats } from '../models/VacationModel';
import { CalendarDays, AlertTriangle } from 'lucide-react';

interface VacationViewProps {
  currentDate: string;
  staffList: Staff[];
  directions: Direction[];
  allSchedules: Record<string, DailySchedule>;
}

export const VacationView: React.FC<VacationViewProps> = ({
  currentDate,
  staffList,
  directions,
  allSchedules
}) => {
  const vacationDir = directions.find((d) => d.category === 'vacation');
  const vacationDirId = vacationDir?.id || '';

  const scheduleMap: Record<string, Record<string, string>> = {};
  Object.entries(allSchedules).forEach(([dateStr, sched]) => {
    scheduleMap[dateStr] = sched.assignments;
  });

  const groups = Array.from(new Set(staffList.map((s) => s.groupId))).sort();

  const baseDate = new Date(currentDate);
  const dateColumns: string[] = [];
  for (let offset = -15; offset <= 15; offset++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offset);
    dateColumns.push(d.toISOString().split('T')[0]);
  }

  return (
    <div id="vacation-view-export" className="space-y-4">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-5 h-5 text-amber-600" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">近 30 天组员休假矩阵 (-15日 ~ +15日)</h4>
            <p className="text-xs text-amber-700">监控连续工作天数，合规把控“做六休一”健康度</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center text-emerald-700">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm mr-1 inline-block"></span> 休假
          </span>
          <span className="flex items-center text-blue-700">
            <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-sm mr-1 inline-block"></span> 作业
          </span>
          <span className="flex items-center text-rose-700 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 mr-0.5" /> 连续作业&gt;6天
          </span>
        </div>
      </div>

      {groups.map((groupName) => {
        const groupStaff = staffList.filter((s) => s.groupId === groupName);

        return (
          <div key={groupName} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-3 py-2 bg-slate-800 text-white text-sm font-bold flex items-center justify-between">
              <span>{groupName} 休假规划与健康度</span>
              <span className="text-xs text-slate-300 font-mono">{groupStaff.length} 人</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    <th className="p-2 font-bold w-24 sticky left-0 bg-slate-100 z-10 border-r">组员姓名</th>
                    <th className="p-2 font-bold w-20 text-center">连续作业</th>
                    <th className="p-2 font-bold w-20 text-center">30天休假</th>
                    {dateColumns.map((dateStr) => {
                      const isToday = dateStr === currentDate;
                      return (
                        <th
                          key={dateStr}
                          className={`p-1.5 text-center font-mono text-[10px] min-w-[28px] ${
                            isToday ? 'bg-indigo-600 text-white font-bold' : ''
                          }`}
                        >
                          {dateStr.slice(5)}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {groupStaff.map((staff) => {
                    const stats = calculateVacationStats(
                      staff.id,
                      currentDate,
                      scheduleMap,
                      vacationDirId
                    );

                    return (
                      <tr key={staff.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2 font-semibold text-slate-800 sticky left-0 bg-white border-r">
                          {staff.name}
                        </td>

                        <td className="p-2 text-center">
                          {stats.exceedsSixDaysWork ? (
                            <span className="inline-flex items-center text-rose-600 font-bold px-1.5 py-0.5 bg-rose-50 border border-rose-200 rounded">
                              <AlertTriangle className="w-3 h-3 mr-0.5" />
                              {stats.continuousWorkDays}天
                            </span>
                          ) : (
                            <span className="text-slate-600 font-medium">
                              {stats.continuousWorkDays}天
                            </span>
                          )}
                        </td>

                        <td className="p-2 text-center font-semibold text-emerald-700">
                          {stats.vacationCountIn30Days} 次
                        </td>

                        {dateColumns.map((dateStr) => {
                          const dirId = scheduleMap[dateStr]?.[staff.id];
                          const isVacation = dirId === vacationDirId;
                          const isCurrent = dateStr === currentDate;

                          return (
                            <td
                              key={dateStr}
                              className={`p-1 text-center border-r border-slate-100 ${
                                isCurrent ? 'bg-indigo-50/60' : ''
                              }`}
                            >
                              {isVacation ? (
                                <span className="inline-block w-4 h-4 bg-emerald-500 rounded text-white text-[10px] font-bold leading-4">
                                  休
                                </span>
                              ) : (
                                <span className="inline-block w-4 h-4 bg-slate-100 text-slate-400 rounded text-[10px] leading-4">
                                  班
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
