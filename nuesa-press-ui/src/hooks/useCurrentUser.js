import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { getTokenWithFallback } from "../utils/authHelpers";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useCurrentUser = () => {
  const {
    isAuthenticated,
    getAccessTokenSilently,
    loginWithPopup,
    loginWithRedirect,
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

        const token = await getTokenWithFallback({
          getAccessTokenSilently,
          loginWithPopup,
          loginWithRedirect,
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE
          }
        });

        // token is null if a redirect login was triggered — page is about
        // to navigate away, so there's nothing more to do here
        if (!token) return;

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

  }, [isAuthenticated, getAccessTokenSilently, loginWithPopup, loginWithRedirect]);

  return {
    backendUser,
    loadingUser
  };
};