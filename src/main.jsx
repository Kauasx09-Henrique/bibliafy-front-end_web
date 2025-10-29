
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import App from './App';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Registro';
import Book from './pages/Book';
import Chapter from './pages/Chapter';
import Anotacoes from './pages/Anotacoes';
import Perfil from './pages/Perfil';
import FavoritesPage from './pages/Favoritos.jsx';

import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<App />}>

            <Route path="/home" element={<Home />} />
            <Route path="/livro/:bookId" element={<Book />} />
            <Route path="/livro/:bookId/capitulo/:chapterNum" element={<Chapter />} />


            <Route path="/anotacoes" element={<ProtectedRoute><Anotacoes /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />

            <Route path="/favoritos" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          </Route>


          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />


          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);