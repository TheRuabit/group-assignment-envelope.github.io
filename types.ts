export interface GroupAssignment {
  groupId: string;
  groupName: string;
  description: string;
}

export interface SubjectRecord {
  subjectId: string;
  assignedGroup: GroupAssignment;
  enrollmentTimestamp: number;
}

export interface AppState {
  view: 'LOGIN' | 'INSTRUCTIONS' | 'REVEAL' | 'ADMIN';
  currentSubjectId: string | null;
  assignment: GroupAssignment | null;
  isLoading: boolean;
}

export const STORAGE_KEYS = {
  ASSIGNMENTS: 'study_assignments_db',
  SEQUENCE: 'study_sequence_config',
  API_KEY: 'gemini_api_key_cache' // In a real app, this wouldn't be in local storage
};