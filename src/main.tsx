import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AuthProvider from './auth/AuthProvider';
import UserInitializer from './components/UserInitializer';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserInitializer />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
