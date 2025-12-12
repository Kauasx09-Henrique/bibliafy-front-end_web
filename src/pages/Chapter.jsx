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
  Settings,
  X
} from "lucide-react";
import NoteModal from "../components/NoteModal";
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>Aparência</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className="modal-section">
          <h3>Versão da Bíblia</h3>
          <select
            className="select-glass"
            value={selectedVersion}
            onChange={handleVersionChange}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.abbreviation}>
                {v.abbreviation.toUpperCase()} - {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-section">
          <h3>Tema</h3>
          <div className="theme-options">
            <button
              className={`theme-btn ${readingTheme === "theme-dark" ? "active" : ""}`}
              onClick={() => setReadingTheme("theme-dark")}
            >
              Escuro
            </button>
            <button
              className={`theme-btn ${readingTheme === "theme-sepia" ? "active" : ""}`}
              onClick={() => setReadingTheme("theme-sepia")}
            >
              Sépia
            </button>
            <button
              className={`theme-btn ${readingTheme === "theme-light" ? "active" : ""}`}
              onClick={() => setReadingTheme("theme-light")}
            >
              Claro
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
          <h3>Tipo de Fonte</h3>
          <div className="font-family-options">
            <button
              className={`font-fam-btn font-inter ${fontFace === "font-inter" ? "active" : ""}`}
              onClick={() => setFontFace("font-inter")}
            >
              Sans
            </button>
            <button
              className={`font-fam-btn font-lora ${fontFace === "font-lora" ? "active" : ""}`}
              onClick={() => setFontFace("font-lora")}
            >
              Serif
            </button>
            <button
              className={`font-fam-btn font-garamond ${fontFace === "font-garamond" ? "active" : ""}`}
              onClick={() => setFontFace("font-garamond")}
            >
              Classic
            </button>
          </div>
        </div>

        <div className="modal-section">
          <button
            className={`toggle-mode-btn ${compactMode ? "active" : ""}`}
            onClick={() => setCompactMode((s) => !s)}
          >
            {compactMode ? "Modo Compacto: ATIVADO" : "Modo Compacto: DESATIVADO"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReadingToolbar = ({
  bookId,
  bookName,
  chapterNum,
  onOpenSettings,
}) => (
  <div className="toolbar-glass">
    <Link to={`/livro/${bookId}`} className="back-btn-glass">
      <ChevronLeft size={20} />
      <span>{bookName}</span>
    </Link>

    <div className="chapter-label">Cap. {chapterNum}</div>

    <button className="settings-btn-glass" onClick={onOpenSettings}>
      <Settings size={22} className="icon-settings-animated" />
    </button>
  </div>
);

const VerseItem = ({ verse, isFav, onToggleFavorite, onNoteClick }) => {
  const [copied, setCopied] = useState(false);

  return (
    <article className="verse-card">
      <div className="verse-header">
        <span className="verse-index">{verse.verse}</span>
      </div>
      <p className="verse-text">{verse.text}</p>

      <div className="verse-actions">
        <button
          className={`va va-star ${isFav ? "active" : ""}`}
          onClick={() => onToggleFavorite(verse.id)}
        >
          <Star size={18} />
        </button>

        <button className="va va-note" onClick={() => onNoteClick(verse)}>
          <StickyNote size={18} />
        </button>

        <button
          className="va va-copy"
          onClick={() => {
            navigator.clipboard.writeText(`${verse.text} (${verse.book_name} ${verse.chapter}:${verse.verse})`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <Check size={18} color="#4ade80" /> : <Copy size={18} />}
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

    <button className="f-btn center-btn" onClick={onTop}>
      Topo
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

  const selectedVersion = searchParams.get("version") || "acf";

  const [verses, setVerses] = useState([]);
  const [bookName, setBookName] = useState("");
  const [totalChapters, setTotalChapters] = useState(0);
  const [versions, setVersions] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);

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
    document.body.className = "";
    document.body.classList.add(readingTheme);
  }, [readingTheme]);

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ fontSize, fontFace, compactMode, readingTheme })
    );
  }, [fontSize, fontFace, compactMode, readingTheme]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [versesRes, booksRes, chaptersRes, versionsRes] = await Promise.all([
          api.get(`/api/bible/books/${bookId}/chapters/${chapterNum}?version=${selectedVersion}`),
          api.get("/api/bible/books"),
          api.get(`/api/bible/books/${bookId}/chapters`),
          api.get("/api/bible/versions"),
        ]);

        setVerses(versesRes.data || []);
        setVersions(versionsRes.data || []);
        const book = booksRes.data.find((b) => String(b.id) === String(bookId) || b.abbrev === bookId);
        setBookName(book?.name || "Bíblia");
        setTotalChapters((chaptersRes.data || []).length);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [bookId, chapterNum, selectedVersion]);

  const navigateToChapter = (n) => {
    navigate(`/livro/${bookId}/capitulo/${n}?version=${selectedVersion}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  if (loading) return <div className="loading-screen">Carregando Capítulo...</div>;

  return (
    <div className={`chapter-wrapper ${readingTheme} ${fontFace} ${compactMode ? "compact" : ""}`}>
      <ReadingToolbar
        bookId={bookId}
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
            onNoteClick={(verse) => {
              setSelectedVerseForNote(verse);
              setIsNoteModalOpen(true);
            }}
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
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        verse={selectedVerseForNote}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={() => { }}
      />
    </div>
  );
}