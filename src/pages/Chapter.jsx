import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  Columns,
  X,
  Sun,
  Moon,
  Book,
} from "lucide-react";
import NoteModal from "../components/NoteModal";
import CompareModal from "../components/CompareModal";
import "./Chapter.css";

// --- Constantes para LocalStorage ---
const SETTINGS_KEY = "bibliafyReadingSettings";

// --- Componente Modal (Sem alterações) ---
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
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Configurações de Leitura</h2>
          <button onClick={onClose} className="rt-icon" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="settings-group">
          <h3>Cor de Fundo</h3>
          <div className="settings-control">
            <button
              className={`rt-theme-btn ${readingTheme === "theme-dark" ? "active" : ""}`}
              onClick={() => setReadingTheme("theme-dark")}
              aria-label="Tema Escuro"
            >
              <Moon size={16} />
              <span>Escuro</span>
            </button>
            <button
              className={`rt-theme-btn ${readingTheme === "theme-sepia" ? "active" : ""}`}
              onClick={() => setReadingTheme("theme-sepia")}
              aria-label="Tema Sépia"
            >
              <Book size={16} />
              <span>Sépia</span>
            </button>
            <button
              className={`rt-theme-btn ${readingTheme === "theme-light" ? "active" : ""}`}
              onClick={() => setReadingTheme("theme-light")}
              aria-label="Tema Claro"
            >
              <Sun size={16} />
              <span>Claro</span>
            </button>
          </div>
        </div>

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

// --- Função para carregar configurações ---
const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Erro ao carregar configurações:", err);
  }
  // Retorna os padrões se não houver nada salvo
  return {
    fontSize: 18,
    fontFace: "font-inter",
    compactMode: false,
    readingTheme: "theme-dark",
  };
};


