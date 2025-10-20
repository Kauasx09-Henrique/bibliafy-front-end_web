import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Star,
  StickyNote,
  Type,
  Copy,
  RefreshCw, // Você pode trocar por 'Contrast' se preferir
  BookOpenCheck,
  Contrast, // Ícone para Configurações
  BookOpen,
  Columns,
  X, // Ícone para fechar modal
} from "lucide-react";
import NoteModal from "../components/NoteModal";
import CompareModal from "../components/CompareModal";
import "./Chapter.css";

// ---
// 1. Componente para o Modal de Configurações
// ---
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Configurações de Leitura</h2>
          <button onClick={onClose} className="rt-icon" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* --- Tamanho da Fonte --- */}
        <div className="settings-group">
          <h3>Tamanho da Fonte</h3>
          <div className="settings-control">
            <button
              className="rt-icon"
              title="Diminuir fonte"
              onClick={decFont}
              aria-label="Diminuir fonte"
            >
              <Type size={18} />
              <span className="muted">-</span>
            </button>
            <span className="rt-fontsize-modal">{fontSize}px</span>
            <button
              className="rt-icon"
              title="Aumentar fonte"
              onClick={incFont}
              aria-label="Aumentar fonte"
            >
              <Type size={18} />
              <span className="muted">+</span>
            </button>
          </div>
        </div>

        {/* --- Tipo de Fonte --- */}
        <div className="settings-group">
          <h3>Tipo de Fonte</h3>
          <select
            className="rt-select-modal"
            value={fontFace}
            onChange={(e) => setFontFace(e.target.value)}
            aria-label="Tipo de fonte"
          >
            <option value="font-inter">Moderna (Inter)</option>
            <option value="font-lora">Elegante (Lora)</option>
            <option value="font-garamond">Clássica (Garamond)</option>
          </select>
        </div>

        {/* --- Versão --- */}
        <div className="settings-group">
          <h3>Versão Bíblica</h3>
          <select
            className="rt-select-modal"
            value={selectedVersion}
            onChange={handleVersionChange}
            aria-label="Versão bíblica"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.abbreviation}>
                {v.name} ({v.abbreviation})
              </option>
            ))}
          </select>
        </div>
        
        {/* --- Modo Compacto --- */}
        <div className="settings-group">
          <h3>Modo de Leitura</h3>
          <button
            className={`rt-toggle ${compactMode ? "active" : ""}`}
            onClick={() => setCompactMode((s) => !s)}
            aria-label="Modo compacto"
          >
            <Columns size={18} />
            <span>{compactMode ? "Modo Compacto Ativado" : "Modo Padrão"}</span>
          </button>
        </div>

        {/* --- Navegação --- */}
        <div className="settings-group">
          <h3>Navegação</h3>
           <Link to="/home" className="rt-toggle" title="Home">
            <Home size={18} />
            <span>Ir para Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};


