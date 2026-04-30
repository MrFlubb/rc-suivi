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
  FER: {
    bg: 'bg-zinc-800/[0.08]',
    border: 'border-zinc-700/30',
    text: 'text-zinc-400',
    descText: 'text-zinc-500',
    icon: Footprints,
    accent: 'bg-zinc-700',
    borderClass: 'border-zinc-700',
    shadowClass: 'shadow-zinc-900/40',
    iconColor: 'text-zinc-600',
    hover: 'hover:bg-zinc-800/[0.12]'
  },
  OR: {
    bg: 'bg-yellow-500/[0.08]',
    border: 'border-yellow-500/30',
    text: 'text-yellow-500',
    descText: 'text-zinc-300',
    icon: Trophy,
    accent: 'bg-yellow-600',
    borderClass: 'border-yellow-600',
    shadowClass: 'shadow-yellow-900/40',
    iconColor: 'text-yellow-500',
    hover: 'hover:bg-yellow-500/[0.12]'
  },
  ARGENT: {
    bg: 'bg-zinc-100/[0.08]',
    border: 'border-zinc-500/30',
    text: 'text-zinc-300',
    descText: 'text-zinc-400',
    icon: Music,
    accent: 'bg-zinc-600',
    borderClass: 'border-zinc-400',
    shadowClass: 'shadow-zinc-900/40',
    iconColor: 'text-zinc-400',
    hover: 'hover:bg-zinc-100/[0.12]'
  },
  BRONZE: {
    bg: 'bg-orange-700/[0.08]',
    border: 'border-orange-700/30',
    text: 'text-orange-600',
    descText: 'text-zinc-400',
    icon: Flame,
    accent: 'bg-orange-800',
    borderClass: 'border-orange-800',
    shadowClass: 'shadow-orange-900/40',
    iconColor: 'text-orange-700',
    hover: 'hover:bg-orange-700/[0.12]'
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
      "w-full rounded-[2.5rem] border shadow-sm relative overflow-hidden mb-6 group transition-all backdrop-blur-sm",
      styling.bg,
      styling.border,
      styling.hover
    )} id={`section-${level}`}>
      <div className="flex flex-col md:flex-row p-6 md:p-8 gap-8 items-center md:items-start">
        {/* Left Side: Info */}
        <div className="md:w-64 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-3 mb-2">
            <Icon className={cn("w-5 h-5", styling.iconColor)} />
            <h2 className={cn("text-xl font-black tracking-tighter uppercase", styling.text)}>
              NIVEAU {level}
            </h2>
          </div>
          <p className={cn("text-xs font-semibold italic leading-relaxed max-w-[200px]", styling.descText)}>
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
                accentColor={styling.borderClass}
                shadowColor={styling.shadowClass}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
