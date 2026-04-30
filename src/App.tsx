import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { useStudents } from './hooks/useStudents';
import { LevelSection } from './components/LevelSection';
import { StudentModal } from './components/StudentModal';
import { StudentCircle } from './components/StudentCircle';
import { Level, Student, INITIAL_SKILLS } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Palmtree, Disc, Plus } from 'lucide-react';

export default function App() {
  const { students, addStudent, updateStudent, deleteStudent, moveStudent } = useStudents();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<{ level: Level; index: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddGlobal = () => {
    // Find first empty slot in FER (or Bronze if full)
    let targetLevel: Level = 'FER';
    let targetStudents = students.filter(s => s.level === targetLevel);
    let firstEmptyIndex = 0;
    
    // Check FER first
    while (targetStudents.some(s => s.slotIndex === firstEmptyIndex) && firstEmptyIndex < 15) {
      firstEmptyIndex++;
    }

    // If FER is full, fallback to Bronze (just in case, though highly unlikely for start)
    if (firstEmptyIndex >= 15) {
      targetLevel = 'BRONZE';
      targetStudents = students.filter(s => s.level === targetLevel);
      firstEmptyIndex = 0;
      while (targetStudents.some(s => s.slotIndex === firstEmptyIndex) && firstEmptyIndex < 15) {
        firstEmptyIndex++;
      }
    }
    
    setSelectedStudent(null);
    setModalMode({ level: targetLevel, index: firstEmptyIndex });
    setIsModalOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const activeData = active.data.current;
      const overId = over.id as string;
      
      // Parse overId (format: slot-{level}-{index})
      const match = overId.match(/^slot-(OR|ARGENT|BRONZE|FER)-(\d+)$/);
      if (match && activeData?.student) {
        const student = activeData.student as Student;
        const newLevel = match[1] as Level;
        const newIndex = parseInt(match[2]);
        
        // Only move if slot is empty or if it's the same student (though dnd-kit handles that)
        const isSlotOccupied = students.some(s => s.level === newLevel && s.slotIndex === newIndex);
        
        if (!isSlotOccupied || (student.level === newLevel && student.slotIndex === newIndex)) {
          await moveStudent(student.id, newLevel, newIndex);
        }
      }
    }
  };

  const handleSlotClick = (level: Level, index: number) => {
    const student = students.find(s => s.level === level && s.slotIndex === index);
    if (student) {
      setSelectedStudent(student);
      setModalMode(null);
    } else {
      setSelectedStudent(null);
      setModalMode({ level, index });
    }
    setIsModalOpen(true);
  };

  const activeStudent = activeId ? students.find(s => `slot-${s.level}-${s.slotIndex}` === activeId || `student-${s.id}` === activeId) : null;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-10 font-sans selection:bg-red-500/30 text-white">
      {/* Background decoration */}
      <div className="fixed top-4 left-4 opacity-5 rotate-[-15deg] pointer-events-none text-zinc-500">
        <Palmtree className="w-24 h-24" />
      </div>
      <div className="fixed bottom-4 right-4 opacity-5 rotate-[15deg] pointer-events-none text-zinc-500">
        <Disc className="w-24 h-24" />
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center relative pt-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-light tracking-[0.3em] text-zinc-100 uppercase inline-block relative px-4"
          >
            SALSA <span className="font-black text-red-600">CUBAINE</span>
            <div className="text-[10px] tracking-[0.5em] font-black opacity-30 mt-2">MON SUIVI DES ÉLÈVES</div>
          </motion.h1>

          <div className="mt-8">
            <button 
              onClick={handleAddGlobal}
              className="px-8 py-3 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-900/40 transition-all flex items-center gap-3 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Ajouter un nouvel élève
            </button>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-8">
            <LevelSection
              level="OR"
              title="NIVEAU OR"
              description="Élèves ultra fluides qui vivent la musique à travers leur corps."
              students={students.filter(s => s.level === 'OR')}
              maxSlots={5}
              onSlotClick={(index) => handleSlotClick('OR', index)}
            />

            <LevelSection
              level="ARGENT"
              title="NIVEAU ARGENT"
              description="Élèves qui prennent plaisir à danser et ne sont plus dans le mental."
              students={students.filter(s => s.level === 'ARGENT')}
              maxSlots={10}
              onSlotClick={(index) => handleSlotClick('ARGENT', index)}
            />

            <LevelSection
              level="BRONZE"
              title="NIVEAU BRONZE"
              description="Élèves capables d'effectuer une danse entière sans hésitation."
              students={students.filter(s => s.level === 'BRONZE')}
              maxSlots={15}
              onSlotClick={(index) => handleSlotClick('BRONZE', index)}
            />

            <LevelSection
              level="FER"
              title="NIVEAU FER"
              description="Elèves qui découvrent les bases (enchufla, vacilence, dile que no)"
              students={students.filter(s => s.level === 'FER')}
              maxSlots={15}
              onSlotClick={(index) => handleSlotClick('FER', index)}
            />
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.4',
                },
              },
            }),
          }}>
            {activeId && activeStudent ? (
              <StudentCircle
                id={activeId}
                student={activeStudent}
                onClick={() => {}}
                className="scale-110 rotate-2 pointer-events-none"
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <StudentModal
            student={selectedStudent || undefined}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedStudent(null);
              setModalMode(null);
            }}
            onSave={(data) => {
              if (selectedStudent) {
                updateStudent(selectedStudent.id, data);
              } else if (modalMode) {
                addStudent({
                  name: data.name || 'Nouvel Élève',
                  photoUrl: data.photoUrl || '',
                  level: modalMode.level,
                  slotIndex: modalMode.index,
                  skills: data.skills || { ...INITIAL_SKILLS },
                  videoBefore: data.videoBefore,
                  videoAfter: data.videoAfter,
                  videoTestimonial: data.videoTestimonial
                });
              }
              setIsModalOpen(false);
            }}
            onDelete={selectedStudent ? (id) => deleteStudent(id) : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
