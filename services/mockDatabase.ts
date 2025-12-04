import { GroupAssignment, SubjectRecord, SubjectCredential, STORAGE_KEYS } from '../types';

// Default sequence if admin hasn't configured one (Tier 1 / Tier 2 alternating)
const DEFAULT_SEQUENCE: GroupAssignment[] = [
  { groupId: 'T1', groupName: 'Tier 1 Group', description: 'Standard Protocol' },
  { groupId: 'T2', groupName: 'Tier 2 Group', description: 'Enhanced Protocol' },
  { groupId: 'T1', groupName: 'Tier 1 Group', description: 'Standard Protocol' },
  { groupId: 'T2', groupName: 'Tier 2 Group', description: 'Enhanced Protocol' },
  { groupId: 'T1', groupName: 'Tier 1 Group', description: 'Standard Protocol' },
  { groupId: 'T2', groupName: 'Tier 2 Group', description: 'Enhanced Protocol' },
  { groupId: 'T1', groupName: 'Tier 1 Group', description: 'Standard Protocol' },
  { groupId: 'T2', groupName: 'Tier 2 Group', description: 'Enhanced Protocol' },
];

// Helper to get data from "DB"
export const getDb = (): SubjectRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  return data ? JSON.parse(data) : [];
};

// Helper to get sequence
const getSequence = (): GroupAssignment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SEQUENCE);
  return data ? JSON.parse(data) : DEFAULT_SEQUENCE;
};

// Helper to get credentials
export const getCredentials = (): SubjectCredential[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
  return data ? JSON.parse(data) : [];
};

// --- Admin Functions ---

export const saveSequence = (sequence: GroupAssignment[]) => {
  localStorage.setItem(STORAGE_KEYS.SEQUENCE, JSON.stringify(sequence));
};

export const resetDatabase = () => {
  localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
  localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
};

export const generateCredential = (subjectId: string): string => {
  const credentials = getCredentials();
  
  // Check if already exists
  const existing = credentials.find(c => c.subjectId.toLowerCase() === subjectId.toLowerCase());
  if (existing) return existing.accessCode;

  // Generate random 6 digit code
  const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  credentials.push({
    subjectId,
    accessCode,
    createdAt: Date.now()
  });
  
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
  return accessCode;
};

// --- Auth Functions ---

export const verifyLogin = async (subjectId: string, accessCode: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const credentials = getCredentials();
  const valid = credentials.find(
    c => c.subjectId.toLowerCase() === subjectId.toLowerCase() && c.accessCode === accessCode
  );
  
  return !!valid;
};

// --- Enrollment Functions ---

/**
 * Core Logic:
 * 1. Check if Subject ID already exists. If yes, return existing assignment.
 * 2. If no, calculate the next available slot based on total count of enrolled subjects.
 * 3. Assign the group from the sequence at that index.
 */
export const enrollSubject = async (subjectId: string): Promise<GroupAssignment> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const db = getDb();
  const sequence = getSequence();

  // 1. Check existing enrollment
  const existing = db.find(r => r.subjectId.toLowerCase() === subjectId.toLowerCase());
  if (existing) {
    return existing.assignedGroup;
  }

  // 2. Determine index
  // We strictly follow sequence of enrollment. 
  // If 5 people are in DB, this new person is index 5 (6th person).
  const nextIndex = db.length; 
  
  // Wrap around if sequence is shorter than subjects (or stop, depending on study design. We wrap here).
  const assignmentIndex = nextIndex % sequence.length;
  const groupToAssign = sequence[assignmentIndex];

  // 3. Save to DB
  const newRecord: SubjectRecord = {
    subjectId,
    assignedGroup: groupToAssign,
    enrollmentTimestamp: Date.now()
  };

  db.push(newRecord);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(db));

  return groupToAssign;
};