import { useEffect, useState } from 'react';
import axios from 'axios';
import { Auction } from '../interfaces/Auction';
import { useAuth } from '../auth/AuthContext';
import BackToHome from '../components/BackToHome';

const baseUrl = import.meta.env.VITE_API_URL;

const MyAuctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<Partial<Auction>>({});
  const [error, setError] = useState('');
  const { userId, getToken } = useAuth();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(`${baseUrl}/auctions/search`, {
          params: { creatorId: userId, page: 0, size: 20 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAuctions(response.data.content);
      } catch (err) {
        setError('Erro ao carregar leilões');
      }
    };

    fetchAuctions();
  }, [userId, getToken]);

  const handleEditClick = (auction: Auction) => {
    setEditingId(auction.id);
    setFormState({ ...auction });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormState({});
  };

  const handleChange = (field: keyof Auction, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const token = await getToken();

      const updatedAuction = {
        ...formState,
        endTime: formState.endTime ? new Date(formState.endTime).toISOString() : undefined,
      };

      await axios.put(`${baseUrl}/auctions/${formState.id}`, updatedAuction, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setAuctions((prev) =>
        prev.map((a) =>
          a.id === formState.id ? { ...a, ...updatedAuction } as Auction : a
        )
      );
      setEditingId(null);
      setFormState({});
      setError('');
    } catch (err) {
      setError('Erro ao salvar alterações');
    }
  };

  const handleDeleteAuction = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover os dados do leilão? Essa ação é irreversível.')) return;

    try {
      const token = await getToken();
      await axios.delete(`${baseUrl}/auctions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuctions((prev) => prev.filter((a) => a.id !== id));
      alert('Leilão removido com sucesso!');
      if (editingId === id) {
        setEditingId(null);
        setFormState({});
      }
      setError('');
    } catch (err) {
      setError('Erro ao remover leilão');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <BackToHome />
      <h1 className="text-3xl font-bold text-center mb-6">Meus Leilões</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {auctions.map((auction) => (
          <div
            key={auction.id}
            className={`border rounded-xl p-4 shadow-sm ${
              editingId === auction.id ? 'border-blue-500 bg-blue-50' : 'bg-white'
            }`}
          >
            {editingId === auction.id ? (
              <>
                <input
                  type="text"
                  value={formState.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full mb-2 px-3 py-2 border rounded"
                  placeholder="Título"
                  disabled
                />
                <textarea
                  value={formState.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full mb-2 px-3 py-2 border rounded"
                  placeholder="Descrição"
                />
                <input
                  type="datetime-local"
                  value={(formState.endTime || '').slice(0, 16)}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="w-full mb-2 px-3 py-2 border rounded"
                />
                <select
                  value={formState.status || ''}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full mb-2 px-3 py-2 border rounded"
                  disabled={
                    formState.status !== 'ACTIVE' && formState.status !== 'CANCELLED'
                  }
                >
                  {formState.status === 'ACTIVE' && <option value="ACTIVE">Ativo</option>}
                  {(formState.status === 'ACTIVE' || formState.status === 'CANCELLED') && (
                    <option value="CANCELLED">Cancelado</option>
                  )}
                </select>

                <div className="flex justify-between gap-2 mb-2">
                  <button
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    onClick={handleSave}
                  >
                    Salvar
                  </button>
                  <button
                    className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </button>
                </div>

                {formState.status === 'CANCELLED' && (
                  <button
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                    onClick={() => handleDeleteAuction(auction.id)}
                  >
                    Remover dados do leilão
                  </button>
                )}
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{auction.title}</h2>
                <p className="text-gray-600 mb-1">{auction.description}</p>
                <p className="text-sm mb-1">
                  <strong>Termina em:</strong>{' '}
                  {new Date(auction.endTime).toLocaleString('pt-BR')}
                </p>
                <p className="text-sm mb-3">
                  <strong>Status:</strong> {auction.status}
                </p>
                {auction.status === 'ACTIVE' && (
                  <button
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    onClick={() => handleEditClick(auction)}
                  >
                    Editar
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAuctions;
