import React, { useState, useEffect, useMemo } from "react";
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
  RefreshCw,
  BookOpenCheck,
  Contrast,
  BookOpen,
  Columns
} from "lucide-react";
import NoteModal from "../components/NoteModal";
import CompareModal from "../components/CompareModal";
import "./Chapter.css";

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
  const [fontFace, setFontFace] = useState("font-inter"); // font-inter | font-lora | font-garamond
  const [compactMode, setCompactMode] = useState(false);

  // Modais
  const [noteModalVerse, setNoteModalVerse] = useState(null);
  const [compareVerse, setCompareVerse] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState([]);

  const currentChapter = useMemo(() => parseInt(chapterNum, 10), [chapterNum]);
  const prevChapter = currentChapter > 1 ? currentChapter - 1 : null;

  // Carrega dados iniciais
  useEffect(() => {
    async function loadData() {
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
    }
    loadData();
  }, [bookId, chapterNum, selectedVersion, isAuthenticated, token]);

  // Troca versão
  const handleVersionChange = (e) => setSearchParams({ version: e.target.value });

  // Navegação capítulos
  const handlePrev = () => {
    if (!prevChapter) return;
    navigate(`/livro/${bookId}/capitulo/${prevChapter}?version=${selectedVersion}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleNext = () => {
    if (currentChapter < totalChapters) {
      navigate(`/livro/${bookId}/capitulo/${currentChapter + 1}?version=${selectedVersion}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
      // Silencioso para não interromper leitura
      setNoteModalVerse(null);
    }
  };

  // Copiar texto
  const copyVerse = async (v) => {
    try {
      await navigator.clipboard.writeText(`${bookName} ${chapterNum}:${v.verse} — ${v.text}`);
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
        <p className="error-message-home">{error}</p>
      </div>
    );

  return (
    <div className={`chapter-wrapper ${compactMode ? "compact" : ""}`}>
      {/* Toolbar fixa */}
      <div className="reading-toolbar">
        <div className="rt-left">
          <Link to={`/livro/${bookId}?version=${selectedVersion}`} className="rt-btn">
            <ChevronLeft size={18} />
            <span>{bookName}</span>
          </Link>
        </div>

        <div className="rt-middle">
          <button
            className="rt-icon"
            title="Diminuir fonte"
            onClick={decFont}
            aria-label="Diminuir fonte"
          >
            <Type size={18} />
            <span className="muted">-</span>
          </button>
          <span className="rt-fontsize">{fontSize}px</span>
          <button
            className="rt-icon"
            title="Aumentar fonte"
            onClick={incFont}
            aria-label="Aumentar fonte"
          >
            <Type size={18} />
            <span className="muted">+</span>
          </button>

          <select
            className="rt-select"
            value={fontFace}
            onChange={(e) => setFontFace(e.target.value)}
            aria-label="Tipo de fonte"
          >
            <option value="font-inter">Moderna</option>
            <option value="font-lora">Elegante</option>
            <option value="font-garamond">Clássica</option>
          </select>

          <select
            className="rt-select"
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

          <button
            className={`rt-icon ${compactMode ? "active" : ""}`}
            onClick={() => setCompactMode((s) => !s)}
            title="Modo compacto"
            aria-label="Modo compacto"
          >
            <Columns size={18} />
          </button>
        </div>

        <div className="rt-right">
          <Link to="/home" className="rt-btn" title="Home">
            <Home size={18} />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Cabeçalho do capítulo */}
      <header className="chapter-header">
        <button
          className={`nav-arrow ${!prevChapter ? "disabled" : ""}`}
          onClick={handlePrev}
          disabled={!prevChapter}
          aria-label="Capítulo anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="chapter-title">
          <BookOpen size={18} />
          <h1>
            {bookName} <span>•</span> Cap. {chapterNum}
          </h1>
        </div>

        <button
          className={`nav-arrow ${currentChapter >= totalChapters ? "disabled" : ""}`}
          onClick={handleNext}
          disabled={currentChapter >= totalChapters}
          aria-label="Próximo capítulo"
        >
          <ChevronRight size={18} />
        </button>
      </header>

      {/* Lista de versículos */}
      <main className={`verses ${fontFace}`} style={{ fontSize: `${fontSize}px` }}>
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
                  <Contrast size={18} />
                </button>
              </div>
            </article>
          );
        })}
      </main>

      {/* Rodapé de navegação */}
      <footer className="chapter-footer">
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
    </div>
  );
}