export default function Chapter() {
  const { bookId, chapterNum } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedVersion = searchParams.get("version") || "NVI";

  // Estado principal
  const [verses, setVerses] = useState([]);
  const [bookName, setBookName] = useState("");
  const [totalChapters, setTotalChapters] = useState(0);
  const [versions, setVersions] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Leitura / UI
  const [fontSize, setFontSize] = useState(18);
  const [fontFace, setFontFace] = useState("font-inter");
  const [compactMode, setCompactMode] = useState(false);

  // Modais
  const [noteModalVerse, setNoteModalVerse] = useState(null);
  const [compareVerse, setCompareVerse] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState([]);
  // ---
  // 2. Novo estado para o modal de configurações
  // ---
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const currentChapter = useMemo(() => parseInt(chapterNum, 10), [chapterNum]);
  const prevChapter = currentChapter > 1 ? currentChapter - 1 : null;

  // Carrega dados iniciais
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [versesRes, booksRes, chaptersRes, versionsRes] = await Promise.all([
        api.get(`/api/bible/books/${bookId}/chapters/${chapterNum}?version=${selectedVersion}`),
        api.get("/api/bible/books"),
        api.get(`/api/bible/books/${bookId}/chapters`),
        api.get("/api/bible/versions"),
      ]);

      const bk = (booksRes.data || []).find(b => String(b.id) === String(bookId));
      setBookName(bk ? bk.name : "Livro");

      setVerses(versesRes.data || []);
      setTotalChapters((chaptersRes.data || []).length);
      setVersions(versionsRes.data || []);

      if (isAuthenticated) {
        const favRes = await api.get("/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(new Set((favRes.data || []).map(f => f.verse_id)));
      } else {
        setFavorites(new Set());
      }
    } catch (e) {
      setError("Não foi possível carregar o capítulo.");
    } finally {
      setLoading(false);
    }
  }, [bookId, chapterNum, selectedVersion, isAuthenticated, token]);

  useEffect(() => {
    loadData();
  }, [loadData]); // O useEffect agora depende da função memoizada

  // Troca versão
  const handleVersionChange = (e) => setSearchParams({ version: e.target.value });

  // Navegação capítulos
  const navigateToChapter = (chapter) => {
    if (!chapter || chapter < 1 || chapter > totalChapters) return;
    navigate(`/livro/${bookId}/capitulo/${chapter}?version=${selectedVersion}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handlePrev = () => navigateToChapter(prevChapter);
  const handleNext = () => navigateToChapter(currentChapter + 1);

  // Font size
  const incFont = () => setFontSize(v => Math.min(v + 2, 40));
  const decFont = () => setFontSize(v => Math.max(v - 2, 12));

  // Favoritar
  const toggleFavorite = async (verseId) => {
    if (!isAuthenticated) return;
    try {
      const isFav = favorites.has(verseId);
      // Otimista
      setFavorites(prev => {
        const next = new Set(prev);
        isFav ? next.delete(verseId) : next.add(verseId);
        return next;
      });

      if (isFav) {
        await api.delete(`/api/favorites/${verseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(
          `/api/favorites`,
          { verse_id: verseId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (e) {
      // Reverte em caso de falha
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(verseId)) next.delete(verseId);
        else next.add(verseId);
        return next;
      });
    }
  };

  // Nota
  const handleSaveNote = async (payload) => {
    if (!isAuthenticated) return;
    try {
      await api.post(
        "/api/notes",
        {
          title: payload.title || "",
          content: payload.content || "",
          book_id: Number(bookId),
          chapter: Number(chapterNum),
          verse: Number(payload.verse?.verse || 0),
          version: selectedVersion,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNoteModalVerse(null);
    } catch (e) {
      setNoteModalVerse(null);
    }
  };

  // Copiar texto
  const copyVerse = async (v) => {
    try {
      await navigator.clipboard.writeText(`${bookName} ${chapterNum}:${v.verse} — ${v.text}`);
      // (Opcional) Adicionar um feedback visual (ex: toast)
    } catch {}
  };

  // Comparar versículo entre versões
  const handleCompare = async (v) => {
    setCompareVerse({ ...v, bookName, chapter: chapterNum });
    setCompareData([]);
    setCompareLoading(true);
    try {
      const others = versions.filter(x => x.abbreviation !== selectedVersion);
      const responses = await Promise.all(
        others.map(ver =>
          api.get(`/api/bible/books/${bookId}/chapters/${chapterNum}?version=${ver.abbreviation}`)
        )
      );
      const mapped = responses.map((res, idx) => {
        const found = (res.data || []).find(iv => iv.verse === v.verse);
        return {
          version: others[idx].abbreviation,
          text: found ? found.text : "—",
        };
      });
      setCompareData(mapped);
    } catch {
      setCompareData([{ version: "Erro", text: "Não foi possível comparar agora." }]);
    } finally {
      setCompareLoading(false);
    }
  };

  if (loading)
    return (
      <div className="chapter-wrapper">
        <p className="loading-message">Carregando…</p>
      </div>
    );

  if (error)
    return (
      <div className="chapter-wrapper">
        <p className="error-message">{error}</p>
      </div>
    );

  return (
    // Aplica a classe da fonte e o padding
    <div className={`chapter-wrapper ${compactMode ? "compact" : ""} ${fontFace}`}>
      
      {/* 4. Toolbar fixa SUPERIOR (Limpa) */}
      <div className="reading-toolbar">
        <div className="rt-left">
          <Link to={`/livro/${bookId}?version=${selectedVersion}`} className="rt-btn">
            <ChevronLeft size={18} />
            <span className="rt-book-name">{bookName}</span>
          </Link>
        </div>

        {/* Título Fixo */}
        <div className="rt-middle">
          <div className="chapter-title-top">
            <BookOpen size={16} />
            <h1>Cap. {chapterNum}</h1>
          </div>
        </div>

        {/* Botão de Configurações */}
        <div className="rt-right">
          <button
            className="rt-icon"
            onClick={() => setSettingsModalOpen(true)}
            title="Configurações de leitura"
          >
            <Contrast size={18} />
          </button>
        </div>
      </div>
      
      {/* 5. Cabeçalho do capítulo foi removido daqui */}

      {/* Lista de versículos */}
      <main className="verses" style={{ fontSize: `${fontSize}px` }}>
        {verses.map((v) => {
          const isFav = favorites.has(v.id);
          return (
            <article key={v.id} className="verse">
              <div className="verse-text">
                <span className="n">{v.verse}</span>
                {v.text}
              </div>

              <div className="verse-actions">
                <button
                  className={`va-btn ${isFav ? "active" : ""}`}
                  onClick={() => toggleFavorite(v.id)}
                  title={isFav ? "Remover dos favoritos" : "Favoritar"}
                  aria-label="Favoritar"
                  disabled={!isAuthenticated}
                >
                  <Star size={18} />
                </button>

                <button
                  className="va-btn"
                  onClick={() => setNoteModalVerse({ ...v, bookName, chapter: chapterNum })}
                  title="Adicionar nota"
                  aria-label="Adicionar nota"
                  disabled={!isAuthenticated}
                >
                  <StickyNote size={18} />
                </button>

                <button
                  className="va-btn"
                  onClick={() => copyVerse(v)}
                  title="Copiar"
                  aria-label="Copiar versículo"
                >
                  <Copy size={18} />
                </button>

                <button
                  className="va-btn"
                  onClick={() => handleCompare(v)}
                  title="Comparar versões"
                  aria-label="Comparar versões"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </article>
          );
        })}
      </main>

      {/* 6. Rodapé de navegação FIXO */}
      <footer className="chapter-footer sticky-footer">
        <button
          className="footer-nav"
          onClick={handlePrev}
          disabled={!prevChapter}
          aria-label="Capítulo anterior"
        >
          <ChevronLeft size={18} />
          <span>Anterior</span>
        </button>

        <button className="footer-title" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <BookOpenCheck size={18} />
          <span>Topo</span>
        </button>

        <button
          className="footer-nav"
          onClick={handleNext}
          disabled={currentChapter >= totalChapters}
          aria-label="Próximo capítulo"
        >
          <span>Próximo</span>
          <ChevronRight size={18} />
        </button>
      </footer>

      {/* Modais */}
      <NoteModal
        verse={noteModalVerse}
        onClose={() => setNoteModalVerse(null)}
        onSave={handleSaveNote}
      />

      <CompareModal
        verse={compareVerse}
        comparisonData={compareData}
        isLoading={compareLoading}
        onClose={() => setCompareVerse(null)}
        currentVersion={selectedVersion}
      />

      {/* 7. O novo Modal de Configurações */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        fontSize={fontSize}
        incFont={incFont}
        decFont={decFont}
        fontFace={fontFace}
        setFontFace={setFontFace}
        selectedVersion={selectedVersion}
        handleVersionChange={handleVersionChange}
        versions={versions}
        compactMode={compactMode}
        setCompactMode={setCompactMode}
      />
    </div>
  );
}