import { ReactNode, useState, useEffect, useCallback } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { UserResponse } from '../interfaces/UserResponse';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_API_IDENTIFIER;
const apiUrl = import.meta.env.VITE_API_URL;

interface AuthProviderProps {
  children: ReactNode;
}

const AuthWrapper = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<number | undefined>(undefined);

  const fetchToken = useCallback(async (): Promise<string | undefined> => {
    if (isAuthenticated) {
      const accessToken = await getAccessTokenSilently();
      setToken(accessToken);
      return accessToken;
    }
    return undefined;
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (isAuthenticated && !token) {
      fetchToken();
    }
  }, [isAuthenticated, token, fetchToken]);

  useEffect(() => {
    const createOrFetchUser = async () => {
      if (!isAuthenticated || !user?.sub || !user.email || !user.name) return;

      try {
        const accessToken = await getAccessTokenSilently();
        const response = await axios.get<UserResponse>(
          `${apiUrl}/users/auth0/${encodeURIComponent(user.sub)}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        
        setUserId(response.data.id);

      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          try {
            const createResponse = await axios.post<UserResponse>(
              `${apiUrl}/users`,
              {
                auth0Id: encodeURIComponent(user.sub),
                email: user.email,
                name: user.name,
              },
              {
                headers: {
                  Authorization: `Bearer ${await getAccessTokenSilently()}`,
                },
              }
            );
            
            setUserId(createResponse.data.id);

          } catch (createErr) {
            console.error('Erro ao criar usuário:', createErr);
          }
        } else {
          console.error('Erro ao verificar usuário:', err);
        }
      }
    };

    createOrFetchUser();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loginWithRedirect,
        logout,
        getToken: fetchToken,
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
      }}
      onRedirectCallback={(appState) => navigate(appState?.returnTo || '/')}
      cacheLocation="localstorage"
    >
      <AuthWrapper>{children}</AuthWrapper>
    </Auth0Provider>
  );
};

export default AuthProvider;
