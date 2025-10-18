import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import NoteModal from '../components/NoteModal';
import './Anotacoes.css';
import { Edit, Trash2, Search } from 'lucide-react';

function Anotacoes() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.get('/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data);
    } catch (err) {
      console.error("Erro ao buscar anotações", err);
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível carregar as anotações.', customClass: { popup: 'swal2-popup' }});
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDeleteNote = async (noteId, verseRef) => {
    const result = await Swal.fire({
      title: 'Remover Anotação?',
      html: `Deseja remover a anotação do versículo <strong>${verseRef}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'swal2-popup' }
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/notes/${noteId}`, { headers: { Authorization: `Bearer ${token}` } });
        setNotes(prev => prev.filter(n => n.id !== noteId));
        Swal.fire({ icon: 'success', title: 'Anotação removida!', showConfirmButton: false, timer: 1500, customClass: { popup: 'swal2-popup' } });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível remover a anotação.', customClass: { popup: 'swal2-popup' } });
      }
    }
  };

  const handleUpdateNote = async (noteData) => {
    try {
      const { title, content } = noteData;
      await api.put(`/api/notes/${editingNote.id}`, { title, content }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingNote(null);
      fetchNotes();
      Swal.fire({ icon: 'success', title: 'Anotação atualizada!', showConfirmButton: false, timer: 1500, customClass: { popup: 'swal2-popup' } });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível atualizar a anotação.', customClass: { popup: 'swal2-popup' } });
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.verse_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="anotacoes-container">
      <h1>Minhas Anotações</h1>

      <div className="search-bar-container">
        <Search size={20} />
        <input
          type="text"
          placeholder="Pesquisar anotação..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="loading-message">Carregando anotações...</p>
      ) : (
        <div className="notes-list">
          {filteredNotes.length > 0 ? filteredNotes.map(note => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <h3 className="note-title">{note.title}</h3>
                <div className="note-actions">
                  <button onClick={() => setEditingNote(note)} title="Editar"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteNote(note.id, `${note.book_name} ${note.chapter}:${note.verse}`)} title="Excluir"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="note-content">{note.content}</p>
              <div className="verse-quote">
                <span className="verse-quote-text">"{note.verse_text}"</span>
                <span className="verse-quote-ref">{`${note.book_name} ${note.chapter}:${note.verse}`}</span>
              </div>
            </div>
          )) : (
            <p className="empty-state">Você ainda não criou nenhuma anotação.</p>
          )}
        </div>
      )}

      {editingNote && (
        <NoteModal
          verse={{
            id: editingNote.verse_id,
            text: editingNote.verse_text,
            number: editingNote.verse,
            chapter: editingNote.chapter,
            bookName: editingNote.book_name
          }}
          initialData={{ title: editingNote.title, content: editingNote.content }}
          onClose={() => setEditingNote(null)}
          onSave={handleUpdateNote}
        />
      )}
    </div>
  );
}

export default Anotacoes;
