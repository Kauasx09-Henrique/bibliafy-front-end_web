import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import './NoteModal.css';

function NoteModal({ isOpen, verse, onClose, onSave, bookName, chapterNum }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
      console.log('Objeto Verse recebido no Modal:', verse);
    }
  }, [isOpen, verse]);

  if (!isOpen || !verse) return null;

  const getVerseId = (v) => {
    return v.id || v.verse_id || v._id || v.verseId;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const verseId = getVerseId(verse);

    if (!verseId) {
      console.error("ERRO: ID do versículo não encontrado no objeto:", verse);
      alert("Erro ao identificar o versículo. Verifique o console.");
      setIsSaving(false);
      return;
    }

    await onSave({
      verse_id: verseId,
      title,
      content
    });

    setIsSaving(false);
    onClose();
  };

  return (
    <div className="note-modal-overlay" onClick={onClose}>
      <div className="note-modal-content" onClick={e => e.stopPropagation()}>
        <header className="note-modal-header">
          <div className="header-title">
            <FileText size={20} className="header-icon" />
            <h3>Criar Anotação</h3>
          </div>
          <button className="note-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </header>

        <div className="verse-preview-card">
          <span className="verse-ref">{bookName} {chapterNum}:{verse.verse}</span>
          <p>"{verse.text}"</p>
        </div>
        
        <form onSubmit={handleSave} className="note-form">
          <div className="form-group">
            <label>Título</label>
            <input 
              type="text" 
              placeholder="Ex: Reflexão sobre fé..." 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label>Sua anotação</label>
            <textarea 
              placeholder="Escreva seus pensamentos aqui..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={6}
            ></textarea>
          </div>

          <div className="note-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-btn" disabled={isSaving}>
              {isSaving ? 'Salvando...' : (
                <>
                  <Save size={18} /> Salvar Anotação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NoteModal;