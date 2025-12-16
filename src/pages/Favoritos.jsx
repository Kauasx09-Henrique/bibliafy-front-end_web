import React, { useEffect, useState } from "react";
import { Trash2, Bookmark, Heart } from "lucide-react";
import Swal from "sweetalert2";
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

  const handleRemoveFavorite = async (id, ref) => {
    // Alerta Personalizado (Dark Glass)
    const result = await Swal.fire({
      title: "Remover favorito?",
      html: `
        <div style="display: flex; flex-direction: column; gap: 6px; align-items: center;">
          <p style="opacity: 0.8; font-size: 0.95rem; margin: 0;">Você quer remover este versículo:</p>
          <strong style="color: #5ac8fa; font-size: 1.05rem;">${ref}</strong>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
      background: "rgba(15, 15, 15, 0.95)",
      color: "#f5f5f5",
      backdrop: `rgba(0,0,0,0.6) backdrop-filter: blur(4px)`,
      customClass: {
        popup: "glass-popup",
        confirmButton: "btn-confirm-delete",
        cancelButton: "btn-cancel-delete",
        title: "popup-title"
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      // Otimistic Update (Remove da tela na hora)
      setFavorites((prev) => prev.filter((f) => f.verse_id !== id));
      
      try {
        await api.delete(`/api/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          background: '#151515',
          color: '#fff'
        });
        
        Toast.fire({
          icon: 'success',
          title: 'Favorito removido'
        });

      } catch (error) {
        // Se der erro, recarrega a lista original
        loadFavorites();
      }
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="fav-page">
      <div className="fav-header">
        <div className="fav-header-icon-box">
          <Heart size={26} color="#fff" />
        </div>
        <div className="fav-header-text">
          <h1>Favoritos</h1>
          <p>{favorites.length} versículos salvos</p>
        </div>
      </div>

      {loading && (
        <div className="fav-skeleton-container">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="fav-skeleton" />
          ))}
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="fav-list">
          {favorites.map((fav) => (
            <div key={fav.verse_id} className="fav-card glass-card fade-in">
              <div className="fav-content-wrapper">
                <div className="fav-icon-box">
                  <Bookmark size={20} />
                </div>

                <div className="fav-text-group">
                  <p className="fav-verse">“{fav.verse_text}”</p>
                  <span className="fav-ref">
                    {fav.book_name} {fav.chapter}:{fav.verse}
                  </span>
                </div>
              </div>

              <button
                className="fav-remove-btn"
                onClick={() => handleRemoveFavorite(fav.verse_id, `${fav.book_name} ${fav.chapter}:${fav.verse}`)}
                aria-label="Remover favorito"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && favorites.length === 0 && (
        <div className="fav-empty fade-in">
          <Bookmark className="fav-empty-icon" size={48} />
          <p>Sua lista está vazia</p>
          <span>Toque na estrela enquanto lê para salvar.</span>
        </div>
      )}
    </div>
  );
}