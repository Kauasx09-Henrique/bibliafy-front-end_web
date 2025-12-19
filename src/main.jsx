import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";
import HealthCheck from "./components/HealthCheck"; // <--- IMPORTANTE: Importe aqui

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Book from "./pages/Book";
import Chapter from "./pages/Chapter";
import Anotacoes from "./pages/Anotacoes";
import Perfil from "./pages/Perfil";
import FavoritesPage from "./pages/Favoritos";
import Statistics from "./pages/Statistics";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#151515',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '10px',
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#151515' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#151515' },
            },
          }}
        />

        <HealthCheck>
          <Routes>
            <Route element={<App />}>
              <Route path="/home" element={<Home />} />
              <Route path="/livro/:bookId" element={<Book />} />
              <Route path="/livro/:bookId/capitulo/:chapterId" element={<Chapter />} />

              <Route
                path="/anotacoes"
                element={
                  <ProtectedRoute>
                    <Anotacoes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Perfil />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/favoritos"
                element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/estatisticas"
                element={
                  <ProtectedRoute>
                    <Statistics />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </HealthCheck>

      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);