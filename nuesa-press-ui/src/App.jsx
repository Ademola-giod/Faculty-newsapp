import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Landing from './pages/Landing';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import { ADMIN_EMAILS } from './utils/adminList';

function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  // 1. IMPROVED LOADING STATE
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em]">
          Syncing Faculty Session...
        </p>
      </div>
    );
  }

  // Determine role based on the whitelist
  const isAdmin = isAuthenticated && ADMIN_EMAILS.includes(user?.email);

  return (
    <div className="min-h-screen bg-white">
      {/* Logic: If not logged in -> Landing. 
         If logged in AND admin -> Dashboard.
         Otherwise -> Home (Student Feed).
      */}
      {!isAuthenticated ? (
        <Landing />
      ) : isAdmin ? (
        <AdminDashboard />
      ) : (
        <Home />
      )}
    </div>
  );
}

export default App;