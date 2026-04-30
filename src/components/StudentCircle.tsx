import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, User } from 'lucide-react';
import { Student } from '../types';
import { cn } from '../lib/utils';

interface StudentCircleProps {
  id: string; // This is the slot ID which might be "slot-{level}-{index}" or "student-{id}"
  student?: Student;
  onClick: () => void;
  className?: string;
  isDraggable?: boolean;
  accentColor?: string;
  shadowColor?: string;
}

export const StudentCircle: React.FC<StudentCircleProps> = ({ 
  id, 
  student, 
  onClick, 
  className,
  isDraggable = true,
  accentColor = "border-red-600",
  shadowColor = "shadow-red-900/20"
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id, 
    disabled: !student || !isDraggable,
    data: {
      type: 'Student',
      student
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={(e) => {
        // Prevent click if dragging
        if (transform) return;
        onClick();
      }}
      className={cn(
        "relative flex flex-col items-center gap-1 group",
        isDragging && "opacity-50",
        className
      )}
    >
      <div 
        className={cn(
          "w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed border-zinc-800 bg-zinc-900/30 flex items-center justify-center transition-all cursor-pointer overflow-hidden",
          student ? cn("border-solid bg-zinc-800 shadow-2xl", accentColor, shadowColor) : "hover:border-zinc-500 hover:bg-zinc-900/50",
          isDragging && "scale-110 shadow-xl border-opacity-100"
        )}
      >
        {student ? (
          student.photoUrl ? (
            <img 
              src={student.photoUrl} 
              alt={student.name} 
              className="w-full h-full object-cover pointer-events-none"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="w-8 h-8 text-red-500" />
          )
        ) : (
          <div className="flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
            <Plus className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400" />
            <span className="text-[10px] uppercase font-bold text-zinc-600 group-hover:text-zinc-400 mt-0.5 tracking-tighter">Ajouter</span>
          </div>
        )}
      </div>
      
      {student && (
        <span className="text-[10px] md:text-xs font-bold text-zinc-300 uppercase tracking-tighter truncate max-w-[80px] bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800 backdrop-blur-sm shadow-lg mt-1">
          {student.name}
        </span>
      )}
    </div>
  );
};
