export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export type Level = "FER" | "BRONZE" | "ARGENT" | "OR";

export interface Skills {
  technique: number;
  fluidite: number;
  musicalite: number;
  style: number;
  connexion: number;
}

export interface Student {
  id: string;
  name: string;
  photoUrl: string;
  level: Level;
  slotIndex: number;
  skills: Skills;
  videoBefore?: string;
  videoAfter?: string;
  videoTestimonial?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export const INITIAL_SKILLS: Skills = {
  technique: 50,
  fluidite: 50,
  musicalite: 50,
  style: 50,
  connexion: 50
};
