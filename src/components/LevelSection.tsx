import React from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Student, Level } from '../types';
import { StudentCircle } from './StudentCircle';
import { cn } from '../lib/utils';
import { Music, Footprints, Flame, Trophy } from 'lucide-react';

interface LevelSectionProps {
  level: Level;
  title: string;
  description: string;
  students: Student[];
  maxSlots: number;
  onSlotClick: (index: number) => void;
}

const LEVEL_STYLING = {
  OR: {
    bg: 'bg-zinc-900/50',
    border: 'border-red-600/30',
    text: 'text-zinc-100',
    icon: Trophy,
    accent: 'bg-red-600',
    label: 'OR'
  },
  ARGENT: {
    bg: 'bg-zinc-900/40',
    border: 'border-zinc-800',
    text: 'text-zinc-300',
    icon: Music,
    accent: 'bg-zinc-700',
    label: 'ARGENT'
  },
  BRONZE: {
    bg: 'bg-zinc-900/30',
    border: 'border-zinc-900',
    text: 'text-zinc-400',
    icon: Flame,
    accent: 'bg-zinc-800',
    label: 'BRONZE'
  }
};

export const LevelSection: React.FC<LevelSectionProps> = ({
  level,
  title,
  description,
  students,
  maxSlots,
  onSlotClick
}) => {
  const styling = LEVEL_STYLING[level];
  const Icon = styling.icon;

  // Create an array of potential slots
  const slots = Array.from({ length: maxSlots }, (_, i) => {
    const student = students.find(s => s.slotIndex === i);
    return { id: `slot-${level}-${i}`, student, index: i };
  });

  const promotedCount = students.length;

  return (
    <div className={cn(
      "w-full rounded-[2.5rem] border border-zinc-800 shadow-sm relative overflow-hidden mb-6 group transition-all hover:bg-zinc-900/80 backdrop-blur-sm",
      styling.bg
    )} id={`section-${level}`}>
      {/* Promoted Counter Badge */}
      <div className={cn(
        "absolute top-4 right-8 px-4 py-1.5 rounded-full text-white text-[10px] font-black tracking-widest uppercase",
        styling.accent
      )}>
        {promotedCount}/{maxSlots} COMPLÉTÉS
      </div>

      <div className="flex flex-col md:flex-row p-6 md:p-8 gap-8 items-center md:items-start">
        {/* Left Side: Info */}
        <div className="md:w-64 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-3 mb-2">
            <h2 className={cn("text-xl font-light tracking-[0.2em] uppercase", styling.text)}>
              NIVEAU {level}
            </h2>
          </div>
          <p className={cn("text-xs font-medium italic opacity-60 leading-relaxed max-w-[200px]", styling.text)}>
            "{description}"
          </p>
        </div>

        {/* Right Side: Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-6 gap-y-8 justify-items-center">
            {slots.map((slot) => (
              <StudentCircle
                key={slot.id}
                id={slot.id}
                student={slot.student}
                onClick={() => onSlotClick(slot.index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
