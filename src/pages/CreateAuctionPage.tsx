import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { Product } from '../interfaces/Product';

const baseUrl = import.meta.env.VITE_API_URL;

interface AuctionResponse {
  id: number;
}

const CreateAuctionPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState(0);
  const [productId, setProductId] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { getToken, userId } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(`${baseUrl}/products`);
        setProducts(response.data);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!endTime || !endTime.includes(":") || endTime.length !== 16) {
      setError('Data de término inválida. Certifique-se de que o formato seja correto.');
      return;
    }

    if (!userId) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        setError('Token de autenticação ausente');
        return;
      }

      const response = await axios.post<AuctionResponse>(
        `${baseUrl}/auctions`,
        {
          title,
          description,
          productId,
          creatorId: userId,
          startingPrice,
          endTime: `${endTime}:00`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const auctionId = response.data;
      navigate(`/auction/${auctionId}`);
    } catch (err) {
      setError('Erro ao criar leilão. Verifique os dados e tente novamente.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Criar Leilão</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Preço Inicial</label>
          <input
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label>Produto</label>
          <select
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
            required
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Data de Término</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <button type="submit">Criar Leilão</button>
      </form>
    </div>
  );
};

export default CreateAuctionPage;
