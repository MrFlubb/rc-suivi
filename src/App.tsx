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
import { Palmtree, Disc } from 'lucide-react';

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
      const match = overId.match(/^slot-(OR|ARGENT|BRONZE)-(\d+)$/);
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
    <div className="min-h-screen bg-[#fcfaf5] p-4 md:p-10 font-sans selection:bg-yellow-200">
      {/* Background decoration */}
      <div className="fixed top-4 left-4 opacity-10 rotate-[-15deg] pointer-events-none">
        <Palmtree className="w-24 h-24" />
      </div>
      <div className="fixed bottom-4 right-4 opacity-10 rotate-[15deg] pointer-events-none">
        <Disc className="w-24 h-24" />
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center relative">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-gray-800 tracking-tighter uppercase inline-block relative px-4"
          >
            SALSA CUBAINE - MON SUIVI DES ÉLÈVES
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-500 rounded-full scale-x-75 opacity-50"></div>
          </motion.h1>
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

      <footer className="mt-20 text-center text-gray-400 text-xs font-medium tracking-widest uppercase">
        artrevoution.fr — de danseur à dancepreneur
      </footer>
    </div>
  );
}
