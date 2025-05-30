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

        const res = await fetch(apiUrl + '/auctions/status?status=ACTIVE', { headers });
        const data = await res.json();
        setAuctions(data);
      } catch (err) {
        console.error('Erro ao buscar leilões', err);
      }
    };

    fetchAuctions();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {isAuthenticated ? (
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Bem-vindo, {user?.name}</h1>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link to="/create-auction">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
                Criar Leilão
              </button>
            </Link>
            <Link to="/my-auctions">
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded">
                Meus Leilões
              </button>
            </Link>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Sair
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-4">Bem-vindo ao Mercado Lance!</h1>
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
          >
            Fazer login
          </button>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 text-center">Leilões disponíveis</h2>
      {auctions.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum leilão disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} {...auction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;