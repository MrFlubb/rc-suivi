import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Info } from 'lucide-react';
import { cn } from '../lib/utils';

const LEGEND_DATA = [
  {
    title: 'Technique',
    levels: [
      'Tu as du mal avec la macarena, alors avec la salsa...',
      'Bases encore fragiles (pas de base, dile que no, enchufla)',
      'Passes simples maîtrisées et équilibre correct',
      'Passes intermédiaires et guidage/écoute stable',
      'Précision chirurgicale dans les enchaînements complexes',
      'Tu enchaînes plus vite que ton ombre'
    ]
  },
  {
    title: 'Musicalité',
    levels: [
      'La musique est un bruit parasite (compte souvent à l\'envers)',
      'On cherche le "1" mais on le perd régulièrement',
      'Danse sur le rythme régulier, sans nuances',
      'Écoute active des breaks et des changements d\'énergie',
      'Interprétation fine des différents instruments',
      'Ton corps vit la musique'
    ]
  },
  {
    title: 'Fluidité',
    levels: [
      'Tu as deux mains gauches (mouvements très saccadés)',
      'Transitions laborieuses entre les passes apprises',
      'Mouvements un peu heurtés mais enchaînés',
      'Passes fluides dans l\'ensemble sans trop d\'arrêts',
      'Souplesse constante du corps et des bras',
      'Une vague de danse qui coule sans interruption'
    ]
  },
  {
    title: 'Style',
    levels: [
      'Un balai dans les fesses (trop de rigidité)',
      'Mouvements timides et manque d\'amplitude',
      'Début de gestuelle propre à la salsa cubaine',
      'Attitude affirmée, bras et épaules qui s\'expriment',
      'Personnalité marquée et élégance naturelle',
      'Réincarnation de Michael Jackson'
    ]
  },
  {
    title: 'Connexion',
    levels: [
      'Pas de connexion (aucune écoute du partenaire)',
      'Main de fer ou bras trop mous/passifs',
      'Connexion intermittente selon la fatigue',
      'Guidage ou écoute claire et rassurante',
      'Grande fluidité dans l\'échange et le ressenti',
      'Tu ne fais qu\'un avec ton partenaire'
    ]
  }
];

export const LegendAccordion: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-20 max-w-4xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-3xl hover:bg-zinc-800/80 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-600/10 rounded-full flex items-center justify-center border border-red-600/20 group-hover:scale-110 transition-transform">
            <Info className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Légende des Compétences</h3>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-0.5">Comprendre le système de notation de 0 à 5</p>
          </div>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform duration-500", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 pt-2 bg-zinc-900/40 border-x border-b border-zinc-800/50 rounded-b-[2rem] mx-4">
              {LEGEND_DATA.map((skill) => (
                <div key={skill.title} className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/50">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-4 pb-2 border-b border-red-600/10">
                    {skill.title}
                  </h4>
                  <div className="space-y-3">
                    {skill.levels.map((text, i) => (
                      <div key={i} className="flex gap-3 items-start group">
                        <span className="text-[9px] font-black w-3 text-red-600/40 group-hover:text-red-500">{i}</span>
                        <p className="text-[10px] leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
