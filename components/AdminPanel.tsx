import React, { useState, useEffect } from 'react';
import { saveSequence, resetDatabase, getCredentials, generateCredential, getDb, getSequence } from '../services/mockDatabase';
import { GroupAssignment, SubjectCredential, SubjectRecord } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'SUBJECTS' | 'SEQUENCE'>('SUBJECTS');
  
  // Sequence State
  const [jsonInput, setJsonInput] = useState('');
  const [sequenceStatus, setSequenceStatus] = useState('');

  // Subject State
  const [newSubjectId, setNewSubjectId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('AUTO'); // 'AUTO' or groupId
  const [credentials, setCredentials] = useState<SubjectCredential[]>([]);
  const [enrollments, setEnrollments] = useState<SubjectRecord[]>([]);
  const [availableGroups, setAvailableGroups] = useState<GroupAssignment[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    // Load Sequence Config
    const currentSequence = getSequence();
    setJsonInput(JSON.stringify(currentSequence, null, 2));

    // Extract unique groups for the dropdown
    const uniqueGroups = Array.from(new Set(currentSequence.map(s => JSON.stringify(s))))
      .map(s => JSON.parse(s) as GroupAssignment);
    setAvailableGroups(uniqueGroups);

    // Load Credentials and Enrollments
    setCredentials(getCredentials());
    setEnrollments(getDb());
  };

  // --- Sequence Handlers ---

  const handleSaveSequence = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("Must be an array");
      saveSequence(parsed);
      setSequenceStatus('Sequence saved successfully!');
      setTimeout(() => setSequenceStatus(''), 3000);
      refreshData();
    } catch (e) {
      setSequenceStatus('Error: Invalid JSON');
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will wipe all subject assignments and credentials.")) {
      resetDatabase();
      refreshData();
      setSequenceStatus('Database wiped.');
    }
  };

  // --- Subject Handlers ---

  const handleGenerateCode = () => {
    if (!newSubjectId.trim()) return;
    
    let forcedGroup: GroupAssignment | undefined = undefined;
    if (selectedGroup !== 'AUTO') {
      forcedGroup = availableGroups.find(g => g.groupId === selectedGroup);
    }

    generateCredential(newSubjectId.trim(), forcedGroup);
    
    setNewSubjectId('');
    setSelectedGroup('AUTO');
    refreshData();
  };

  const getEnrollmentStatus = (subId: string) => {
    const record = enrollments.find(e => e.subjectId.toLowerCase() === subId.toLowerCase());
    return record ? `Enrolled: ${record.assignedGroup.groupName}` : 'Pending';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Study Administration</h2>
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 text-sm font-medium">Exit Admin</button>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('SUBJECTS')}
          className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'SUBJECTS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Subject Management
        </button>
        <button 
          onClick={() => setActiveTab('SEQUENCE')}
          className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'SEQUENCE' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Sequence Configuration
        </button>
      </div>

      {/* --- SUBJECT MANAGEMENT TAB --- */}
      {activeTab === 'SUBJECTS' && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-bold text-blue-900 mb-2">Generate New Credential</h3>
            <div className="flex flex-col md:flex-row gap-2">
              <input 
                type="text" 
                value={newSubjectId}
                onChange={(e) => setNewSubjectId(e.target.value)}
                placeholder="Enter Subject ID (e.g., SUB-1001)"
                className="flex-1 px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="AUTO">Auto (Sequential)</option>
                {availableGroups.map((g, idx) => (
                  <option key={`${g.groupId}-${idx}`} value={g.groupId}>
                    Force: {g.groupName} ({g.groupId})
                  </option>
                ))}
              </select>

              <button 
                onClick={handleGenerateCode}
                disabled={!newSubjectId}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                Generate Code
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Select a group to manually allocate, or leave as "Auto" to follow the blind sequence.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 uppercase font-bold text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Subject ID</th>
                  <th className="px-4 py-3">Access Code</th>
                  <th className="px-4 py-3">Allocation</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 border border-slate-100">
                {credentials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                      No subjects registered yet. Use the form above to generate credentials.
                    </td>
                  </tr>
                ) : (
                  credentials.slice().reverse().map((cred) => (
                    <tr key={cred.subjectId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{cred.subjectId}</td>
                      <td className="px-4 py-3 font-mono text-blue-600 font-bold bg-blue-50/50 inline-block my-1 rounded px-2">
                        {cred.accessCode}
                      </td>
                      <td className="px-4 py-3">
                         {cred.forcedGroup ? (
                           <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800" title="Manually Allocated">
                             Manual: {cred.forcedGroup.groupName}
                           </span>
                         ) : (
                           <span className="text-slate-400 text-xs italic">Auto / Sequential</span>
                         )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          getEnrollmentStatus(cred.subjectId) === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getEnrollmentStatus(cred.subjectId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(cred.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SEQUENCE CONFIGURATION TAB --- */}
      {activeTab === 'SEQUENCE' && (
        <div className="animate-in fade-in duration-300">
          <p className="text-sm text-slate-600 mb-4">
            Paste a JSON array of Group Assignments here. The system assigns these sequentially (cyclic).
            This logic defines the blind sequence list.
          </p>

          <textarea
            className="w-full h-64 p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-4">
              <button
                onClick={handleSaveSequence}
                className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900 transition"
              >
                Save Sequence
              </button>
            </div>
            
            <button
              onClick={handleReset}
              className="text-red-600 text-sm hover:text-red-800 underline"
            >
              Reset All Data
            </button>
          </div>
          
          {sequenceStatus && <p className="mt-4 text-sm font-semibold text-blue-600">{sequenceStatus}</p>}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;