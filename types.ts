
export type Grade = 'A' | 'AB' | 'B' | 'BC' | 'C' | 'D' | 'E';

export interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  grade: Grade;
}

export interface GradeDefinition {
  letter: Grade;
  points: number;
}
