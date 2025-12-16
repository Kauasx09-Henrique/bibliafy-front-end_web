import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Settings, Heart, Share2, 
  Copy, Type, Moon, Sun, 
  ArrowLeft, ArrowRight, X, BookOpen, Layers,
  NotebookPen 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import NoteModal from "../components/NoteModal";
import "./Chapter.css"; 

export default function Chapter() {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookName, setBookName] = useState("");
  const [totalChapters, setTotalChapters] = useState(0);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedVerseForCompare, setSelectedVerseForCompare] = useState(null);
  
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedVerseForNote, setSelectedVerseForNote] = useState(null);

  const [theme, setTheme] = useState(localStorage.getItem("reader-theme") || "dark");
  const [fontSize, setFontSize] = useState(Number(localStorage.getItem("reader-fontsize")) || 18);
  const [fontFamily, setFontFamily] = useState(localStorage.getItem("reader-font") || "inter");
  const [compactMode, setCompactMode] = useState(localStorage.getItem("reader-compact") === "true");

  const [favorites, setFavorites] = useState([]);
  const [versions, setVersions] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparingVersion, setComparingVersion] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // --- NOVO: Força a cor do BODY para não ter conflito com a Home ---
  useEffect(() => {
    // Define as cores de fundo baseadas no tema
    const bgColors = {
      light: "#f4f4f5", // Cinza claro
      sepia: "#f3e9d2", // Bege
      dark: "#050505",  // Preto
    };

    // Aplica no body do navegador
    document.body.style.backgroundColor = bgColors[theme] || "#050505";

    // Limpeza: quando sair da página, volta pro preto padrão (da Home)
    return () => {
      document.body.style.backgroundColor = "#000000";
    };
  }, [theme]);
  // ----------------------------------------------------------------

  useEffect(() => {
    localStorage.setItem("reader-theme", theme);
    localStorage.setItem("reader-fontsize", fontSize);
    localStorage.setItem("reader-font", fontFamily);
    localStorage.setItem("reader-compact", compactMode);
  }, [theme, fontSize, fontFamily, compactMode]);

  useEffect(() => {
    if (!bookId || !chapterId || chapterId === "undefined" || chapterId === "null") return;

    async function loadChapter() {
      setLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const version = urlParams.get("version") || "nvi";

        const [resChapter, resBook] = await Promise.all([
          api.get(`/api/bible/books/${bookId}/chapters/${chapterId}?version=${version}`),
          api.get(`/api/bible/books/${bookId}`)
        ]);

        setVerses(resChapter.data);
        setBookName(resBook.data.name);
        setTotalChapters(resBook.data.total_chapters);

        if (token) {
          try {
            const resFavs = await api.get("/api/favorites", { 
              headers: { Authorization: `Bearer ${token}` } 
            });
            if (Array.isArray(resFavs.data)) {
              setFavorites(resFavs.data.map(f => f.verse_id));
            }
          } catch (e) { console.log("Erro favoritos", e); }
        }

        const resVersions = await api.get("/api/bible/versions");
        setVersions(resVersions.data);

        localStorage.setItem("bibliafyLastRead", JSON.stringify({
          bookId, bookName: resBook.data.name, chapter: chapterId, version
        }));

      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 404) {
           toast.error("Capítulo não encontrado");
        }
      } finally {
        setLoading(false);
      }
    }
    loadChapter();
  }, [bookId, chapterId, token]);

  const toggleFavorite = async (verse) => {
    if (!token) return toast("Faça login para favoritar", { icon: "🔒" });

    const isFav = favorites.includes(verse.id);
    try {
      if (isFav) {
        await api.delete(`/api/favorites/${verse.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setFavorites(prev => prev.filter(id => id !== verse.id));
        toast.success("Removido dos favoritos");
      } else {
        await api.post("/api/favorites", { verse_id: verse.id }, { headers: { Authorization: `Bearer ${token}` } });
        setFavorites(prev => [...prev, verse.id]);
        toast.success("Salvo nos favoritos");
      }
    } catch {
      toast.error("Erro ao atualizar favorito");
    }
  };

  const handleCompare = async (version) => {
    if (!selectedVerseForCompare) return;
    setComparingVersion(version.abbreviation);
    setLoadingComparison(true);
    try {
      const res = await api.get(`/api/bible/verses/${selectedVerseForCompare.id}/compare?targetVersion=${version.abbreviation}`);
      setComparisonResult(res.data);
    } catch {
      toast.error("Erro ao comparar");
    } finally {
      setLoadingComparison(false);
    }
  };

  const handleSaveNote = async (data) => {
    if (!token) return toast("Faça login para criar anotações", { icon: "🔒" });
    try {
      await api.post("/api/notes", {
        verse_id: data.verse_id,
        title: data.title,
        content: data.content,
        book_name: bookName,
        chapter: chapterId,
        verse: selectedVerseForNote.verse,
        verse_text: selectedVerseForNote.text
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Anotação salva!");
      setNoteModalOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar anotação.");
    }
  };

  const copyVerse = (text, ref) => {
    navigator.clipboard.writeText(`"${text}" - ${ref}`);
    toast.success("Copiado!");
  };

  if (loading) return <div className="loading-screen">Carregando leitura...</div>;

  return (
    <div className={`chapter-wrapper theme-${theme} font-${fontFamily} ${compactMode ? 'compact' : ''}`}>
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }}/>

      <header className="toolbar-glass">
        <Link to="/home" className="back-btn-glass">
          <ChevronLeft size={24} />
          <span>Voltar</span>
        </Link>
        <span className="chapter-label">{bookName} {chapterId}</span>
        <button className="settings-btn-glass" onClick={() => setSettingsOpen(true)}>
          <Settings size={22} className="icon-settings-animated" />
        </button>
      </header>

      <main className="verse-list">
        {verses.map((verse) => (
          <div key={verse.id} className="verse-card">
            <div className="verse-header">
              <span className="verse-index">{verse.verse}</span>
              <div className="verse-actions-top">
                <button 
                  className={`va-icon ${favorites.includes(verse.id) ? 'active-fav' : ''}`}
                  onClick={() => toggleFavorite(verse)}
                >
                  <Heart size={18} fill={favorites.includes(verse.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            <p className="verse-text" style={{ fontSize: `${fontSize}px` }}>
              {verse.text}
            </p>

            <div className="verse-actions-bar">
              <button className="action-chip" onClick={() => copyVerse(verse.text, `${bookName} ${chapterId}:${verse.verse}`)}>
                <Copy size={14} /> <span>Copiar</span>
              </button>
              
              <button className="action-chip" onClick={() => {
                setSelectedVerseForCompare(verse);
                setCompareOpen(true);
                setComparisonResult(null);
                setComparingVersion(null);
              }}>
                <Layers size={14} /> <span>Comparar</span>
              </button>

              <button className="action-chip" onClick={() => {
                setSelectedVerseForNote(verse);
                setNoteModalOpen(true);
              }}>
                <NotebookPen size={14} /> <span>Anotar</span>
              </button>
              
              <button className="action-chip" onClick={() => {
                 if (navigator.share) navigator.share({ title: 'Bibliafy', text: `"${verse.text}" - ${bookName} ${chapterId}:${verse.verse}` });
                 else toast.error("Compartilhar não suportado");
              }}>
                <Share2 size={14} /> <span>Enviar</span>
              </button>
            </div>
          </div>
        ))}
      </main>

      <footer className="footer-glass">
        <button 
          className="f-btn" 
          disabled={Number(chapterId) <= 1}
          onClick={() => navigate(`/livro/${bookId}/capitulo/${Number(chapterId) - 1}${window.location.search}`)}
        >
          <ArrowLeft size={18} /> Anterior
        </button>
        <span className="center-btn">{chapterId} / {totalChapters}</span>
        <button 
          className="f-btn" 
          disabled={Number(chapterId) >= totalChapters}
          onClick={() => navigate(`/livro/${bookId}/capitulo/${Number(chapterId) + 1}${window.location.search}`)}
        >
          Próximo <ArrowRight size={18} />
        </button>
      </footer>

      {noteModalOpen && selectedVerseForNote && (
        <NoteModal
          isOpen={noteModalOpen}
          verse={selectedVerseForNote}
          bookName={bookName}
          chapterNum={chapterId}
          onClose={() => setNoteModalOpen(false)}
          onSave={handleSaveNote}
        />
      )}

      {/* ... MODAIS DE CONFIG E COMPARAR (IGUAIS AO ANTERIOR) ... */}
      {settingsOpen && (
        <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setSettingsOpen(false) }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Aparência</h2>
              <button className="close-button" onClick={() => setSettingsOpen(false)}><X size={24}/></button>
            </div>
            <div className="modal-section">
              <h3>Tema</h3>
              <div className="theme-options">
                <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}><Sun size={20}/> Claro</button>
                <button className={`theme-btn ${theme === 'sepia' ? 'active' : ''}`} onClick={() => setTheme('sepia')}><BookOpen size={20}/> Sépia</button>
                <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}><Moon size={20}/> Escuro</button>
              </div>
            </div>
            <div className="modal-section">
              <h3>Tamanho</h3>
              <div className="font-controls">
                <button className="font-btn" onClick={() => setFontSize(s => Math.max(12, s - 2))}>A-</button>
                <div className="font-size-display">{fontSize}</div>
                <button className="font-btn" onClick={() => setFontSize(s => Math.min(32, s + 2))}>A+</button>
              </div>
            </div>
            <div className="modal-section">
              <h3>Fonte</h3>
              <div className="font-family-options">
                <button className={`font-fam-btn font-inter ${fontFamily === 'inter' ? 'active' : ''}`} onClick={() => setFontFamily('inter')}>Inter</button>
                <button className={`font-fam-btn font-lora ${fontFamily === 'lora' ? 'active' : ''}`} onClick={() => setFontFamily('lora')}>Lora</button>
                <button className={`font-fam-btn font-garamond ${fontFamily === 'garamond' ? 'active' : ''}`} onClick={() => setFontFamily('garamond')}>Serif</button>
              </div>
            </div>
            <div className="modal-section">
              <h3>Layout</h3>
              <button className={`toggle-mode-btn ${compactMode ? 'active' : ''}`} onClick={() => setCompactMode(!compactMode)}>
                {compactMode ? "Modo Compacto: ON" : "Modo Compacto: OFF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {compareOpen && selectedVerseForCompare && (
        <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setCompareOpen(false) }}>
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2>Comparar</h2>
                <p className="subtitle">{bookName} {chapterId}:{selectedVerseForCompare.verse}</p>
              </div>
              <button className="close-button" onClick={() => setCompareOpen(false)}><X size={24}/></button>
            </div>
            <div className="compare-body">
              <div className="current-verse-text font-lora">{selectedVerseForCompare.text}</div>
              <div className="compare-list">
                <h3>Escolha uma versão:</h3>
                <div className="versions-grid">
                  {versions.map(v => (
                    <button key={v.id} className={`version-compare-btn ${comparingVersion === v.abbreviation ? 'active' : ''}`} onClick={() => handleCompare(v)}>
                      {v.abbreviation.toUpperCase()}
                    </button>
                  ))}
                </div>
                {loadingComparison && <div className="comparison-result loading">Carregando...</div>}
                {comparisonResult && !loadingComparison && (
                  <div className="comparison-result">
                     <strong>{comparisonResult.version.toUpperCase()}:</strong>
                     <p style={{marginTop: 8}}>{comparisonResult.text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}