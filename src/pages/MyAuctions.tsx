import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

interface Auction {
  id: number;
  title: string;
  description: string;
  startingPrice: number;
  endTime: string;
  status: 'ACTIVE' | 'FINISHED' | 'CANCELLED';
}

const MyAuctions = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get<{
          content: Auction[];
          totalPages: number;
        }>(`${apiUrl}/auctions/search?page=${page}&size=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAuctions(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        console.error(err);
        setError('Erro ao buscar seus leilões.');
      }
    };

    if (isAuthenticated) {
      fetchAuctions();
    }
  }, [isAuthenticated, page, getAccessTokenSilently]);

  const handleUpdate = async (auction: Auction) => {

    try {
      const token = await getAccessTokenSilently();
      await axios.put(`${apiUrl}/auctions/${auction.id}`, auction, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const response = await axios.get<{
        content: Auction[];
        totalPages: number;
      }>(`${apiUrl}/auctions/search?page=${page}&size=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAuctions(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar leilão.');
    }
  };

  const handleFieldChange = (id: number, field: keyof Auction, value: string) => {
    setAuctions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Meus Leilões</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="space-y-6">
        {auctions.map((auction) => (
          <div
            key={auction.id}
            className="border rounded-2xl shadow p-6 bg-white space-y-4"
          >
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={auction.title}
              onChange={(e) => handleFieldChange(auction.id, 'title', e.target.value)}
              placeholder="Título"
            />

            <textarea
              className="w-full border rounded px-3 py-2"
              value={auction.description}
              onChange={(e) => handleFieldChange(auction.id, 'description', e.target.value)}
              placeholder="Descrição"
            />

            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2"
              value={auction.endTime.slice(0, 16)}
              onChange={(e) => handleFieldChange(auction.id, 'endTime', e.target.value)}
            />

            <select
              className="w-full border rounded px-3 py-2"
              value={auction.status}
              onChange={(e) =>
                handleFieldChange(auction.id, 'status', e.target.value as Auction['status'])
              }
            >
            <option value="ACTIVE">ACTIVE</option>
            <option value="CANCELLED" disabled={auction.status == 'FINISHED'}>
              CANCELLED
              </option>
            <option value="FINISHED" disabled={auction.status == 'CANCELLED'}>
              FINISHED
            </option>
            </select>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
              onClick={() => handleUpdate(auction)}
            >
              Salvar
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-8">
        <button
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>
        <span className="text-sm">
          Página {page + 1} de {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default MyAuctions;
