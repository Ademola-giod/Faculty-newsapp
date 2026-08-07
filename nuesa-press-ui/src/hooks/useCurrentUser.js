import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useCurrentUser = () => {
  const {
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();

  // undefined = still checking backend
  const [backendUser, setBackendUser] = useState(undefined);

  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {

    if (!isAuthenticated) {
      setBackendUser(null);
      setLoadingUser(false);
      return;
    }

    const loadUser = async () => {

      try {

        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE
          }
        });

        const res = await axios.get(
          `${API_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setBackendUser(res.data);

      } catch (err) {

        console.error("Failed to load backend user", err);

        setBackendUser(null);

      } finally {

        setLoadingUser(false);

      }

    };

    loadUser();

  }, [isAuthenticated, getAccessTokenSilently]);

  return {
    backendUser,
    loadingUser
  };
};