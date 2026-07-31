import React, { useState, useEffect } from 'react';
import { AuthUser, DailySchedule, Direction, DirectionCategory, PersonSlotSchedule, Staff } from './types';
import { loadDirections, loadSchedules, loadStaff, saveDirections, saveSchedules, saveStaff } from './utils/storage';
import { getOrInheritSchedule } from './models/ScheduleModel';
import { Header } from './components/Header';
import { ViewTabs, ViewType } from './components/ViewTabs';
import { BoardView } from './components/BoardView';
import { GroupView } from './components/GroupView';
import { VacationView } from './components/VacationView';
import { BottomSheet } from './components/BottomSheet';
import { DirectionModal } from './components/DirectionModal';
import { StaffModal } from './components/StaffModal';
import { exportElementToImage, exportScheduleToExcel } from './utils/exportUtil';

const GROUPS = ['1组', '2组', '3组', '4组'];
const REGIONS = ['昆山', '常熟', '太仓', '工业园区', '姑苏区'];

export const App: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState<string>(todayStr);

  const [authUser, setAuthUser] = useState<AuthUser>({
    role: 'manager'
  });

  const [showExperienceColor, setShowExperienceColor] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ViewType>('board');

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
      captainId: null
    };

    const updated = [...directions, newDir];
    setDirections(updated);
    saveDirections(updated);
  };

  const handleDeleteDirection = (dirId: string) => {
    const updated = directions.filter(d => d.id !== dirId);
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

  const getFilteredDirections = (): Direction[] => {
    switch (activeView) {
      case 'scene':
        return directions.filter(d => d.category === 'scene');
      case 'branch':
        return directions.filter(d => d.category === 'branch');
      case 'list':
        return directions.filter(d => d.category === 'list');
      case 'self_explore':
        return directions.filter(d => d.category === 'self_explore');
      default:
        return directions;
    }
  };

  const handleExportImage = async () => {
    try {
      let elementId = 'board-view-export';
      let title = '整体视图';

      if (activeView === 'group') {
        elementId = 'group-view-export';
        title = '小组视图';
      } else if (activeView === 'vacation') {
        elementId = 'vacation-view-export';
        title = '休假视图30天';
      } else if (activeView === 'scene') {
        title = '场景视图';
      } else if (activeView === 'branch') {
        title = '厅堂支行视图';
      }

      await exportElementToImage(elementId, `排班安排_${title}_${currentDate}`);
    } catch (e: any) {
      alert(`导出图片失败: ${e.message || e}`);
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-4 max-w-7xl mx-auto">
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        authUser={authUser}
        onAuthUserChange={setAuthUser}
        showExperienceColor={showExperienceColor}
        onToggleExperienceColor={() => setShowExperienceColor(!showExperienceColor)}
        groups={GROUPS}
        onExportExcel={() => exportScheduleToExcel(currentSchedule, staffList, directions)}
        onExportImage={handleExportImage}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onOpenDirectionModal={() => setIsDirectionModalOpen(true)}
      />

      <ViewTabs activeView={activeView} onViewChange={setActiveView} />

      <main className="mt-2 pb-12">
        {activeView === 'group' ? (
          <GroupView
            schedule={currentSchedule}
            staffList={staffList}
            directions={directions}
          />
        ) : activeView === 'vacation' ? (
          <VacationView
            currentDate={currentDate}
            staffList={staffList}
            directions={directions}
            allSchedules={schedules}
          />
        ) : (
          <BoardView
            schedule={currentSchedule}
            staffList={staffList}
            directions={getFilteredDirections()}
            authUser={authUser}
            showExperienceColor={showExperienceColor}
            onMoveStaff={handleMoveStaff}
            onClickStaffCard={setSelectedStaff}
            onUpdateSelfExploreArea={handleUpdateSelfExploreArea}
          />
        )}
      </main>

      {selectedStaff && (
        <BottomSheet
          staff={selectedStaff}
          directions={directions}
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
        />
      )}

      {isDirectionModalOpen && (
        <DirectionModal
          directions={directions}
          onClose={() => setIsDirectionModalOpen(false)}
          onAddDirection={handleAddDirection}
          onDeleteDirection={handleDeleteDirection}
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
        />
      )}
    </div>
  );
};
