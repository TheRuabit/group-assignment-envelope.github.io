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
export const getSequence = (): GroupAssignment[] => {
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

export const generateCredential = (subjectId: string, forcedGroup?: GroupAssignment): string => {
  const credentials = getCredentials();
  
  // Check if already exists
  const existing = credentials.find(c => c.subjectId.toLowerCase() === subjectId.toLowerCase());
  if (existing) {
    // If updating an existing credential with a forced group, update it
    if (forcedGroup) {
      existing.forcedGroup = forcedGroup;
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
    }
    return existing.accessCode;
  }

  // Generate random 6 digit code
  const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  credentials.push({
    subjectId,
    accessCode,
    createdAt: Date.now(),
    forcedGroup // Save the manual allocation if present
  });
  
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
  return accessCode;
};

// --- Auth Functions ---

export const checkAdminCredentials = (id: string, code: string): boolean => {
  // Hardcoded admin credentials as requested
  return id === 'admin' && code === 'adminBMI123';
};

export const checkRACredentials = (id: string, code: string): boolean => {
  // Hardcoded RA credentials
  return id === 'RA-101' && code === 'RA-101';
};

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
 * 2. Check if there is a FORCED group assignment (Manual Allocation).
 * 3. If no forced group, calculate the next available slot based on total count of enrolled subjects.
 * 4. Assign the group.
 */
export const enrollSubject = async (subjectId: string): Promise<GroupAssignment> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const db = getDb();
  const sequence = getSequence();
  const credentials = getCredentials();

  // 1. Check existing enrollment
  const existing = db.find(r => r.subjectId.toLowerCase() === subjectId.toLowerCase());
  if (existing) {
    return existing.assignedGroup;
  }

  let groupToAssign: GroupAssignment;

  // 2. Check for Manual Allocation (Forced Group) in credentials
  const credential = credentials.find(c => c.subjectId.toLowerCase() === subjectId.toLowerCase());
  
  if (credential && credential.forcedGroup) {
    groupToAssign = credential.forcedGroup;
  } else {
    // 3. Sequential Logic
    // If 5 people are in DB, this new person is index 5 (6th person).
    const nextIndex = db.length; 
    
    // Wrap around if sequence is shorter than subjects.
    const assignmentIndex = nextIndex % sequence.length;
    groupToAssign = sequence[assignmentIndex];
  }

  // 4. Save to DB
  const newRecord: SubjectRecord = {
    subjectId,
    assignedGroup: groupToAssign,
    enrollmentTimestamp: Date.now()
  };

  db.push(newRecord);
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(db));

  return groupToAssign;
};