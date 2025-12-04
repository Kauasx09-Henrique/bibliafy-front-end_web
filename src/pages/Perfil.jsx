import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import './Perfil.css';

import { LogOut, Edit, Trash2, Camera } from 'lucide-react';

function Perfil() {
  const { user, token, logout } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Campos que podem ser editados
  const [editName, setEditName] = useState(user?.name || "");
  const [editNickname, setEditNickname] = useState(user?.nickname || "");
  const [editPassword, setEditPassword] = useState("");

  // Avatar salvo no localStorage
  const [avatar, setAvatar] = useState(
    localStorage.getItem("avatar") || "/avatar-default.png"
  );

  const fetchFavorites = useCallback(async () => {
    if (!token) return;

    try {
      const response = await api.get("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data);
    } catch (error) {
      console.error("Erro ao buscar favoritos", error);
    } finally {
      setLoadingFavorites(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Mudar avatar local
const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    const base64 = reader.result;
    setAvatar(base64);
    localStorage.setItem("avatar", base64);
  };

  reader.readAsDataURL(file);
};


  // Salvar alterações de perfil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await api.put(
        "/api/users/profile",
        {
          name: editName,
          nickname: editNickname,
          password: editPassword || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Perfil atualizado!",
        text: "Faça login novamente para ver as alterações.",
      });

      logout();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível atualizar o perfil.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Remover favorito
  const handleRemoveFavorite = async (verseId, ref) => {
    const result = await Swal.fire({
      title: "Remover favorito?",
      html: `Deseja remover <strong>${ref}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/favorites/${verseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavorites((prev) => prev.filter((f) => f.verse_id !== verseId));

      Swal.fire("Removido!", "", "success");
    } catch {
      Swal.fire("Erro", "Não foi possível remover.", "error");
    }
  };

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        
        {/* Avatar */}
        <div className="perfil-avatar">
          <img src={avatar} alt="Avatar do usuário" />
          <label htmlFor="avatar-upload" className="camera-icon">
            <Camera size={20} />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Dados do usuário */}
        <div className="perfil-info">
          <h2>{user?.nickname || user?.name}</h2>
          <p>{user?.email}</p>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="edit-btn"
          >
            <Edit size={18} /> {isEditing ? "Cancelar" : "Editar Perfil"}
          </button>

          <button onClick={logout} className="logout-btn">
            <LogOut size={18} /> Sair
          </button>
        </div>

        {/* Formulário de edição */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="edit-form">

            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nome completo"
            />

            <input
              type="text"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              placeholder="Apelido"
            />

            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Nova senha"
            />

            <button type="submit" disabled={isUpdating}>
              {isUpdating ? "Salvando..." : "Salvar alterações"}
            </button>

          </form>
        )}
      </div>

      {/* Favoritos */}
      <div className="favoritos-card">
        <h3>📖 Meus Favoritos</h3>

        {loadingFavorites ? (
          <p className="loading-text">Carregando...</p>
        ) : favorites.length > 0 ? (
          <div className="favoritos-list">
            {favorites.map((fav) => (
              <div key={fav.verse_id} className="favorito-item">
                <div className="favorito-texto">
                  <p>"{fav.verse_text}"</p>
                  <span>
                    {fav.book_name} {fav.chapter}:{fav.verse}
                  </span>
                </div>

                <button
                  className="remove-fav-btn"
                  onClick={() =>
                    handleRemoveFavorite(
                      fav.verse_id,
                      `${fav.book_name} ${fav.chapter}:${fav.verse}`
                    )
                  }
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            Você ainda não favoritou nenhum versículo.
          </p>
        )}
      </div>
    </div>
  );
}

export default Perfil;
