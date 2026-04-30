import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Skills } from '../types';
import { cn } from '../lib/utils';

interface SkillsChartProps {
  skills: Skills;
  editable?: boolean;
  onChange?: (newSkills: Skills) => void;
  color?: string;
  accentClass?: string;
}

const SKILL_NAMES: Record<keyof Skills, string> = {
  technique: 'Technique',
  fluidite: 'Fluidité',
  musicalite: 'Musicalité',
  style: 'Style',
  connexion: 'Connexion',
};

export const SkillsRadarChart: React.FC<SkillsChartProps> = ({ 
  skills, 
  editable, 
  onChange,
  color = "#dc2626",
  accentClass = "accent-red-600"
}) => {
  const data = Object.entries(skills).map(([key, value]) => ({
    subject: SKILL_NAMES[key as keyof Skills],
    value,
    fullMark: 100,
  }));

  const handleSliderChange = (skill: keyof Skills, newValue: number) => {
    if (onChange) {
      onChange({
        ...skills,
        [skill]: newValue,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#3f3f46" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Niveau"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {editable && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
          {(Object.keys(skills) as Array<keyof Skills>).map((skill) => (
            <div key={skill} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span>{SKILL_NAMES[skill]}</span>
                <span>{skills[skill]}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skills[skill]}
                onChange={(e) => handleSliderChange(skill, parseInt(e.target.value))}
                className={cn("w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer", accentClass)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
