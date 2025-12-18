import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import { LogOut, Edit2, Save, X, Trash2, Camera, User, Lock, Mail } from 'lucide-react';
import './Perfil.css';

function Perfil() {
  const { user, token, logout } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [editName, setEditName] = useState(user?.name || "");
  const [editNickname, setEditNickname] = useState(user?.nickname || "");
  const [editPassword, setEditPassword] = useState("");

  const getInitialAvatar = () => {
    if (user?.logo_url) return user.logo_url;
    const stored = localStorage.getItem("avatar");
    if (stored) return stored;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random&color=fff&size=256`;
  };

  const [avatar, setAvatar] = useState(getInitialAvatar());

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditNickname(user.nickname || "");
      if (user.logo_url) setAvatar(user.logo_url);
    }
  }, [user]);

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      Swal.fire("Erro", "A imagem deve ter no máximo 2MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

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
          logo_url: avatar
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      localStorage.setItem("avatar", avatar);

      await Swal.fire({
        icon: "success",
        title: "Perfil atualizado!",
        text: "Suas alterações foram salvas com sucesso.",
        background: '#151515',
        color: '#fff',
        confirmButtonColor: '#fff'
      });

      window.location.reload();

    } catch (err) {
      const msg = err.response?.data?.message || "Não foi possível atualizar o perfil.";
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: msg,
        background: '#151515',
        color: '#fff'
      });
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  const handleRemoveFavorite = async (verseId, ref) => {
    const result = await Swal.fire({
      title: "Remover favorito?",
      text: `Deseja remover ${ref}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
      background: '#151515',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#333'
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/favorites/${verseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites((prev) => prev.filter((f) => f.verse_id !== verseId));
      Swal.fire({
        title: "Removido!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: '#151515',
        color: '#fff'
      });
    } catch {
      Swal.fire("Erro", "Não foi possível remover.", "error");
    }
  };

  return (
    <div className="perfil-page">
      <div className="perfil-container">

        <div className="perfil-card glass-effect">
          <div className="perfil-header-bg"></div>

          <div className="perfil-content">
            <div className="avatar-wrapper">
              <div className="avatar-circle">
                <img src={avatar} alt="Avatar" className="avatar-img" />

                {isEditing && (
                  <label htmlFor="avatar-upload" className="avatar-edit-overlay">
                    <Camera size={24} color="#fff" />
                    <span>Alterar</span>
                  </label>
                )}
              </div>

              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={!isEditing}
                style={{ display: "none" }}
              />
            </div>

            {!isEditing ? (
              <div className="perfil-static-info">
                <h2>{user?.nickname || user?.name}</h2>
                <p className="email-text">{user?.email}</p>

                <div className="perfil-actions">
                  <button onClick={() => setIsEditing(true)} className="btn-primary">
                    <Edit2 size={16} /> Editar Perfil
                  </button>
                  <button onClick={logout} className="btn-outline-danger">
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="perfil-edit-form">
                <div className="input-group-dark">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="input-group-dark">
                  <span className="input-at">@</span>
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    placeholder="Apelido"
                  />
                </div>

                <div className="input-group-dark">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Nova senha (opcional)"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">
                    <X size={18} /> Cancelar
                  </button>
                  <button type="submit" disabled={isUpdating} className="btn-save">
                    {isUpdating ? "Salvando..." : <><Save size={18} /> Salvar</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="favorites-section">
          <h3 className="section-title">Meus Favoritos</h3>

          {loadingFavorites ? (
            <div className="loading-state">Carregando versículos...</div>
          ) : favorites.length > 0 ? (
            <div className="favorites-grid">
              {favorites.map((fav) => (
                <div key={fav.verse_id} className="favorite-card glass-effect">
                  <div className="fav-content">
                    <p className="fav-text">"{fav.verse_text}"</p>
                    <span className="fav-ref">
                      {fav.book_name} {fav.chapter}:{fav.verse}
                    </span>
                  </div>
                  <button
                    className="fav-delete-btn"
                    onClick={() => handleRemoveFavorite(fav.verse_id, `${fav.book_name} ${fav.chapter}:${fav.verse}`)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Você ainda não favoritou nenhum versículo.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Perfil;