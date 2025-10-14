import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import './Perfil.css';

// Ícone de lixeira para o botão de remover
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

function Perfil() {
  const { user, token, logout } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // NOVO: Estado de loading para o formulário de edição
  const [isUpdating, setIsUpdating] = useState(false);

  const [editName, setEditName] = useState(user?.name || '');
  const [editPassword, setEditPassword] = useState('');

  const fetchFavorites = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get('/api/favorites', { headers: { Authorization: `Bearer ${token}` } });
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true); // Ativa o loading do botão
    try {
      await api.put('/api/users/profile',
        { name: editName, password: editPassword || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await Swal.fire({
        icon: 'success', title: 'Perfil atualizado!', text: 'Faça o login novamente para ver as alterações.',
        customClass: { popup: 'swal2-popup' }
      });
      logout(); // Desloga o usuário após o alerta
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível atualizar o perfil.', customClass: { popup: 'swal2-popup' } });
    } finally {
      setIsUpdating(false); // Desativa o loading do botão
    }
  };

  const handleRemoveFavorite = async (verseId, verseRef) => {
    // NOVO: Confirmação antes de remover
    const result = await Swal.fire({
      title: 'Tem certeza?',
      html: `Você deseja remover <strong>${verseRef}</strong> dos seus favoritos?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'swal2-popup' }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/favorites/${verseId}`, { headers: { Authorization: `Bearer ${token}` } });
        setFavorites(currentFavorites => currentFavorites.filter(fav => fav.verse_id !== verseId));
        Swal.fire({
          title: 'Removido!', text: 'O versículo foi removido dos seus favoritos.', icon: 'success',
          customClass: { popup: 'swal2-popup' }
        });
      } catch (error) {
        console.error("Erro ao remover favorito", error);
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível remover o favorito.', customClass: { popup: 'swal2-popup' } });
      }
    }
  };

  return (
    <div className="perfil-container">
      <div className="user-info-card">
        <div className="user-info-header">
          <h2>Meu Perfil</h2>
          <button onClick={() => setIsEditing(!isEditing)} className="edit-button">
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>

        {!isEditing ? (
          <div className="user-details">
            <p><strong>Nome:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="edit-form">
            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <input
                id="name" type="text" value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="form-input" required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Nova Senha</label>
              <input
                id="password" type="password" value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Deixe em branco para não alterar"
                className="form-input"
              />
            </div>
            <button type="submit" className="edit-button primary" disabled={isUpdating}>
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        )}
      </div>

      <div className="favorites-section">
        <h2>Meus Favoritos</h2>
        {loadingFavorites ? <p className="loading-text">Carregando favoritos...</p> : (
          favorites.length > 0 ? (
            <div className="favorites-list">
              {favorites.map(fav => (
                <div key={fav.verse_id} className="favorite-item">
                  <div className="favorite-item-content">
                    <p className="favorite-item-text">"{fav.verse_text}"</p>
                    <p className="favorite-item-ref">{`${fav.book_name} ${fav.chapter}:${fav.verse}`}</p>
                  </div>
                  <button onClick={() => handleRemoveFavorite(fav.verse_id, `${fav.book_name} ${fav.chapter}:${fav.verse}`)} className="remove-fav-btn" title="Remover favorito">
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Você ainda não favoritou nenhum versículo.</p>
          )
        )}
      </div>
    </div>
  );
}

export default Perfil;