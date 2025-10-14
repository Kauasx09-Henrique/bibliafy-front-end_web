// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Importações de Lógica e Estrutura
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import App from './App';

// 2. Importações de todas as suas Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Registro';
import Book from './pages/Book';
import Chapter from './pages/Chapter';
import Anotacoes from './pages/Anotacoes';
import Perfil from './pages/Perfil';

// 3. Importação do CSS Global
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* O componente App serve como layout (com Header e <Outlet />) */}
          <Route element={<App />}>

            {/* --- ROTAS PÚBLICAS --- */}
            <Route path="/home" element={<Home />} />
            <Route path="/livro/:bookId" element={<Book />} />
            <Route path="/livro/:bookId/capitulo/:chapterNum" element={<Chapter />} />

            {/* --- ROTAS PRIVADAS --- */}
            <Route path="/anotacoes" element={<ProtectedRoute><Anotacoes /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />

          </Route>

          {/* --- ROTAS FORA DO LAYOUT PRINCIPAL (sem Header) --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          {/* --- REDIRECIONAMENTO PADRÃO --- */}
          <Route path="*" element={<Navigate to="/home" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);