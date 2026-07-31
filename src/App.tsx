import React, { useState, useEffect } from 'react';
import { AuthUser, ColorHighlightMode, DailySchedule, Direction, DirectionCategory, ExecutionStatus, PersonSlotSchedule, Staff, TimeSlot } from './types';
import { fetchCloudLatestData, loadDirections, loadSchedules, loadStaff, saveDirections, saveSchedules, saveStaff } from './utils/storage';
import { getOrInheritSchedule } from './models/ScheduleModel';
import { Header } from './components/Header';
import { ViewTabs, ViewType } from './components/ViewTabs';
import { BoardView } from './components/BoardView';
import { SceneView } from './components/SceneView';
import { ListView } from './components/ListView';
import { VacationView } from './components/VacationView';
import { BottomSheet } from './components/BottomSheet';
import { DirectionModal } from './components/DirectionModal';
import { StaffModal } from './components/StaffModal';
import { exportElementToImage, exportScheduleToExcel } from './utils/exportUtil';

const GROUPS = ['20501组', '20503组', '20504组', '20505组', '20511组', '20571组'];
const REGIONS = ['待定', '昆山', '常熟', '太仓', '工业园区', '姑苏区', '吴江区', '相城区'];

export const App: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState<string>(todayStr);

  const [authUser, setAuthUser] = useState<AuthUser>({
    role: 'manager'
  });

  const [colorMode, setColorMode] = useState<ColorHighlightMode>('none');
  const [activeView, setActiveView] = useState<ViewType>('board');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);
  const [schedules, setSchedules] = useState<Record<string, DailySchedule>>({});

  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isDirectionModalOpen, setIsDirectionModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  useEffect(() => {
    setStaffList(loadStaff());
    setDirections(loadDirections());
    setSchedules(loadSchedules());

    fetchCloudLatestData().then(cloudData => {
      if (cloudData) {
        if (cloudData.staffList && cloudData.staffList.length > 0) {
          setStaffList(cloudData.staffList);
          saveStaff(cloudData.staffList);
        }
        if (cloudData.directions && cloudData.directions.length > 0) {
          setDirections(cloudData.directions);
          saveDirections(cloudData.directions);
        }
        if (cloudData.schedules) {
          setSchedules(cloudData.schedules);
          saveSchedules(cloudData.schedules);
        }
      }
    });
  }, []);

  const currentSchedule = getOrInheritSchedule(currentDate, schedules);

  const updateCurrentSchedule = (newSched: DailySchedule) => {
    const updatedAll = {
      ...schedules,
      [currentDate]: newSched
    };
    setSchedules(updatedAll);
    saveSchedules(updatedAll);
  };

  const handleMoveStaff = (staffId: string, targetDirectionId: string) => {
    const newAssignments = {
      ...currentSchedule.assignments,
      [staffId]: targetDirectionId
    };

    updateCurrentSchedule({
      ...currentSchedule,
      assignments: newAssignments
    });
  };

  const handleSetCaptain = (directionId: string, captainStaffId: string | null) => {
    const updatedDirections = directions.map(d => {
      if (d.id === directionId) {
        return { ...d, captainId: captainStaffId };
      }
      return d;
    });

    setDirections(updatedDirections);
    saveDirections(updatedDirections);
  };

  const handleTogglePinDirection = (directionId: string) => {
    const updatedDirections = directions.map(d => {
      if (d.id === directionId) {
        return { ...d, isPinned: !d.isPinned };
      }
      return d;
    });

    setDirections(updatedDirections);
    saveDirections(updatedDirections);
  };

  const handleToggleExitStaff = (staffId: string, isExited: boolean) => {
    const updatedStaff = staffList.map(s => {
      if (s.id === staffId) {
        return { ...s, isExited };
      }
      return s;
    });

    setStaffList(updatedStaff);
    saveStaff(updatedStaff);

    if (selectedStaff && selectedStaff.id === staffId) {
      setSelectedStaff({ ...selectedStaff, isExited });
    }
  };

  const handleUpdateStaff = (updatedStaffObj: Staff) => {
    const updated = staffList.map(s => {
      if (s.id === updatedStaffObj.id) {
        return updatedStaffObj;
      }
      return s;
    });

    setStaffList(updated);
    saveStaff(updated);

    if (selectedStaff && selectedStaff.id === updatedStaffObj.id) {
      setSelectedStaff(updatedStaffObj);
    }
  };

  const handleReorderDirections = (newOrderedDirections: Direction[]) => {
    setDirections(newOrderedDirections);
    saveDirections(newOrderedDirections);
  };

  const handleSaveSlotSchedule = (staffId: string, slots: PersonSlotSchedule) => {
    const updatedSlots = {
      ...currentSchedule.slotAssignments,
      [staffId]: slots
    };

    updateCurrentSchedule({
      ...currentSchedule,
      slotAssignments: updatedSlots
    });
  };

  const handleSaveNotes = (staffId: string, notes: string) => {
    const updatedStaff = staffList.map(s => {
      if (s.id === staffId) {
        return { ...s, notes };
      }
      return s;
    });

    setStaffList(updatedStaff);
    saveStaff(updatedStaff);

    if (selectedStaff && selectedStaff.id === staffId) {
      setSelectedStaff({ ...selectedStaff, notes });
    }
  };

  const handleUpdateSelfExploreArea = (pairId: string, area: string) => {
    const updatedPairs = currentSchedule.selfExplorePairs.map(p => {
      if (p.id === pairId) {
        return { ...p, plannedArea: area };
      }
      return p;
    });

    updateCurrentSchedule({
      ...currentSchedule,
      selfExplorePairs: updatedPairs
    });
  };

  const handleAddDirection = (name: string, category: DirectionCategory) => {
    const newDir: Direction = {
      id: `dir-${Date.now()}`,
      name,
      category,
      captainId: null,
      isDeleted: false
    };

    const updated = [...directions, newDir];
    setDirections(updated);
    saveDirections(updated);
  };

  // 场景软删除 (Soft Delete)
  const handleDeleteDirection = (dirId: string) => {
    const updated = directions.map(d => {
      if (d.id === dirId) {
        return { ...d, isDeleted: true };
      }
      return d;
    });
    setDirections(updated);
    saveDirections(updated);
  };

  // 场景从软删除中恢复 (Restore)
  const handleRestoreDirection = (dirId: string) => {
    const updated = directions.map(d => {
      if (d.id === dirId) {
        return { ...d, isDeleted: false };
      }
      return d;
    });
    setDirections(updated);
    saveDirections(updated);
  };

  const handleAddStaff = (newStaffData: Omit<Staff, 'id'>) => {
    const newStaff: Staff = {
      ...newStaffData,
      id: `staff-${Date.now()}`
    };

    const updated = [...staffList, newStaff];
    setStaffList(updated);
    saveStaff(updated);
  };

  const handleDeleteStaff = (staffId: string) => {
    const updated = staffList.filter(s => s.id !== staffId);
    setStaffList(updated);
    saveStaff(updated);
  };

  // 获取可见方向（自动排除已被软删除 isDeleted 的方向）
  const getFilteredDirections = (): Direction[] => {
    const available = directions.filter(d => !d.isDeleted);
    switch (activeView) {
      case 'scene':
        return available.filter(d => d.category === 'scene');
      case 'branch':
        return available.filter(d => d.category === 'branch');
      case 'list':
        return available.filter(d => d.category === 'list');
      case 'self_explore':
        return available.filter(d => d.category === 'self_explore');
      default:
        return available;
    }
  };

  const handleExportImage = async () => {
    try {
      let elementId = 'board-view-export';
      let viewName = '整体看板视图';

      if (activeView === 'vacation') {
        elementId = 'vacation-view-export';
        viewName = '最近30天休假视图';
      } else if (activeView === 'scene') {
        elementId = 'scene-view-export';
        viewName = '合作方场景视图';
      } else if (activeView === 'list') {
        elementId = 'list-view-export';
        viewName = '线上名单收件视图';
      } else if (activeView === 'branch') {
        viewName = '厅堂支行视图';
      } else if (activeView === 'self_explore') {
        viewName = '自拓获客视图';
      }

      await exportElementToImage(elementId, currentDate, viewName);
    } catch (e: any) {
      alert(`导出图片失败: ${e.message || e}`);
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-3 max-w-7xl mx-auto">
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        authUser={authUser}
        onAuthUserChange={setAuthUser}
        colorMode={colorMode}
        onChangeColorMode={setColorMode}
        groups={GROUPS}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onExportExcel={() => exportScheduleToExcel(currentSchedule, staffList, directions.filter(d => !d.isDeleted))}
        onExportImage={handleExportImage}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onOpenDirectionModal={() => setIsDirectionModalOpen(true)}
      />

      <ViewTabs activeView={activeView} onViewChange={setActiveView} />

      <main className="mt-1.5 pb-12">
        {activeView === 'scene' ? (
          <SceneView
            schedule={currentSchedule}
            staffList={staffList}
            directions={directions.filter(d => !d.isDeleted)}
            authUser={authUser}
            colorMode={colorMode}
            onMoveStaff={handleMoveStaff}
            onClickStaffCard={setSelectedStaff}
          />
        ) : activeView === 'list' ? (
          <ListView
            schedule={currentSchedule}
            staffList={staffList}
            directions={directions.filter(d => !d.isDeleted)}
            authUser={authUser}
            colorMode={colorMode}
            onClickStaffCard={setSelectedStaff}
          />
        ) : activeView === 'vacation' ? (
          <VacationView
            currentDate={currentDate}
            staffList={staffList}
            directions={directions.filter(d => !d.isDeleted)}
            allSchedules={schedules}
          />
        ) : (
          <BoardView
            isDefaultBoardView={activeView === 'board'}
            schedule={currentSchedule}
            staffList={staffList}
            directions={getFilteredDirections()}
            authUser={authUser}
            colorMode={colorMode}
            isEditMode={isEditMode}
            onMoveStaff={handleMoveStaff}
            onClickStaffCard={setSelectedStaff}
            onUpdateSelfExploreArea={handleUpdateSelfExploreArea}
            onSwitchToSpecificView={(view) => setActiveView(view as ViewType)}
            onReorderDirections={handleReorderDirections}
            onTogglePinDirection={handleTogglePinDirection}
            onDeleteDirection={handleDeleteDirection}
          />
        )}
      </main>

      {selectedStaff && (
        <BottomSheet
          staff={selectedStaff}
          directions={directions.filter(d => !d.isDeleted)}
          currentDirectionId={currentSchedule.assignments[selectedStaff.id]}
          slotSchedule={currentSchedule.slotAssignments[selectedStaff.id]}
          onClose={() => setSelectedStaff(null)}
          onAssignDirection={(staffId, dirId) => {
            handleMoveStaff(staffId, dirId);
            setSelectedStaff(null);
          }}
          onSetCaptain={handleSetCaptain}
          onSaveSlotSchedule={handleSaveSlotSchedule}
          onSaveNotes={handleSaveNotes}
          onToggleExitStaff={handleToggleExitStaff}
        />
      )}

      {isDirectionModalOpen && (
        <DirectionModal
          directions={directions}
          onClose={() => setIsDirectionModalOpen(false)}
          onAddDirection={handleAddDirection}
          onDeleteDirection={handleDeleteDirection}
          onRestoreDirection={handleRestoreDirection}
        />
      )}

      {isStaffModalOpen && (
        <StaffModal
          staffList={staffList}
          groups={GROUPS}
          regions={REGIONS}
          onClose={() => setIsStaffModalOpen(false)}
          onAddStaff={handleAddStaff}
          onDeleteStaff={handleDeleteStaff}
          onUpdateStaff={handleUpdateStaff}
          onToggleExitStaff={handleToggleExitStaff}
        />
      )}
    </div>
  );
};
