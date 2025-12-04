// src/pages/Anotacoes.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import Swal from "sweetalert2";
import NoteModal from "../components/NoteModal";

import {
  Edit3,
  Trash2,
  Search,
  NotebookPen,
  Sparkles,
} from "lucide-react";

import "./Anotacoes.css";

// Debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function Anotacoes() {
  const { token } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Busca Notas
  const fetchNotes = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const response = await api.get("/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes(
        (response.data || []).sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at)
        )
      );
    } catch {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível carregar suas anotações.",
        customClass: { popup: "swal2-popup" },
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Deletar
  const handleDeleteNote = async (id, ref) => {
    const confirmation = await Swal.fire({
      title: "Excluir Anotação?",
      html: `Tem certeza que deseja apagar a anotação do verso <b>${ref}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      customClass: { popup: "swal2-popup" },
    });

    if (confirmation.isConfirmed) {
      try {
        await api.delete(`/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotes((prev) => prev.filter((n) => n.id !== id));

        Swal.fire({
          icon: "success",
          title: "Anotação removida",
          timer: 1200,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Não foi possível excluir.",
        });
      }
    }
  };

  // Atualizar nota
  const handleUpdateNote = async (data) => {
    if (!editingNote) return;

    try {
      await api.put(
        `/api/notes/${editingNote.id}`,
        { title: data.title, content: data.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingNote(null);
      fetchNotes();

      Swal.fire({
        icon: "success",
        title: "Atualizada com sucesso!",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Erro ao atualizar",
      });
    }
  };

  // Filtro otimizado
  const filteredNotes = useMemo(() => {
    if (!debouncedSearchTerm) return notes;

    const s = debouncedSearchTerm.toLowerCase();

    return notes.filter((n) =>
      [
        n.title,
        n.content,
        n.verse_text,
        `${n.book_name} ${n.chapter}:${n.verse}`,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(s))
    );
  }, [notes, debouncedSearchTerm]);

  return (
    <div className="notes-page">
      {/* HEADER */}
      <div className="notes-header">
        <NotebookPen size={34} className="header-icon" />
        <h1>Minhas Anotações</h1>
      </div>

      {/* BUSCA */}
      <div className="notes-search-box">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por título, conteúdo ou versículo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="loading-state">
          <Sparkles size={26} className="loading-icon" />
          Carregando suas anotações...
        </div>
      ) : (
        <div className="notes-list">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((n) => (
              <div className="note-card glass-card" key={n.id}>
                <div className="note-card-header">
                  <h3>{n.title || "Sem Título"}</h3>

                  <div className="note-actions">
                    <button
                      className="btn-edit"
                      onClick={() => setEditingNote(n)}
                    >
                      <Edit3 size={18} />
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() =>
                        handleDeleteNote(
                          n.id,
                          `${n.book_name} ${n.chapter}:${n.verse}`
                        )
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {n.content && (
                  <p className="note-text">{n.content}</p>
                )}

                {n.verse_text && (
                  <div className="note-verse">
                    <span className="v-text">"{n.verse_text}"</span>
                    <span className="v-ref">
                      {n.book_name} {n.chapter}:{n.verse}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Sparkles size={20} />
              {searchTerm
                ? "Nenhuma anotação corresponde à sua busca."
                : "Você ainda não criou nenhuma anotação."}
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {editingNote && (
        <NoteModal
          verse={{
            id: editingNote.verse_id,
            text: editingNote.verse_text,
            verse: editingNote.verse,
            chapter: editingNote.chapter,
            bookName: editingNote.book_name,
          }}
          initialData={{
            title: editingNote.title,
            content: editingNote.content,
          }}
          onClose={() => setEditingNote(null)}
          onSave={handleUpdateNote}
          isEditing={true}
        />
      )}
    </div>
  );
}

export default Anotacoes;
