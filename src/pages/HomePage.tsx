import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { AuctionCard } from '../components/AuctionCard';
import { AuctionBid } from '../interfaces/AuctionBid';

const apiUrl = import.meta.env.VITE_API_URL;

const HomePage = () => {
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect, logout, user } = useAuth0();
  const [auctions, setAuctions] = useState<AuctionBid[]>([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        let headers: HeadersInit = {};

        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          headers = {
            Authorization: `Bearer ${token}`,
          };
        }

        const res = await fetch(apiUrl + '/auctions/status?status=ACTIVE', {
          headers,
        });

        const data = await res.json();
        setAuctions(data);
      } catch (err) {
        console.error('Erro ao buscar leilões', err);
      }
    };

    fetchAuctions();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <div>
      {isAuthenticated ? (
        <>
          <h1>Bem-vindo, {user?.name}</h1>
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Sair
          </button>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/create-auction">
              <button>Criar Leilão</button>
            </Link>
            <Link to="/my-auctions" style={{ marginLeft: '1rem' }}>
              <button>Meus Leilões</button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1>Bem-vindo ao Mercado Lance!</h1>
          <button onClick={() => loginWithRedirect()}>Fazer login</button>
        </>
      )}

      <h2>Leilões disponíveis</h2>
      {auctions.length === 0 ? (
        <p>Nenhum leilão disponível no momento.</p>
      ) : (
        auctions.map((auction) => (
          <AuctionCard key={auction.id} {...auction} />
        ))
      )}
    </div>
  );
};

export default HomePage;
