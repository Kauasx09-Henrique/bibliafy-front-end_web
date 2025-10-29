import { createBrowserRouter, Navigate } from 'react-router-dom';

import App from '../App';
import ProtectedLayout from '../components/ProtectedLayout';

import Login from '../pages/Login';
import Registro from '../pages/Registro';

import Home from '../pages/Home';
import Book from '../pages/Book';
import Chapter from '../pages/Chapter';
import Anotacoes from '../pages/Anotacoes';
import Perfil from '../pages/Perfil';

const router = createBrowserRouter([

  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/registro',
    element: <Registro />,
  },


  {
    path: '/',
    element: <App />,
    children: [{ index: true, element: <Navigate to="/home" replace /> }]
  },


  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'livro/:bookId',
        element: <Book />,
      },
      {
        path: 'livro/:bookId/capitulo/:chapterNum',
        element: <Chapter />,
      },
      {
        path: 'anotacoes',
        element: <Anotacoes />,
      },
      {
        path: 'perfil',
        element: <Perfil />,
      },
    ]
  }
]);

export default router;