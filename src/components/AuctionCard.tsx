import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { parseISO, format } from 'date-fns';

interface Props {
  id: number;
  title: string;
  description: string;
  startingPrice: number;
  endTime: string;
  highestBidAmount: number;
}

const apiUrl = import.meta.env.VITE_API_URL;

export const AuctionCard = ({ id, title, description, startingPrice, endTime, highestBidAmount }: Props) => {
  const [currentHighestBid, setCurrentHighestBid] = useState<number>(highestBidAmount);

  useEffect(() => {
    const eventSource = new EventSource(`${apiUrl}/bids/bid-updates/${id}`);

    eventSource.addEventListener("bid-update", (event) => {
      const newBid = parseFloat(event.data);
      setCurrentHighestBid(newBid);
    });

    eventSource.onerror = () => {
      console.error('Erro ao receber atualizações de lances');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="auction-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <p><strong>Preço inicial:</strong> {formatCurrency(startingPrice)}</p>
      <p><strong>Maior lance:</strong> {formatCurrency(currentHighestBid)}</p>
      <p><strong>Termina em:</strong> {format(parseISO(endTime), 'dd/MM/yyyy HH:mm')}</p>
      <Link to={`/auction/${id}`}>Ver Detalhes do Leilão</Link>
    </div>
  );
};
