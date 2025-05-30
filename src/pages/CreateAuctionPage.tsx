import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { Product } from '../interfaces/Product';
import { format } from 'date-fns';
import BackToHome from '../components/BackToHome';

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
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');

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
    setError('');

    if (!endTime || !endTime.includes(":") || endTime.length !== 16) {
      setError('Data de término inválida.');
      return;
    }

    if (!userId) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        setError('Token ausente');
        return;
      }

      let finalProductId: number | null = null;

      if (isCreatingProduct && newProductName.trim()) {
        console.log("creating product");
        const productRes = await axios.post<Product>(
          `${baseUrl}/products`,
          { name: newProductName },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log("productRes: " + productRes);

        console.log("finalProductId before: " + finalProductId);
        finalProductId = productRes.data.id;
        console.log("finalProductId after: " + finalProductId);

        setProducts(prev => [...prev, productRes.data]);
      } else {
        finalProductId = productId;
      }

      if (!finalProductId || finalProductId === 0) {
        setError('Produto inválido ou não selecionado.');
        return;
      }

      const response = await axios.post<AuctionResponse>(
        `${baseUrl}/auctions`,
        {
          title,
          description,
          productId: finalProductId,
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

      navigate(`/auction/${response.data.id}`);
    } catch (err) {
      console.error(err);
      setError('Erro ao criar leilão');
    }
  };


  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 shadow-md rounded-lg">
      <BackToHome />
      <h1 className="text-2xl font-bold mb-6 text-center">Criar Leilão</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Título</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Descrição</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Preço Inicial</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={startingPrice}
            onChange={(e) => setStartingPrice(Number(e.target.value))}
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            Valor formatado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(startingPrice)}
          </p>
        </div>
        <div>
          <label className="block font-medium mb-1">Produto</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={productId}
            onChange={(e) => {
              const selected = e.target.value;
              if (selected === 'create') {
                setIsCreatingProduct(true);
                setProductId(0);
              } else {
                setProductId(Number(selected));
                setIsCreatingProduct(false);
              }
            }}
            required={!isCreatingProduct}
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
            <option value="create">+ Criar novo produto</option>
          </select>
        </div>
        {isCreatingProduct && (
          <div className="mt-2">
            <label className="block font-medium mb-1">Nome do Novo Produto</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label className="block font-medium mb-1">Data de Término</label>
          <input
            type="datetime-local"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
          {endTime && (
            <p className="text-sm text-gray-600 mt-1">
              Data formatada: {format(new Date(endTime), 'dd/MM/yyyy HH:mm')}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Criar Leilão
        </button>
      </form>
    </div>
  );
};

export default CreateAuctionPage;
