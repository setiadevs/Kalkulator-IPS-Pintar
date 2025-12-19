
import { GradeDefinition, Grade } from './types';

export const GRADE_SCALE: GradeDefinition[] = [
  { letter: 'A', points: 4.0 },
  { letter: 'AB', points: 3.5 },
  { letter: 'B', points: 3.0 },
  { letter: 'BC', points: 2.5 },
  { letter: 'C', points: 2.0 },
  { letter: 'D', points: 1.0 },
  { letter: 'E', points: 0.0 },
];

export const getPointsForGrade = (grade: Grade): number => {
  return GRADE_SCALE.find(g => g.letter === grade)?.points || 0;
};

export const INITIAL_COURSES = [
  { id: '1', code: 'WT25-00001', name: 'Matematika Dasar', sks: 3, grade: 'B' as Grade },
  { id: '2', code: 'WT25-00003', name: 'Fisika Dasar + Praktikum', sks: 3, grade: 'BC' as Grade },
  { id: '3', code: 'WT25-00004', name: 'Kimia Dasar', sks: 2, grade: 'C' as Grade },
  { id: '4', code: 'WT25-00002', name: 'Biologi Dasar', sks: 2, grade: 'C' as Grade },
];
