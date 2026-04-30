import React, { useState, useRef } from 'react';
import { X, Pencil, Video, Trash2, Camera, Link as LinkIcon, Save, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, INITIAL_SKILLS } from '../types';
import { SkillsRadarChart } from './RadarChart';
import { cn } from '../lib/utils';

interface StudentModalProps {
  student?: Student;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Student>) => void;
  onDelete?: (id: string) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({ 
  student, 
  isOpen, 
  onClose, 
  onSave,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(!student);
  const [formData, setFormData] = useState<Partial<Student>>(
    student || {
      name: '',
      photoUrl: '',
      skills: { ...INITIAL_SKILLS },
      videoBefore: '',
      videoAfter: '',
      videoTestimonial: ''
    }
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
    if (!student) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col md:flex-row"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-zinc-800 rounded-xl transition-colors z-10"
        >
          <X className="w-6 h-6 text-zinc-500" />
        </button>

        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          <div className="p-8 pb-4">
            <div className="flex flex-col md:flex-row gap-10 items-start">
              {/* Photo Section */}
              <div className="flex flex-col items-center gap-6">
                <div 
                  className={cn(
                    "w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-red-600 bg-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl shadow-red-900/20 relative group",
                    isEditing && "cursor-pointer"
                  )}
                  onClick={() => isEditing && fileInputRef.current?.click()}
                >
                  {formData.photoUrl ? (
                    <img 
                      src={formData.photoUrl} 
                      alt={formData.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-16 h-16 text-zinc-700" />
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                
                {!isEditing && (
                  <button 
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white bg-zinc-800 px-6 py-3 rounded-xl transition-all border border-zinc-700/50"
                  >
                    <Pencil className="w-4 h-4" />
                    Modifier
                  </button>
                )}
              </div>

              {/* Info Section */}
              <div className="flex-1 w-full space-y-6">
                <div className="space-y-1">
                  {isEditing ? (
                    <input 
                      type="text"
                      placeholder="NOM DE L'ÉLÈVE"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-2xl md:text-3xl font-black uppercase tracking-tighter w-full bg-zinc-950 border-b border-red-600 p-2 focus:outline-none transition-colors"
                      required
                    />
                  ) : (
                    <>
                      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{formData.name}</h2>
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Niveau {formData.level || 'En cours'}</span>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                    Analyse des Compétences
                  </h3>
                  <div className="bg-zinc-800/30 rounded-[1.5rem] p-4 border border-zinc-800/50">
                    <SkillsRadarChart 
                      skills={formData.skills || INITIAL_SKILLS} 
                      editable={isEditing}
                      onChange={(newSkills) => setFormData(prev => ({ ...prev, skills: newSkills }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Links Section */}
            <div className="mt-8 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Vidéos de Progression
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Avant', key: 'videoBefore' },
                  { label: 'Après', key: 'videoAfter' },
                  { label: 'Témoignage', key: 'videoTestimonial' }
                ].map((item) => (
                   <div key={item.key} className="flex flex-col gap-2">
                      {isEditing ? (
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                          <input 
                            type="url"
                            placeholder={item.label}
                            value={(formData as any)[item.key] || ''}
                            onChange={e => setFormData(prev => ({ ...prev, [item.key]: e.target.value }))}
                            className="w-full pl-9 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs focus:ring-1 focus:ring-red-600 transition-all text-white"
                          />
                        </div>
                      ) : (
                        (formData as any)[item.key] ? (
                          <a 
                            href={(formData as any)[item.key]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700/50 group"
                          >
                            <span className="text-xs font-bold flex items-center gap-3">
                              <Video className="w-4 h-4 text-red-500" />
                              {item.label}
                            </span>
                            <span className="text-zinc-600 group-hover:text-zinc-400">→</span>
                          </a>
                        ) : (
                          <div className="p-4 bg-zinc-900 border border-dashed border-zinc-800 text-zinc-600 text-[10px] font-black uppercase text-center rounded-xl">
                            Pas de {item.label}
                          </div>
                        )
                      )}
                   </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 mt-4 flex justify-between items-center bg-zinc-950/50">
            {student ? (
              <button 
                type="button"
                onClick={() => {
                  if (confirm('Supprimer définitivement ce profil ?')) {
                    onDelete?.(student.id);
                    onClose();
                  }
                }}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors"
              >
                Supprimer
              </button>
            ) : <div />}
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white px-4"
              >
                Fermer
              </button>
              {isEditing && (
                <button 
                  type="submit"
                  className="px-8 py-4 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-900/20 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
