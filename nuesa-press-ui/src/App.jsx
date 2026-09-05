import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCurrentUser } from "./hooks/useCurrentUser";
import SetNameModal from "./components/modal/SetNameModal";
import { toast } from "react-toastify";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import PostPage from "./pages/PostPage";


const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function App() {

  const {
    isAuthenticated,
    isLoading,
    getAccessTokenSilently
  } = useAuth0();

  const {
    backendUser,
    loadingUser
  } = useCurrentUser();

  const [savingName, setSavingName] = useState(false);
  const [nameOverride, setNameOverride] = useState(null); // optimistic patch until next refetch

  // Wait for Auth0 and backend role
  if (isLoading || loadingUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const effectiveUser = nameOverride
    ? { ...backendUser, ...nameOverride }
    : backendUser;

  const isAdmin =
    effectiveUser?.role === "ADMIN" ||
    effectiveUser?.role === "SUPER_ADMIN";

  const handleSetName = async (fullName) => {
    setSavingName(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
      });

      const res = await fetch(`${API_BASE_URL}/api/users/me/name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fullName })
      });

      if (!res.ok) throw new Error('Failed to save name');

      const data = await res.json();
      setNameOverride({ fullName: data.fullName, nameSetByUser: data.nameSetByUser });
      toast.success(`Welcome, ${data.fullName}`);

    } catch (err) {


      console.error('Failed to save name:', err);
              toast.error('could not save your name. please try again ')
    } finally {
      setSavingName(false);
    }
  };

  return (
    <>
      <Routes>


      <Route path="/landing" element={<Landing />} />

        <Route
          path="/"
          element={
            !isAuthenticated
              ? <Landing />
              : <Navigate to={isAdmin ? "/admin" : "/feed"} replace />
          }
        />

        <Route
          path="/feed"
          element={
            !isAuthenticated
              ? <Navigate to="/" replace />
              : isAdmin
                ? <Navigate to="/admin" replace />
                : <Home backendUser={effectiveUser} />
          }
        />

        <Route
          path="/admin"
          element={
            !isAuthenticated
              ? <Navigate to="/" replace />
              : isAdmin
                ? <AdminDashboard backendUser={effectiveUser} />
                : <Navigate to="/feed" replace />
          }
        />

        <Route
          path="/post/:id"
          element={<PostPage />}
        />

      </Routes>

      <SetNameModal
        open={isAuthenticated && !!effectiveUser && !effectiveUser.nameSetByUser}
        onSubmit={handleSetName}
        submitting={savingName}
      />

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;