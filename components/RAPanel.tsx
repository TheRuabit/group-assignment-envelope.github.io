import React, { useState, useEffect } from 'react';
import { getCredentials, getDb } from '../services/mockDatabase';
import { SubjectCredential, SubjectRecord } from '../types';

interface RAPanelProps {
  onBack: () => void;
}

const RAPanel: React.FC<RAPanelProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [credentials, setCredentials] = useState<SubjectCredential[]>([]);
  const [enrollments, setEnrollments] = useState<SubjectRecord[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setCredentials(getCredentials());
    setEnrollments(getDb());
  };

  const getEnrollmentStatus = (subId: string) => {
    const record = enrollments.find(e => e.subjectId.toLowerCase() === subId.toLowerCase());
    return record ? `Enrolled` : 'Pending';
  };

  // Filter credentials based on search query
  const filteredCredentials = credentials.filter(cred => 
    cred.subjectId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">RA Dashboard</h2>
          <p className="text-sm text-slate-500">View Subject Credentials and Status</p>
        </div>
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700 text-sm font-medium">Log Out</button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Subject ID..."
            className="w-full px-4 py-3 pl-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-900 uppercase font-bold text-xs">
            <tr>
              <th className="px-4 py-3">Subject ID</th>
              <th className="px-4 py-3">Access Code</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCredentials.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                  {searchQuery ? "No subjects found matching your search." : "No subjects in the system."}
                </td>
              </tr>
            ) : (
              filteredCredentials.slice().reverse().map((cred) => (
                <tr key={cred.subjectId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{cred.subjectId}</td>
                  <td className="px-4 py-3 font-mono text-blue-600 font-bold">
                    {cred.accessCode}
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
                    {new Date(cred.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-slate-400 text-center">
        Note: You are in read-only mode. Contact an Administrator to generate new codes or modify settings.
      </div>
    </div>
  );
};

export default RAPanel;