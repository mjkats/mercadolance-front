import { Link } from 'react-router-dom';

const BackToHome = () => (
  <div className="mb-4">
    <Link
      to="/"
      className="text-blue-600 hover:underline inline-flex items-center"
    >
      ← Voltar para a página inicial
    </Link>
  </div>
);

export default BackToHome;