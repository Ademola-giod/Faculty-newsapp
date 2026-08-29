import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCurrentUser } from "./hooks/useCurrentUser";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import PostPage from "./pages/PostPage";

function App() {

  const {
    isAuthenticated,
    isLoading
  } = useAuth0();

  const {
    backendUser,
    loadingUser
  } = useCurrentUser();

  // Wait for Auth0 and backend role
  if (isLoading || loadingUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const isAdmin =
    backendUser?.role === "ADMIN" ||
    backendUser?.role === "SUPER_ADMIN";

  return (

    <>
    <Routes>

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
              : <Home backendUser={backendUser} />
        }
      />

      <Route
        path="/admin"
        element={
          !isAuthenticated
            ? <Navigate to="/" replace />
            : isAdmin
              ? <AdminDashboard backendUser={backendUser} />
              : <Navigate to="/feed" replace />
        }
      />

      <Route
        path="/post/:id"
        element={<PostPage />}
      />

    </Routes>

  
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