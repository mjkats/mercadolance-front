import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const UserInitializer = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const createUserIfNotExists = async () => {
      if (!isAuthenticated || !user?.sub || !user.email || !user.name) return;

      try {
        const token = await getAccessTokenSilently();
        await axios.get(`${apiUrl}/users/auth0/${encodeURIComponent(user.sub)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          try {
            const token = await getAccessTokenSilently();
            await axios.post(`${apiUrl}/users`, {
              auth0Id: encodeURIComponent(user.sub),
              email: user.email,
              name: user.name,
            }, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (createErr) {
            console.error('Erro ao criar usuário:', createErr);
          }
        } else {
          console.error('Erro ao buscar usuário:', err);
        }
      }
    };

    createUserIfNotExists();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  return null;
};

export default UserInitializer;
