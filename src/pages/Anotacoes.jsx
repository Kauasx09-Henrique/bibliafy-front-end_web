
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import NoteModal from '../components/NoteModal';
import './Anotacoes.css';
import { Edit, Trash2, Search } from 'lucide-react';

// ✅ 1. Hook customizado simples para Debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Atualiza o valor debounced após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancela o timeout se o valor mudar (ou no unmount)
    // Isso garante que só rodamos se o usuário parou de digitar
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Roda só se value ou delay mudarem

  return debouncedValue;
}


function Anotacoes() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ 2. Usa o hook de debounce no termo de busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay

  const fetchNotes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.get('/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ordena as notas mais recentes primeiro (opcional)
      setNotes((response.data || []).sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)));
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
      customClass: { popup: 'swal2-popup' } // Garante o estilo do popup
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/notes/${noteId}`, { headers: { Authorization: `Bearer ${token}` } });
        setNotes(prev => prev.filter(n => n.id !== noteId)); // Atualiza o estado local
        Swal.fire({ icon: 'success', title: 'Anotação removida!', showConfirmButton: false, timer: 1500, customClass: { popup: 'swal2-popup' } });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível remover a anotação.', customClass: { popup: 'swal2-popup' } });
      }
    }
  };

  const handleUpdateNote = async (noteData) => {
    if (!editingNote) return; // Segurança extra
    try {
      const { title, content } = noteData;
      // Faz a requisição PUT
      await api.put(`/api/notes/${editingNote.id}`, { title, content }, { headers: { Authorization: `Bearer ${token}` } });
      
      // Fecha o modal
      setEditingNote(null);
      // Rebusca as notas para garantir consistência (ou atualiza localmente)
      fetchNotes(); 
      Swal.fire({ icon: 'success', title: 'Anotação atualizada!', showConfirmButton: false, timer: 1500, customClass: { popup: 'swal2-popup' } });
    } catch (err) {
      console.error("Erro ao atualizar anotação:", err);
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível atualizar a anotação.', customClass: { popup: 'swal2-popup' } });
    }
  };

  // ✅ 3. Filtro agora usa o valor debounced e useMemo para otimização
  const filteredNotes = useMemo(() => {
    if (!debouncedSearchTerm) {
      return notes; // Retorna todas as notas se a busca estiver vazia
    }
    const lowerCaseSearch = debouncedSearchTerm.toLowerCase();
    return notes.filter(note =>
      (note.title && note.title.toLowerCase().includes(lowerCaseSearch)) ||
      (note.content && note.content.toLowerCase().includes(lowerCaseSearch)) ||
      (note.verse_text && note.verse_text.toLowerCase().includes(lowerCaseSearch)) ||
      // Opcional: buscar pela referência também
      (note.book_name && `${note.book_name} ${note.chapter}:${note.verse}`.toLowerCase().includes(lowerCaseSearch)) 
    );
  }, [notes, debouncedSearchTerm]); // Recalcula só se notes ou o termo debounced mudarem


  return (
    <div className="anotacoes-container">
      <h1>Minhas Anotações</h1>

      {/* Barra de Pesquisa */}
      <div className="search-bar-container">
        <Search size={20} className="search-icon" /> {/* Adiciona classe para estilizar ícone */}
        <input
          type="search" // Usar type="search" permite o 'x' para limpar em alguns navegadores
          className="search-input" // Adiciona classe para estilizar input
          placeholder="Pesquisar por título, conteúdo ou versículo..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ✅ 4. Usa DIV para o spinner */}
      {loading ? (
        <div className="loading-message">Carregando anotações...</div> 
      ) : (
        <div className="notes-list">
          {filteredNotes.length > 0 ? filteredNotes.map(note => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <h3 className="note-title">{note.title || "Sem Título"}</h3> {/* Fallback para título */}
                <div className="note-actions">
                  <button 
                    onClick={() => setEditingNote(note)} 
                    title="Editar"
                    aria-label={`Editar anotação: ${note.title || 'Sem Título'}`} // ✅ Acessibilidade
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteNote(note.id, `${note.book_name} ${note.chapter}:${note.verse}`)} 
                    title="Excluir"
                    aria-label={`Excluir anotação: ${note.title || 'Sem Título'}`} // ✅ Acessibilidade
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {/* Mostra o conteúdo apenas se existir */}
              {note.content && <p className="note-content">{note.content}</p>} 
              
              {/* Mostra a citação do versículo apenas se existir */}
              {note.verse_text && (
                <div className="verse-quote">
                  <span className="verse-quote-text">"{note.verse_text}"</span>
                  <span className="verse-quote-ref">{`${note.book_name} ${note.chapter}:${note.verse}`}</span>
                </div>
              )}
            </div>
          )) : (
            <p className="empty-state">
              {searchTerm ? "Nenhuma anotação encontrada para sua busca." : "Você ainda não criou nenhuma anotação."}
            </p> // Mensagem diferente se a busca não encontrar nada
          )}
        </div>
      )}

      {/* Modal de Edição (continua igual) */}
      {editingNote && (
        <NoteModal
          // Passa os dados esperados pelo NoteModal
           verse={{ // Recria o objeto 'verse' esperado pelo NoteModal
            id: editingNote.verse_id, // Assumindo que o modal precisa do ID do verso
            text: editingNote.verse_text,
            verse: editingNote.verse, // Renomeia 'number' para 'verse' se necessário
            chapter: editingNote.chapter,
            bookName: editingNote.book_name
          }}
          initialData={{ title: editingNote.title, content: editingNote.content }}
          onClose={() => setEditingNote(null)}
          onSave={handleUpdateNote} // Usa a função de update
          isEditing={true} // Opcional: Passa um flag indicando que é edição
        />
      )}
    </div>
  );
}

export default Anotacoes;