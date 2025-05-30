import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { parseISO, format } from 'date-fns';
import { AuctionBid } from '../interfaces/AuctionBid';
import { useAuth } from '../auth/AuthContext';
import BackToHome from '../components/BackToHome';

const apiUrl = import.meta.env.VITE_API_URL;

interface Bid {
  user: {
    name: string;
  };
  amount: number;
  createdAt: string;
}

const AuctionDetailPage = () => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const [auction, setAuction] = useState<AuctionBid | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const { getToken, userId } = useAuth();

  useEffect(() => {
    axios
      .get<AuctionBid>(`${apiUrl}/auctions/${auctionId}`)
      .then((res) => setAuction(res.data))
      .catch(() => setError('Erro ao carregar detalhes do leilão'));
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return;

    axios
      .get<{ content: Bid[] }>(`${apiUrl}/bids/search`, {
        params: {
          auctionId,
          size: 20,
          sort: 'createdAt,desc'
        }
      })
      .then(res => setBids(res.data.content))
      .catch(() => setError('Erro ao carregar histórico de lances'));
  }, [auctionId]);

  const handleBid = async () => {
    setError('');
    if (!auction) return setError('Leilão não carregado');

    const now = new Date();
    if (now >= new Date(auction.endTime)) return setError('Leilão encerrado');
    if (auction.status !== 'ACTIVE') return setError('Leilão não está ativo');
    if (bidAmount <= auction.highestBidAmount) return setError('Lance insuficiente');

    try {
      const token = await getToken();
      if (!token || !userId) return setError('Usuário não autenticado');

      await axios.post(`${apiUrl}/bids`, {
        userId,
        auctionId,
        amount: bidAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAuction(prev => prev ? { ...prev, highestBidAmount: bidAmount } : prev);
      alert('Lance feito com sucesso!');
      setBidAmount(0);

      // Atualiza o histórico de lances após novo lance
      const bidsRes = await axios.get<{ content: Bid[] }>(`${apiUrl}/bids/search`, {
        params: { auctionId, size: 20, sort: 'createdAt,desc' }
      });
      setBids(bidsRes.data.content);

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.userMessage) {
        setError(error.response.data.userMessage);
      } else {
        setError('Erro ao fazer lance, tente novamente');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <BackToHome />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {auction ? (
        <>
          <h1 className="text-2xl font-bold mb-4">{auction.title}</h1>
          <p className="mb-2"><strong>Descrição:</strong> {auction.description}</p>
          <p className="mb-2"><strong>Produto:</strong> {auction.product.name}</p>
          <p className="mb-2"><strong>Preço inicial:</strong> R$ {auction.startingPrice}</p>
          <p className="mb-2"><strong>Criador:</strong> {auction.createdBy?.name || 'Desconhecido'}</p>
          <p className="mb-2"><strong>Maior lance atual:</strong> R$ {auction.highestBidAmount.toFixed(2)}</p>
          <p className="mb-4"><strong>Termina em:</strong> {format(parseISO(auction.endTime), "dd/MM/yyyy HH:mm")}</p>

          <div className="space-y-2 mb-6">
            <h2 className="text-lg font-semibold">Fazer um lance</h2>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              className="w-full border px-3 py-2 rounded"
              placeholder="Valor do lance"
            />
            <button
              onClick={handleBid}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Enviar Lance
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Histórico de Lances</h2>
            {bids.length === 0 && <p>Nenhum lance registrado.</p>}
            <ul className="space-y-1 max-h-60 overflow-y-auto border rounded p-2">
              {bids.map((bid, index) => (
                <li key={index} className="flex justify-between border-b py-1">
                  <span>{bid.user.name}</span>
                  <span>R$ {bid.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
};

export default AuctionDetailPage;
