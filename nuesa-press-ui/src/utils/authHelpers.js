export async function getTokenWithFallback({ getAccessTokenSilently, loginWithPopup, loginWithRedirect, authorizationParams = {} }) {
  try {
    return await getAccessTokenSilently({ authorizationParams });
  } catch (err) {
    const text = (err?.error_description || err?.message || '').toString().toLowerCase();
    const recoverable = /missing refresh token|invalid refresh token|login_required|interaction_required|consent_required|mfa_required/.test(text);
    if (!recoverable) throw err;

    // Try interactive popup first (less disruptive)
    if (typeof loginWithPopup === 'function') {
      try {
        await loginWithPopup({ authorizationParams });
        return await getAccessTokenSilently({ authorizationParams });
      } catch (popupErr) {
        // Popup may be blocked or fail; fall through to redirect
      }
    }

    if (typeof loginWithRedirect === 'function') {
      // redirect won't return a token here because the page will navigate
      await loginWithRedirect({ authorizationParams });
      return null;
    }

    throw err;
  }
}
