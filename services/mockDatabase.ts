import { GroupAssignment, SubjectRecord, STORAGE_KEYS } from '../types';

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
const getDb = (): SubjectRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
  return data ? JSON.parse(data) : [];
};

// Helper to get sequence
const getSequence = (): GroupAssignment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SEQUENCE);
  return data ? JSON.parse(data) : DEFAULT_SEQUENCE;
};

// Admin function to save sequence
export const saveSequence = (sequence: GroupAssignment[]) => {
  localStorage.setItem(STORAGE_KEYS.SEQUENCE, JSON.stringify(sequence));
};

export const resetDatabase = () => {
  localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
};

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

  // 1. Check existing
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