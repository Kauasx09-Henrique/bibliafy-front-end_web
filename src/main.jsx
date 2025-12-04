import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Book from "./pages/Book";
import Chapter from "./pages/Chapter";
import Anotacoes from "./pages/Anotacoes";
import Perfil from "./pages/Perfil";
import FavoritesPage from "./pages/Favoritos";
import ForgotPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <BrowserRouter>

      <AuthProvider>

        <Toaster
          position="top-center"
          gutter={10}
          toastOptions={{
            duration: 3000,
            style: {
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              fontSize: "14px",
              padding: "12px 18px",
              borderRadius: "14px",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.35), inset 0 0 8px rgba(255,255,255,0.06)",
              animation: "toastSlideUp 0.45s ease",
            },
            success: {
              iconTheme: {
                primary: "#5AC8FA",
                secondary: "#000",
              },
              style: {
                borderColor: "rgba(90,200,250,0.45)",
                boxShadow:
                  "0 4px 22px rgba(90,200,250,0.25), inset 0 0 8px rgba(90,200,250,0.2)",
              },
            },
            error: {
              iconTheme: {
                primary: "#ff6b6b",
                secondary: "#000",
              },
              style: {
                borderColor: "rgba(255,107,107,0.45)",
                boxShadow:
                  "0 4px 22px rgba(255,107,107,0.25), inset 0 0 8px rgba(255,107,107,0.2)",
              },
            },
          }}
        />

        <Routes>

          <Route element={<App />}>
            <Route path="/home" element={<Home />} />
            <Route path="/livro/:bookId" element={<Book />} />

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
          </Route>

          <Route
            path="/livro/:bookId/capitulo/:chapterNum"
            element={<Chapter />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/reset-password" element={<ForgotPassword />} />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>

      </AuthProvider>

    </BrowserRouter>

  </React.StrictMode>
);
