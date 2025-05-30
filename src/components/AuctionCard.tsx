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
    <div className="bg-white rounded-xl shadow-md p-6 border hover:shadow-lg transition duration-300">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700 mb-2">{description}</p>
      <p className="mb-1">
        <strong>Preço inicial:</strong> {formatCurrency(startingPrice)}
      </p>
      <p className="mb-1">
        <strong>Maior lance:</strong> {formatCurrency(currentHighestBid)}
      </p>
      <p className="mb-4">
        <strong>Termina em:</strong> {format(parseISO(endTime), 'dd/MM/yyyy HH:mm')}
      </p>
      <Link
        to={`/auction/${id}`}
        className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Ver Detalhes
      </Link>
    </div>
  );
};
