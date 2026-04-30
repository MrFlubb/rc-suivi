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
      description: '',
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90dvh] overflow-hidden relative flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-zinc-800 rounded-xl transition-colors z-20 bg-zinc-900/50 backdrop-blur-md"
        >
          <X className="w-5 h-5 md:w-6 md:h-6 text-zinc-500" />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              {/* Photo Section */}
              <div className="flex flex-col items-center gap-4 md:gap-6 w-full md:w-auto">
                <div 
                  className={cn(
                    "w-28 h-28 md:w-40 md:h-40 rounded-full border-4 bg-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl relative group",
                    formData.level === 'OR' && "border-yellow-600 shadow-yellow-900/20",
                    formData.level === 'ARGENT' && "border-zinc-500 shadow-zinc-900/20",
                    formData.level === 'BRONZE' && "border-orange-800 shadow-orange-900/20",
                    !formData.level && "border-red-600 shadow-red-900/20",
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
                    <User className="w-12 h-12 md:w-16 md:h-16 text-zinc-700" />
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />
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
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white bg-zinc-800 px-4 md:px-6 py-2 md:py-3 rounded-xl transition-all border border-zinc-700/50"
                  >
                    <Pencil className="w-3 h-3 md:w-4 md:h-4" />
                    Modifier
                  </button>
                )}
              </div>

              {/* Info Section */}
              <div className="flex-1 w-full space-y-4 md:space-y-6">
                <div className="space-y-1">
                  {isEditing ? (
                    <input 
                      type="text"
                      placeholder="NOM DE L'ÉLÈVE"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-xl md:text-3xl font-black uppercase tracking-tighter w-full bg-zinc-950 border-b border-red-600 p-2 focus:outline-none transition-colors"
                      required
                    />
                  ) : (
                    <>
                      <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">{formData.name}</h2>
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Niveau {formData.level || 'En cours'}</span>
                    </>
                  )}
                </div>

                {isEditing ? (
                  <textarea 
                    placeholder="DESCRIPTION DE L'ÉLÈVE (Progression, points forts, à travailler...)"
                    value={formData.description || ''}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-[10px] md:text-xs text-zinc-300 focus:outline-none focus:border-red-600 transition-colors min-h-[80px] resize-none"
                  />
                ) : (
                  formData.description && (
                    <p className="text-[10px] md:text-xs text-zinc-400 leading-relaxed bg-zinc-950/30 p-3 rounded-xl border border-zinc-800/50">
                      {formData.description}
                    </p>
                  )
                )}

                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      formData.level === 'OR' ? "bg-yellow-500" : 
                      formData.level === 'ARGENT' ? "bg-zinc-400" : 
                      formData.level === 'BRONZE' ? "bg-orange-700" : "bg-red-600"
                    )}></div>
                    Analyse des Compétences
                  </h3>
                  <div className="bg-zinc-800/30 rounded-[1.5rem] p-2 md:p-4 border border-zinc-800/50">
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
            <div className="mt-6 md:mt-8 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Vidéos de Progression
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
                            className={cn(
                              "w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] md:text-xs focus:ring-1 transition-all text-white placeholder:text-zinc-700",
                              formData.level === 'OR' ? "focus:ring-yellow-600" : 
                              formData.level === 'ARGENT' ? "focus:ring-zinc-400" : 
                              formData.level === 'BRONZE' ? "focus:ring-orange-800" : "focus:ring-red-600"
                            )}
                          />
                        </div>
                      ) : (
                        (formData as any)[item.key] ? (
                          <a 
                            href={(formData as any)[item.key]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 md:p-4 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700/50 group"
                          >
                            <span className="text-[10px] md:text-xs font-bold flex items-center gap-2 md:gap-3">
                              <Video className={cn(
                                "w-3 h-3 md:w-4 md:h-4",
                                formData.level === 'OR' ? "text-yellow-600" : 
                                formData.level === 'ARGENT' ? "text-zinc-400" : 
                                formData.level === 'BRONZE' ? "text-orange-800" : "text-red-500"
                              )} />
                              {item.label}
                            </span>
                            <span className="text-zinc-600 group-hover:text-zinc-400">→</span>
                          </a>
                        ) : (
                          <div className="p-3 md:p-4 bg-zinc-900 border border-dashed border-zinc-800 text-zinc-700 text-[9px] md:text-[10px] font-black uppercase text-center rounded-xl">
                            Pas de {item.label}
                          </div>
                        )
                      )}
                   </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col-reverse sm:flex-row justify-between items-center bg-zinc-950/80 border-t border-zinc-800 gap-4">
            {student ? (
              <button 
                type="button"
                onClick={() => {
                  if (confirm('Supprimer définitivement ce profil ?')) {
                    onDelete?.(student.id);
                    onClose();
                  }
                }}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors w-full sm:w-auto"
              >
                Supprimer
              </button>
            ) : <div className="hidden sm:block" />}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
              <button 
                type="button"
                onClick={onClose}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white px-4 py-2 sm:py-0 order-2 sm:order-1"
              >
                Fermer
              </button>
              {isEditing && (
                <button 
                  type="submit"
                  className={cn(
                    "px-6 md:px-8 py-3 md:py-4 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 order-1 sm:order-2 shadow-xl",
                    formData.level === 'OR' ? "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-900/20" : 
                    formData.level === 'ARGENT' ? "bg-zinc-600 hover:bg-zinc-700 shadow-zinc-900/20" : 
                    formData.level === 'BRONZE' ? "bg-orange-800 hover:bg-orange-900 shadow-orange-900/20" : "bg-red-600 hover:bg-red-700 shadow-red-900/20"
                  )}
                >
                  <Save className="w-3 h-3 md:w-4 md:h-4" />
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
