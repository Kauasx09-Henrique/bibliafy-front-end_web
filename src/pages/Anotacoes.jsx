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
  BookOpen
} from "lucide-react";

import "./Anotacoes.css";

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
      // Erro silencioso ou toast
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDeleteNote = async (id, ref) => {
    const result = await Swal.fire({
      title: "Excluir anotação?",
      html: `
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
          <p style="opacity: 0.8; font-size: 0.95rem; margin: 0;">Você está prestes a apagar sua nota em:</p>
          <strong style="color: #ff5b61; font-size: 1.1rem;">${ref}</strong>
          <p style="opacity: 0.6; font-size: 0.8rem; margin-top: 4px;">Essa ação não pode ser desfeita.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
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
      try {
        await api.delete(`/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotes((prev) => prev.filter((n) => n.id !== id));

        Swal.fire({
          icon: "success",
          title: "Excluído!",
          timer: 1500,
          showConfirmButton: false,
          background: "rgba(15, 15, 15, 0.95)",
          color: "#fff",
          customClass: { popup: "glass-popup" }
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "Erro ao excluir",
          background: "#151515",
          color: "#fff"
        });
      }
    }
  };

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
        title: "Nota atualizada!",
        timer: 1500,
        showConfirmButton: false,
        background: "rgba(15, 15, 15, 0.95)",
        color: "#fff",
        customClass: { popup: "glass-popup" }
      });
    } catch {
      // erro
    }
  };

  const filteredNotes = useMemo(() => {
    if (!debouncedSearchTerm) return notes;
    const s = debouncedSearchTerm.toLowerCase();
    return notes.filter((n) =>
      [n.title, n.content, n.verse_text, `${n.book_name} ${n.chapter}:${n.verse}`]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(s))
    );
  }, [notes, debouncedSearchTerm]);

  return (
    <div className="notes-page">
      <div className="notes-header-container">
        <div className="notes-header">
          <div className="header-icon-box">
            <NotebookPen size={28} color="#fff" />
          </div>
          <div className="header-text">
            <h1>Anotações</h1>
            <p>{notes.length} notas salvas</p>
          </div>
        </div>
      </div>

      <div className="notes-search-box">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Pesquisar em suas notas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <Sparkles size={24} className="loading-spinner" />
          <span>Sincronizando...</span>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((n) => (
              <div className="note-card glass-card fade-in" key={n.id}>
                <div className="note-card-top">
                  <div className="note-info">
                    <h3>{n.title || "Sem Título"}</h3>
                    <span className="note-date">
                      {new Date(n.updated_at || n.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="note-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => setEditingNote(n)}
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteNote(n.id, `${n.book_name} ${n.chapter}:${n.verse}`)}
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {n.verse_text && (
                  <div className="note-verse-badge">
                    <BookOpen size={14} />
                    <span>{n.book_name} {n.chapter}:{n.verse}</span>
                  </div>
                )}

                {n.content && (
                  <p className="note-preview">
                    {n.content.length > 120 ? n.content.substring(0, 120) + "..." : n.content}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <NotebookPen size={48} style={{ opacity: 0.2 }} />
              <p>
                {searchTerm
                  ? "Nenhuma nota encontrada para essa busca."
                  : "Suas anotações aparecerão aqui."}
              </p>
            </div>
          )}
        </div>
      )}

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