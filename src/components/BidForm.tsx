import React, { useState } from 'react';
import axios from 'axios';

interface BidFormProps {
  auctionId: number;
}

const BidForm: React.FC<BidFormProps> = ({ auctionId }) => {
  const [bidAmount, setBidAmount] = useState(0);
  const [error, setError] = useState('');

  const handleBid = () => {
    if (bidAmount <= 0) {
      setError('Valor do lance deve ser positivo');
      return;
    }

    axios.post(`/api/bids`, { auctionId, amount: bidAmount }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(() => {
        alert('Lance feito com sucesso!');
      })
      .catch(() => {
        setError('Erro ao fazer lance');
      });
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="number"
        value={bidAmount}
        onChange={(e) => setBidAmount(Number(e.target.value))}
        placeholder="Valor do lance"
      />
      <button onClick={handleBid}>Enviar Lance</button>
    </div>
  );
};

export default BidForm;