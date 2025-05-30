import { Route, Routes } from 'react-router-dom';
import AuctionDetailPage from './pages/AuctionDetailPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import HomePage from './pages/HomePage';
import PrivateRoute from './components/PrivateRoute';
import MyAuctions from './pages/MyAuctions';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/auction/:auctionId"
        element={
          <PrivateRoute>
            <AuctionDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/create-auction"
        element={
          <PrivateRoute>
            <CreateAuctionPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-auctions"
        element={
          <PrivateRoute>
            <MyAuctions />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
