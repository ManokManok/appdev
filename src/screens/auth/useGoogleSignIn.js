import { useCallback, useEffect, useMemo } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { API_WEB_URL } from '../../utils/apiConfig';

WebBrowser.maybeCompleteAuthSession();

const MOBILE_GOOGLE_REDIRECT = 'onins://oauth';
const MOBILE_GOOGLE_AUTH_URL = `${API_WEB_URL}/connect/google?platform=mobile`;

const parseOAuthRedirect = url => {
  const queryStart = url.indexOf('?');
  const query = queryStart >= 0 ? url.slice(queryStart + 1) : '';
  const params = new URLSearchParams(query);
  const status = params.get('status');

  if (status === 'error') {
    throw new Error(params.get('error') || 'Google sign-in failed.');
  }

  if (status === 'success') {
    const token = params.get('token');
    if (!token) {
      throw new Error('Google sign-in did not return a token.');
    }
    return token;
  }

  throw new Error('Google sign-in was cancelled.');
};

export const useGoogleSignIn = onJwt => {
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const result = await WebBrowser.openAuthSessionAsync(
      MOBILE_GOOGLE_AUTH_URL,
      MOBILE_GOOGLE_REDIRECT,
      {
        createTask: false,
        showInRecents: false,
      }
    );

    if (result.type === 'success' && result.url) {
      const jwt = parseOAuthRedirect(result.url);
      await onJwt(jwt);
      return;
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Google sign-in was cancelled.');
    }

    throw new Error('Google sign-in failed.');
  }, [onJwt]);

  return useMemo(
    () => ({
      signInWithGoogle,
      isGoogleReady: true,
      GoogleSignInHost: null,
    }),
    [signInWithGoogle]
  );
};