export default function Chapter() {
  const { bookId, chapterNum } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedVersion = searchParams.get("version") || "NVI";

  const [verses, setVerses] = useState([]);
  const [bookName, setBookName] = useState("");
  const [totalChapters, setTotalChapters] = useState(0);
  const [versions, setVersions] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- MELHORIA: Carrega estados a partir do loadSettings ---
  const [settings, setSettings] = useState(loadSettings);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [fontFace, setFontFace] = useState(settings.fontFace);
  const [compactMode, setCompactMode] = useState(settings.compactMode);
  const [readingTheme, setReadingTheme] = useState(settings.readingTheme);

  // --- MELHORIA: Estados para UI Imersiva ---
  const [isUiVisible, setIsUiVisible] = useState(true);
  const lastScrollY = useRef(0);
  // --- MELHORIA: Refs para Swipe ---
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false); // Para evitar conflito com scroll vertical

  const [noteModalVerse, setNoteModalVerse] = useState(null);
  const [compareVerse, setCompareVerse] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState([]);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const currentChapter = useMemo(() => parseInt(chapterNum, 10), [chapterNum]);
  const prevChapter = currentChapter > 1 ? currentChapter - 1 : null;
  const nextChapter = currentChapter < totalChapters ? currentChapter + 1 : null;

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
      const currentBookName = bk ? bk.name : "Livro";
      setBookName(currentBookName);

      const lastReadData = {
        bookId: bookId,
        bookName: currentBookName,
        chapter: chapterNum,
        version: selectedVersion,
      };

      try {
        localStorage.setItem("bibliafyLastRead", JSON.stringify(lastReadData));
      } catch (err) {
        console.error("Erro ao salvar 'Continuar Lendo':", err);
      }

      setVerses(versesRes.data || []);
      // Atualiza totalChapters assim que os dados chegarem
      const chapterCount = (chaptersRes.data || []).length;
      setTotalChapters(chapterCount);
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
  }, [loadData]);

  // --- MELHORIA: Salva as configurações no localStorage ---
  useEffect(() => {
    try {
      const settingsToSave = {
        fontSize,
        fontFace,
        compactMode,
        readingTheme,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
    }
  }, [fontSize, fontFace, compactMode, readingTheme]);

  // --- MELHORIA: Lógica para Leitura Imersiva (Scroll) ---
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    // Não faz nada se o modal estiver aberto
    if (settingsModalOpen || noteModalVerse || compareVerse) return; 

    // Se rolar para baixo, esconde a UI
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsUiVisible(false);
    } 
    // Se rolar para cima, mostra a UI
    else if (currentScrollY < lastScrollY.current) {
      setIsUiVisible(true);
    }
    lastScrollY.current = currentScrollY;
  }, [settingsModalOpen, noteModalVerse, compareVerse]); // Depende dos modais

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // --- MELHORIA: Tocar no ecrã para mostrar/esconder UI ---
  const toggleUiVisibility = () => {
    // Não faz nada se algum modal estiver aberto
    if (settingsModalOpen || noteModalVerse || compareVerse) return; 
    setIsUiVisible(!isUiVisible);
  };

  const handleVersionChange = (e) => setSearchParams({ version: e.target.value });

  const navigateToChapter = useCallback((chapter) => {
    if (!chapter || chapter < 1 || chapter > totalChapters) return;
    navigate(`/livro/${bookId}/capitulo/${chapter}?version=${selectedVersion}`);
    window.scrollTo({ top: 0, behavior: "auto" }); // 'auto' é melhor para swipe
  }, [bookId, navigate, selectedVersion, totalChapters]);

  // Atualiza prev/next com base no totalChapters real
  const actualPrevChapter = useMemo(() => (currentChapter > 1 ? currentChapter - 1 : null), [currentChapter]);
  const actualNextChapter = useMemo(() => (currentChapter < totalChapters ? currentChapter + 1 : null), [currentChapter, totalChapters]);

  const handlePrev = useCallback(() => navigateToChapter(actualPrevChapter), [navigateToChapter, actualPrevChapter]);
  const handleNext = useCallback(() => navigateToChapter(actualNextChapter), [navigateToChapter, actualNextChapter]);


  // --- MELHORIA: Lógica para Swipe ---
  const swipeThreshold = 50; // Mínimo de pixels para considerar swipe

  const handleTouchStart = (e) => {
    // Não inicia swipe se algum modal estiver aberto
    if (settingsModalOpen || noteModalVerse || compareVerse) return;
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX; // Reseta no início
    isSwiping.current = true; // Marca que pode ser um swipe
  };

  const handleTouchMove = (e) => {
    if (!isSwiping.current) return; // Só atualiza se começou a arrastar
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return; // Não faz nada se não foi swipe

    const swipeDistance = touchStartX.current - touchEndX.current;

    // Swipe para Esquerda (-> Próximo)
    if (swipeDistance > swipeThreshold && actualNextChapter) {
      handleNext();
    } 
    // Swipe para Direita (<- Anterior)
    else if (swipeDistance < -swipeThreshold && actualPrevChapter) {
      handlePrev();
    }
    // Se não foi um swipe válido (distância pequena), considera como toque
    else if (Math.abs(swipeDistance) < 10) { 
        toggleUiVisibility();
    }


    // Reseta o estado do swipe
    touchStartX.current = 0;
    touchEndX.current = 0;
    isSwiping.current = false;
  };


  const incFont = () => setFontSize(v => Math.min(v + 2, 40));
  const decFont = () => setFontSize(v => Math.max(v - 2, 12));

  const toggleFavorite = async (verseId) => {
    if (!isAuthenticated) return;
    try {
      const isFav = favorites.has(verseId);
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
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(verseId)) next.delete(verseId);
        else next.add(verseId);
        return next;
      });
    }
  };

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

  const copyVerse = async (v) => {
    try {
      await navigator.clipboard.writeText(`${bookName} ${chapterNum}:${v.verse} — ${v.text}`);
    } catch {}
  };

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
    <div className={`chapter-wrapper ${compactMode ? "compact" : ""} ${fontFace} ${readingTheme}`}>
      
      <div className={`reading-toolbar ${!isUiVisible ? "hidden" : ""}`}>
        <div className="rt-left">
          <Link to={`/livro/${bookId}?version=${selectedVersion}`} className="rt-btn">
            <ChevronLeft size={18} />
            <span className="rt-book-name">{bookName}</span>
          </Link>
        </div>

        <div className="rt-middle">
          <div className="chapter-title-top">
            <BookOpen size={16} />
            <h1>Cap. {chapterNum}</h1>
          </div>
        </div>

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
      
      <main 
        className="verses" 
        style={{ fontSize: `${fontSize}px` }}
        // MELHORIA: Adiciona handlers de Touch
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {verses.map((v) => {
          const isFav = favorites.has(v.id);
          return (
            <article 
              key={v.id} 
              className="verse"
              onClick={(e) => e.stopPropagation()} // Impede que clique no verso feche UI
            >
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

      <footer className={`chapter-footer sticky-footer ${!isUiVisible ? "hidden" : ""}`}>
        <button
          className="footer-nav"
          onClick={handlePrev}
          disabled={!actualPrevChapter}
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
          disabled={!actualNextChapter}
          aria-label="Próximo capítulo"
        >
          <span>Próximo</span>
          <ChevronRight size={18} />
        </button>
      </footer>

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
        readingTheme={readingTheme}
        setReadingTheme={setReadingTheme}
      />
    </div>
  ); 
}

