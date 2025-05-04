import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { parseISO, format } from 'date-fns';
import { AuctionBid } from '../interfaces/AuctionBid';
import { useAuth } from '../auth/AuthContext';

const apiUrl = import.meta.env.VITE_API_URL;

function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === "object" && error !== null && "isAxiosError" in error;
}

const AuctionDetailPage = () => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const [auction, setAuction] = useState<AuctionBid | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const { getToken, userId } = useAuth();

  useEffect(() => {
    axios
      .get<AuctionBid>(`${apiUrl}/auctions/${auctionId}`)
      .then((response) => {
        setAuction(response.data);
      })
      .catch((error) => {
        if (isAxiosError(error)) {
          if (error.response) {
            setError('Erro ao carregar detalhes do leilão');
          } else if (error.request) {
            setError('Nenhuma resposta recebida');
          } else {
            setError('Erro na configuração da requisição');
          }
        } else {
          setError('Erro inesperado');
        }
      });
  }, [auctionId]);

  const handleBid = async () => {
    setError('');

    if (!auction) {
      setError('Leilão não carregado');
      return;
    }

    const now = new Date();
    const auctionEndTime = new Date(auction.endTime);

    if (now >= auctionEndTime) {
      setError('Leilão encerrado');
      return;
    }

    if (auction.status !== 'ACTIVE') {
      setError('Leilão não está ativo');
      return;
    }

    if (bidAmount <= 0) {
      setError('Valor do lance deve ser positivo');
      return;
    }

    if (bidAmount <= auction.highestBidAmount) {
      setError('Valor do lance deve ser maior que o maior lance atual');
      return;
    }

    try {
      const token = await getToken();
      if (!token || !userId) {
        setError('Usuário não autenticado');
        return;
      }

      await axios.post(`${apiUrl}/bids`, {
        userId,
        auctionId,
        amount: bidAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Lance feito com sucesso!');
    } catch (error) {
      if (isAxiosError(error)) {
        setError('Erro ao fazer lance');
      } else {
        setError('Erro inesperado ao fazer lance');
      }
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {auction ? (
        <div>
          <h1>{auction.title}</h1>
          <p>{auction.description}</p>
          <p>Produto: {auction.product.name}</p>
          <p>Preço inicial: R${auction.startingPrice}</p>
          <p>Criado por: {auction.createdBy?.name || 'Desconhecido'}</p>
          <p>Maior lance atual: R$ {auction.highestBidAmount.toFixed(2)}</p>
          <p>Termina em: {format(parseISO(auction.endTime), "dd/MM/yyyy HH:mm")}</p>

          <h2>Fazer um lance</h2>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            placeholder="Valor do lance"
          />
          <button onClick={handleBid}>Enviar Lance</button>
        </div>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
};

export default AuctionDetailPage;
