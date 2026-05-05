import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
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
import { Palmtree, Disc, Plus, UserCircle, Settings } from 'lucide-react';
import { cn } from './lib/utils';
import { LegendAccordion } from './components/LegendAccordion';

function SuiviApp({ isProfessor }: { isProfessor: boolean }) {
  const { students, addStudent, updateStudent, deleteStudent, moveStudent } = useStudents();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<{ level: Level; index: number } | null>(null);
  
  // Auth state for professor mode
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [showPassError, setShowPassError] = useState(false);

  useEffect(() => {
    // Check session storage to keep user authed during session
    if (sessionStorage.getItem('admin_authed') === 'true') {
      setIsAdminAuthed(true);
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === '123&cparti') {
      setIsAdminAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      setShowPassError(false);
    } else {
      setShowPassError(true);
      setPassInput('');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (isProfessor && !isAdminAuthed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-zinc-900 p-8 md:p-12 rounded-[2.5rem] border border-zinc-800 w-full max-w-md shadow-2xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600/20" />
          
          <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-600/20">
            <Settings className="w-10 h-10 text-red-600" />
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Accès Administration</h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-10">Saisissez le code secret</p>
          
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="relative">
              <input 
                type="password"
                placeholder="MOT DE PASSE"
                value={passInput}
                onChange={e => {
                  setPassInput(e.target.value);
                  setShowPassError(false);
                }}
                className={cn(
                  "w-full bg-zinc-950 border rounded-2xl px-6 py-4 text-center text-xl tracking-[0.2em] focus:outline-none transition-all font-mono",
                  showPassError ? "border-red-600 ring-2 ring-red-600/20 animate-shake" : "border-zinc-800 focus:border-red-600"
                )}
                autoFocus
              />
              {showPassError && (
                <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-2">Mot de passe incorrect</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                type="submit"
                className="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
              >
                Déverrouiller
              </button>
              <Link 
                to="/eleve"
                className="w-full py-4 bg-zinc-800 text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all text-center"
              >
                Retour à l'accueil
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  const handleAddGlobal = () => {
    if (!isProfessor) return;
    let targetLevel: Level = 'FER';
    let targetStudents = students.filter(s => s.level === targetLevel);
    let firstEmptyIndex = 0;
    while (targetStudents.some(s => s.slotIndex === firstEmptyIndex) && firstEmptyIndex < 15) {
      firstEmptyIndex++;
    }
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
    if (!isProfessor) return;
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!isProfessor) return;
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      const activeData = active.data.current;
      const overId = over.id as string;
      const match = overId.match(/^slot-(OR|ARGENT|BRONZE|FER)-(\d+)$/);
      if (match && activeData?.student) {
        const student = activeData.student as Student;
        const newLevel = match[1] as Level;
        const newIndex = parseInt(match[2]);
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
      setIsModalOpen(true);
    } else if (isProfessor) {
      setSelectedStudent(null);
      setModalMode({ level, index });
      setIsModalOpen(true);
    }
  };

  const activeStudent = activeId ? students.find(s => `slot-${s.level}-${s.slotIndex}` === activeId || `student-${s.id}` === activeId) : null;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-10 font-sans selection:bg-red-500/30 text-white">
      <div className="fixed top-4 left-4 opacity-5 rotate-[-15deg] pointer-events-none text-zinc-500">
        <Palmtree className="w-24 h-24" />
      </div>
      <div className="fixed bottom-4 right-4 opacity-5 rotate-[15deg] pointer-events-none text-zinc-500">
        <Disc className="w-24 h-24" />
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center relative pt-8">
          <div className="absolute top-0 right-0 flex gap-2">
            <Link 
              to={isProfessor ? "/eleve" : "/prof"} 
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white flex items-center gap-2 transition-all"
            >
              {isProfessor ? <UserCircle className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
              {isProfessor ? "Vue Élève" : "Mode Prof"}
            </Link>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-light tracking-[0.3em] text-zinc-100 uppercase inline-block relative px-4"
          >
            SALSA <span className="font-black text-red-600">CUBAINE</span>
            <div className="text-[10px] tracking-[0.5em] font-black opacity-30 mt-2">
              {isProfessor ? "INTERFACE ADMINISTRATION" : "MON SUIVI DES ÉLÈVES"}
            </div>
          </motion.h1>

          {isProfessor && (
            <div className="mt-8">
              <button 
                onClick={handleAddGlobal}
                className="px-8 py-3 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-900/40 transition-all flex items-center gap-3 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Ajouter un nouvel élève
              </button>
            </div>
          )}
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

        <LegendAccordion />
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <StudentModal
            student={selectedStudent || undefined}
            isOpen={isModalOpen}
            isProfessor={isProfessor}
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
                  ...data,
                  name: data.name || 'Nouvel Élève',
                  photoUrl: data.photoUrl || '',
                  level: modalMode.level,
                  slotIndex: modalMode.index,
                  skills: data.skills || { ...INITIAL_SKILLS },
                } as any);
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/prof" element={<SuiviApp isProfessor={true} />} />
        <Route path="/eleve" element={<SuiviApp isProfessor={false} />} />
        <Route path="/" element={<Navigate to="/eleve" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
