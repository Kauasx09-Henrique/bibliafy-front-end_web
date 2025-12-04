import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  StickyNote,
  Copy,
  Check,
  RotateCw,
  Settings,
} from "lucide-react";
import NoteModal from "../components/NoteModal"; // Importe o componente aqui
import "./Chapter.css";

const SETTINGS_KEY = "bibliafyReadingSettings";

const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { }
  return {
    fontSize: 18,
    fontFace: "font-inter",
    compactMode: false,
    readingTheme: "theme-dark",
  };
};

const SettingsModal = ({
  isOpen,
  onClose,
  fontSize,
  incFont,
  decFont,
  fontFace,
  setFontFace,
  selectedVersion,
  handleVersionChange,
  versions,
  compactMode,
  setCompactMode,
  readingTheme,
  setReadingTheme,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${theme}`} onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Configurações</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </header>

        <div className="modal-body">
          <div className="modal-section">
            <h3>Tema</h3>
            <div className="theme-options">
              <button
                className={`theme-btn ${readingTheme === "theme-dark" ? "active" : ""}`}
                onClick={() => setReadingTheme("theme-dark")}
              >
                🌙 Escuro
              </button>
              <button
                className={`theme-btn ${readingTheme === "theme-sepia" ? "active" : ""}`}
                onClick={() => setReadingTheme("theme-sepia")}
              >
                📜 Sépia
              </button>
              <button
                className={`theme-btn ${readingTheme === "theme-light" ? "active" : ""}`}
                onClick={() => setReadingTheme("theme-light")}
              >
                ☀️ Claro
              </button>
            </div>
          </div>

          <div className="modal-section">
            <h3>Tamanho da Fonte</h3>
            <div className="font-controls">
              <button className="font-btn" onClick={decFont}>A-</button>
              <span className="font-size-display">{fontSize}px</span>
              <button className="font-btn" onClick={incFont}>A+</button>
            </div>
          </div>

          <div className="modal-section">
            <h3>Fonte</h3>
            <select className="select-glass" value={fontFace} onChange={(e) => setFontFace(e.target.value)}>
              <option value="font-inter">Inter</option>
              <option value="font-lora">Lora</option>
              <option value="font-garamond">Garamond</option>
            </select>
          </div>

          <div className="modal-section">
            <h3>Versão</h3>
            <select className="select-glass" value={selectedVersion} onChange={handleVersionChange}>
              {versions.map((v) => (
                <option key={v.id} value={v.abbreviation}>
                  {v.name} ({v.abbreviation})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-section">
            <h3>Modo de Leitura</h3>
            <button className="toggle-mode-btn" onClick={() => setCompactMode((s) => !s)}>
              {compactMode ? "Modo Compacto" : "Modo Padrão"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReadingToolbar = ({
  bookId,
  selectedVersion,
  bookName,
  chapterNum,
  onOpenSettings,
}) => (
  <div className="toolbar-glass">
    <Link to={`/livro/${bookId}?version=${selectedVersion}`} className="back-btn-glass">
      <ChevronLeft size={20} />
      {bookName}
    </Link>

    <div className="chapter-label">Capítulo {chapterNum}</div>

    <button className="settings-btn-glass" onClick={onOpenSettings}>
      <Settings size={22} className="icon-settings-animated" />
    </button>
  </div>
);

const VerseItem = ({ verse, isFav, onToggleFavorite, onNoteClick }) => {
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${verse.text} (Cap. ${verse.chapter}:${verse.verse})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setRotating(true);
    setTimeout(() => setRotating(false), 1000);
  };

  return (
    <article className="verse-card">
      <div className="verse-index">{verse.verse}</div>
      <p className="verse-text">{verse.text}</p>

      <div className="verse-actions">
        <button
          className={`va va-star ${isFav ? "active" : ""}`}
          onClick={() => onToggleFavorite(verse.id)}
          title="Favoritar"
        >
          <Star size={20} />
        </button>

        <button
          className="va va-note"
          onClick={() => onNoteClick(verse)}
          title="Criar Nota"
        >
          <StickyNote size={20} />
        </button>

        <button className="va va-copy" onClick={handleCopy} title="Copiar">
          {copied ? <Check size={20} color="#4ade80" /> : <Copy size={20} />}
        </button>

        <button
          className={`va va-rotate ${rotating ? "spinning" : ""}`}
          onClick={handleRefresh}
          title="Atualizar"
        >
          <RotateCw size={20} />
        </button>
      </div>
    </article>
  );
};

const ReadingFooter = ({ onPrev, onNext, onTop, hasPrev, hasNext }) => (
  <footer className="footer-glass">
    <button className="f-btn" disabled={!hasPrev} onClick={onPrev}>
      <ChevronLeft size={18} /> Anterior
    </button>

    <button className="f-btn" onClick={onTop}>
      <ChevronRight size={18} style={{ transform: 'rotate(-90deg)' }} /> Topo
    </button>

    <button className="f-btn" disabled={!hasNext} onClick={onNext}>
      Próximo <ChevronRight size={18} />
    </button>
  </footer>
);

export default function Chapter() {
  const { bookId, chapterNum } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedVersion = searchParams.get("version") || "NVI";

  const [verses, setVerses] = useState([]);
  const [bookName, setBookName] = useState("");
  const [totalChapters, setTotalChapters] = useState(0);
  const [versions, setVersions] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Estados para o NoteModal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedVerseForNote, setSelectedVerseForNote] = useState(null);

  const initialSettings = useMemo(() => loadSettings(), []);
  const [fontSize, setFontSize] = useState(initialSettings.fontSize);
  const [fontFace, setFontFace] = useState(initialSettings.fontFace);
  const [compactMode, setCompactMode] = useState(initialSettings.compactMode);
  const [readingTheme, setReadingTheme] = useState(initialSettings.readingTheme);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const currentChapter = parseInt(chapterNum, 10);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      fontSize,
      fontFace,
      compactMode,
      readingTheme
    }));
  }, [fontSize, fontFace, compactMode, readingTheme]);

  useEffect(() => {
    const load = async () => {
      try {
        const [versesRes, booksRes, chaptersRes, versionsRes] = await Promise.all([
          api.get(`/api/bible/books/${bookId}/chapters/${chapterNum}?version=${selectedVersion}`),
          api.get("/api/bible/books"),
          api.get(`/api/bible/books/${bookId}/chapters`),
          api.get("/api/bible/versions"),
        ]);

        setVerses(versesRes.data || []);
        setVersions(versionsRes.data || []);

        const b = booksRes.data.find((x) => x.id == bookId);
        setBookName(b?.name || "Livro");

        setTotalChapters((chaptersRes.data || []).length);
      } catch { }

      setLoading(false);
    };

    load();
  }, [bookId, chapterNum, selectedVersion]);

  const navigateToChapter = (n) => {
    if (!n) return;
    navigate(`/livro/${bookId}/capitulo/${n}?version=${selectedVersion}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const openNoteModal = (verse) => {
    setSelectedVerseForNote(verse);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      console.log("Salvando nota:", noteData);
      // Aqui você fará a chamada real para a API:
      // await api.post('/api/notes', noteData);

      // Simulação de delay
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Erro ao salvar nota", error);
    }
  };

  if (loading) return <div className="loading">Carregando…</div>;

  return (
    <div className={`chapter-wrapper ${readingTheme} ${fontFace} ${compactMode ? 'compact' : ''}`}>
      <ReadingToolbar
        bookId={bookId}
        selectedVersion={selectedVersion}
        bookName={bookName}
        chapterNum={currentChapter}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      <main className="verse-list" style={{ fontSize: `${fontSize}px` }}>
        {verses.map((v) => (
          <VerseItem
            key={v.id}
            verse={v}
            isFav={favorites.has(v.id)}
            onToggleFavorite={toggleFavorite}
            onNoteClick={openNoteModal}
          />
        ))}
      </main>

      <ReadingFooter
        hasPrev={currentChapter > 1}
        hasNext={currentChapter < totalChapters}
        onPrev={() => navigateToChapter(currentChapter - 1)}
        onNext={() => navigateToChapter(currentChapter + 1)}
        onTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        fontSize={fontSize}
        incFont={() => setFontSize((v) => v + 2)}
        decFont={() => setFontSize((v) => Math.max(12, v - 2))}
        fontFace={fontFace}
        setFontFace={setFontFace}
        selectedVersion={selectedVersion}
        handleVersionChange={(e) => setSearchParams({ version: e.target.value })}
        versions={versions}
        compactMode={compactMode}
        setCompactMode={setCompactMode}
        readingTheme={readingTheme}
        setReadingTheme={setReadingTheme}
        theme={readingTheme}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        verse={selectedVerseForNote}
        bookName={bookName}
        chapterNum={currentChapter}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
      />
    </div>
  );
}