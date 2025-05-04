import { useAuth } from '../auth/AuthContext';

const LoginPage = () => {
  const { loginWithRedirect } = useAuth();

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Bem-vindo ao Mercado de Leilões</h1>
      <button onClick={() => loginWithRedirect()}>Entrar com Auth0</button>
    </div>
  );
};

export default LoginPage;
