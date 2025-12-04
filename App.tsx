import React, { useState } from 'react';
import { AppState, GroupAssignment } from './types';
import { enrollSubject, verifyLogin } from './services/mockDatabase';
import { generateWelcomeMessage } from './services/geminiService';
import AdminPanel from './components/AdminPanel';

// Icons
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
);

export default function App() {
  const [state, setState] = useState<AppState>({
    view: 'LOGIN',
    currentSubjectId: null,
    assignment: null,
    isLoading: false,
  });

  const [inputSubjectId, setInputSubjectId] = useState('');
  const [inputAccessCode, setInputAccessCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [geminiMessage, setGeminiMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!inputSubjectId.trim()) return;

    // Admin Shortcut
    if (inputSubjectId.trim() === 'ADMIN_SECRET') {
      setState(prev => ({ ...prev, view: 'ADMIN' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const isValid = await verifyLogin(inputSubjectId.trim(), inputAccessCode.trim());
      
      if (isValid) {
        setState(prev => ({
          ...prev,
          view: 'INSTRUCTIONS',
          currentSubjectId: inputSubjectId.trim(),
          isLoading: false
        }));
      } else {
        setLoginError('Invalid Subject ID or Access Code.');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      setLoginError('Connection error. Please try again.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleReveal = async () => {
    if (!state.currentSubjectId) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // 1. Get the assignment (Sequential)
      const assignment = await enrollSubject(state.currentSubjectId);
      
      // 2. Generate content with Gemini
      const message = await generateWelcomeMessage(assignment);
      setGeminiMessage(message);

      setState(prev => ({
        ...prev,
        isLoading: false,
        assignment,
        view: 'REVEAL'
      }));

    } catch (error) {
      console.error(error);
      alert("An error occurred while connecting to the assignment database.");
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleLogout = () => {
    setState({
      view: 'LOGIN',
      currentSubjectId: null,
      assignment: null,
      isLoading: false
    });
    setInputSubjectId('');
    setInputAccessCode('');
    setLoginError('');
    setGeminiMessage('');
  };

  // --- Render Views ---

  if (state.view === 'ADMIN') {
    return <AdminPanel onBack={() => setState(prev => ({ ...prev, view: 'LOGIN' }))} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      
      {/* Header / Brand */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-slate-400">
        <LockIcon />
        <span className="text-xs font-semibold tracking-wider uppercase">Secure Research Portal</span>
      </div>

      <main className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 relative">
        
        {/* Progress Bar (Visual Flair) */}
        <div className="h-1.5 w-full bg-slate-100">
          <div 
            className={`h-full bg-blue-600 transition-all duration-500 ${
              state.view === 'LOGIN' ? 'w-1/3' : 
              state.view === 'INSTRUCTIONS' ? 'w-2/3' : 'w-full'
            }`} 
          />
        </div>

        <div className="p-8">

          {/* VIEW: LOGIN */}
          {state.view === 'LOGIN' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <UserIcon />
              </div>
              <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Participant Login</h1>
              <p className="text-center text-slate-500 mb-8 text-sm">
                Enter your credentials to access the study assignment portal.
              </p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="subjectId" className="block text-xs font-medium text-slate-700 mb-1 uppercase tracking-wide">Subject ID</label>
                  <input
                    id="subjectId"
                    type="text"
                    value={inputSubjectId}
                    onChange={(e) => setInputSubjectId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-lg placeholder-slate-300"
                    placeholder="e.g. SUB-1049"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label htmlFor="accessCode" className="block text-xs font-medium text-slate-700 mb-1 uppercase tracking-wide">Access Code</label>
                  <div className="relative">
                    <input
                      id="accessCode"
                      type="password"
                      value={inputAccessCode}
                      onChange={(e) => setInputAccessCode(e.target.value)}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-lg placeholder-slate-300 tracking-widest"
                      placeholder="••••••"
                    />
                    <div className="absolute left-3 top-3.5 text-slate-400">
                      <KeyIcon />
                    </div>
                  </div>
                </div>

                {loginError && (
                  <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!inputSubjectId || !inputAccessCode || state.isLoading}
                  className="w-full bg-slate-900 text-white font-medium py-3.5 rounded-lg hover:bg-slate-800 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                >
                  {state.isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "Secure Login"}
                </button>
              </form>
            </div>
          )}

          {/* VIEW: INSTRUCTIONS (Holding Screen) */}
          {state.view === 'INSTRUCTIONS' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <div className="mb-6">
                 <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    ID: {state.currentSubjectId}
                 </span>
              </div>
              
              <h2 className="text-xl font-bold text-slate-800 mb-4">Ready for Assignment</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                You are about to view your group assignment for the study. 
                Please ensure you are ready to receive this information.
                <br /><br />
                <strong>Note to Parent:</strong> Clicking the button below will permanently record your assignment in the sequence.
              </p>

              <button
                onClick={handleReveal}
                disabled={state.isLoading}
                className="w-full relative overflow-hidden bg-blue-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:bg-blue-700 active:scale-[0.98] transition group"
              >
                 {state.isLoading ? (
                   <span className="flex items-center justify-center gap-2">
                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Processing Enrollment...
                   </span>
                 ) : (
                   "Reveal Group Assignment"
                 )}
              </button>
              
              <button 
                onClick={handleLogout}
                className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline"
              >
                Cancel and Return
              </button>
            </div>
          )}

          {/* VIEW: REVEAL (Final Result) */}
          {state.view === 'REVEAL' && state.assignment && (
            <div className="animate-in zoom-in duration-500 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                <CheckIcon />
              </div>
              
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Assigned Group
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
                <h1 className="text-4xl font-black text-slate-900 mb-2">
                  {state.assignment.groupName}
                </h1>
                <p className="text-slate-500 font-medium">
                  ID: {state.assignment.groupId}
                </p>
              </div>

              {/* Gemini Generated Message */}
              <div className="text-left bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md mb-8">
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "{geminiMessage}"
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-slate-100 text-slate-600 font-medium py-3 rounded-lg hover:bg-slate-200 transition"
              >
                Finish Session
              </button>
            </div>
          )}

        </div>
        
        {/* Footer info */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
            Double-Blind Protocol • Sequential Enrollment • Secure
          </p>
        </div>
      </main>
      
      {/* Hidden hint for the user reviewing this code on how to access admin */}
      <div className="fixed bottom-2 right-2 opacity-0 hover:opacity-100 text-[10px] text-slate-300">
        Hint: Login ID 'ADMIN_SECRET'
      </div>
    </div>
  );
}