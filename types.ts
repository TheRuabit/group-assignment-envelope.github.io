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

export interface SubjectCredential {
  subjectId: string;
  accessCode: string;
  createdAt: number;
  forcedGroup?: GroupAssignment;
}

export interface AppState {
  view: 'LOGIN' | 'INSTRUCTIONS' | 'REVEAL' | 'ADMIN' | 'RA_DASHBOARD';
  currentSubjectId: string | null;
  assignment: GroupAssignment | null;
  isLoading: boolean;
}

export const STORAGE_KEYS = {
  ASSIGNMENTS: 'study_assignments_db',
  SEQUENCE: 'study_sequence_config',
  CREDENTIALS: 'study_subject_credentials',
  API_KEY: 'gemini_api_key_cache'
};