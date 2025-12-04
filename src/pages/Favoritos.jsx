// src/pages/Favoritos.jsx

import React, { useEffect, useState } from "react";
import { Trash2, Bookmark, Heart } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./Favorito.css";

export default function Favoritos() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    try {
      const r = await api.get("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(r.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(id) {
    setFavorites((prev) => prev.filter((f) => f.verse_id !== id));
    try {
      await api.delete(`/api/favorites/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="fav-page">

      <div className="fav-header">
        <Heart className="fav-header-icon" size={32} />
        <h1>Favoritos</h1>
      </div>

      {loading && (
        <div className="fav-skeleton-container">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="fav-skeleton" />
          ))}
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="fav-list">
          {favorites.map((fav) => (
            <div key={fav.verse_id} className="fav-card glass-card fade-in">
              <div className="fav-info">
                <Bookmark size={18} className="fav-icon" />
                <div>
                  <p className="fav-verse">“{fav.verse_text}”</p>
                  <span className="fav-ref">
                    {fav.book_name} {fav.chapter}:{fav.verse}
                  </span>
                </div>
              </div>

              <button
                className="fav-remove-btn"
                onClick={() => removeFavorite(fav.verse_id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && favorites.length === 0 && (
        <div className="fav-empty fade-in">
          <Bookmark className="fav-empty-icon" size={48} />
          <p>Nenhum favorito ainda.</p>
          <span>Toque na estrela enquanto lê para favoritar um versículo.</span>
        </div>
      )}
    </div>
  );
}
