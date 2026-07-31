import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { DailySchedule, Direction, Staff } from '../types';

/**
 * 导出当前排班表为 Excel 文件
 */
export function exportScheduleToExcel(
  schedule: DailySchedule,
  staffList: Staff[],
  directions: Direction[]
) {
  const dirMap = new Map(directions.map(d => [d.id, d.name]));

  const rows = staffList.map(staff => {
    const mainDirId = schedule.assignments[staff.id];
    const mainDirName = mainDirId ? dirMap.get(mainDirId) || '未安排' : '未安排';

    const slot = schedule.slotAssignments[staff.id];
    const morningName = slot?.morning ? dirMap.get(slot.morning) || '' : mainDirName;
    const afternoonName = slot?.afternoon ? dirMap.get(slot.afternoon) || '' : mainDirName;
    const eveningName = slot?.evening ? dirMap.get(slot.evening) || '' : mainDirName;

    return {
      '姓名': staff.name,
      '小组': staff.groupId,
      '区域': staff.region,
      '经验': staff.experience === 'expert' ? '高手' : staff.experience === 'novice' ? '新手' : '一般人',
      '全天安排': mainDirName,
      '上午安排': morningName,
      '下午安排': afternoonName,
      '晚上安排': eveningName,
      '备注': staff.notes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '明日排班表');

  const fileName = `排班安排表_${schedule.date}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * 截取 DOM 元素导出为 PNG 图片
 */
export async function exportElementToImage(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('未找到要导出的视图元素');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#f8fafc'
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}
