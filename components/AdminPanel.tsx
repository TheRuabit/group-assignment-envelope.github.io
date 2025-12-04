import React, { useState, useEffect } from 'react';
import { saveSequence, resetDatabase } from '../services/mockDatabase';
import { GroupAssignment } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Load default template if empty
    const template: GroupAssignment[] = [
      { groupId: 'A', groupName: 'Group A', description: 'Control' },
      { groupId: 'B', groupName: 'Group B', description: 'Intervention' },
    ];
    setJsonInput(JSON.stringify(template, null, 2));
  }, []);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("Must be an array");
      saveSequence(parsed);
      setStatus('Sequence saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (e) {
      setStatus('Error: Invalid JSON');
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will wipe all subject assignments.")) {
      resetDatabase();
      setStatus('Database wiped.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Admin: Sequence Configuration</h2>
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700">Exit</button>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Paste a JSON array of Group Assignments here. The system assigns these sequentially (cyclic).
        This defines the "List" mentioned in the protocol.
      </p>

      <textarea
        className="w-full h-64 p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Save Sequence
        </button>
        <button
          onClick={handleReset}
          className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition"
        >
          Reset Enrollments DB
        </button>
      </div>
      
      {status && <p className="mt-4 text-sm font-semibold text-blue-600">{status}</p>}
    </div>
  );
};

export default AdminPanel;