import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { Routes, Route, Navigate } from 'react-router-dom';
  
import Landing from './pages/Landing';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import PostPage from './pages/PostPage';

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function App() {
  const { isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  const [backendUser, setBackendUser] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!isAuthenticated) {
        setBackendUser(null);
        setCheckingRole(false);
        return;
      }

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE
          }
        });

        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setBackendUser(res.data);
      } catch (err) {
        console.error('Failed to load backend user:', err);
        setBackendUser(null);
      } finally {
        setCheckingRole(false);
      }
    };

    loadUser();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading || checkingRole) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const isAdmin =
    backendUser?.role === 'ADMIN' || backendUser?.role === 'SUPER_ADMIN';


    console.log("Authenticated:", isAuthenticated);
    console.log("Loading:", isLoading);
    console.log("Backend User:", backendUser);
    console.log("Is Admin:", isAdmin);

  return (
    <Routes>
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Landing />
          ) : (
            <Navigate to={isAdmin ? '/admin' : '/feed'} replace />
          )
        }
      />

      <Route
        path="/feed"
        element={
          !isAuthenticated ? (
            <Navigate to="/" replace />
          ) : isAdmin ? (
            <Navigate to="/admin" replace />
          ) : (
            <Home backendUser={backendUser} />
          )
        }
      />

      <Route
        path="/admin"
        element={isAdmin ? <AdminDashboard backendUser={backendUser}/> :
         <Navigate to="/feed" replace />}
      />

      <Route path="/post/:id" element={<PostPage />} />
    </Routes>
  );
}

export default App;


// import { useAuth0 } from '@auth0/auth0-react';
// import { Routes, Route, Navigate } from 'react-router-dom';

// import { useCurrentUser } from './hooks/useCurrentUser';

// import Landing from './pages/Landing';
// import Home from './pages/Home';
// import AdminDashboard from './pages/AdminDashboard';
// import PostPage from './pages/PostPage';

// function App() {
//   const { isAuthenticated, isLoading } = useAuth0();
//   const { backendUser, loadingUser } = useCurrentUser();

//   const isAdmin =
//     backendUser?.role === 'ADMIN' ||
//     backendUser?.role === 'SUPER_ADMIN';

//   if (isLoading || (isAuthenticated && loadingUser)) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
//         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       <Route
//         path="/"
//         element={
//           !isAuthenticated ? (
//             <Landing />
//           ) : (
//             <Navigate to={isAdmin ? '/admin' : '/feed'} replace />
//           )
//         }
//       />

//       <Route
//       path="/feed"
//       element={
//         !isAuthenticated ? (
//           <Navigate to="/" replace />
//         ) : isAdmin ? (
//           <Navigate to="/admin" replace />
//         ) : (
//           <Home />
//         )
//       }
//     />

//       <Route
//         path="/admin"
//         element={
//           isAdmin ? <AdminDashboard /> : <Navigate to="/feed" replace />
//         }
//       />

//       <Route path="/post/:id" element={<PostPage />} />
//     </Routes>
//   );
// }

// export default App;