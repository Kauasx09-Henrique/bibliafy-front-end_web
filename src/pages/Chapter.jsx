import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { renderToString } from "react-dom/server";
import {
  ChevronLeft, Settings, Heart, Share2,
  Copy, Layers, Moon, Sun,
  ArrowLeft, ArrowRight, X, BookOpen,
  NotebookPen, Headphones,
  Play, Pause, SkipBack, SkipForward,
  Mic, User
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Confetti from "react-confetti";
import Swal from "sweetalert2";

import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import NoteModal from "../components/NoteModal";
import { getBadgeConfig } from "../utils/badges";
import "./Chapter.css";

export default function Chapter() {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookName, setBookName] = useState("");
  const [totalChapters, setTotalChapters] = useState(0);

  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(-1);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedVerseForCompare, setSelectedVerseForCompare] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedVerseForNote, setSelectedVerseForNote] = useState(null);

  const [theme, setTheme] = useState(localStorage.getItem("reader-theme") || "dark");
  const [fontSize, setFontSize] = useState(Number(localStorage.getItem("reader-fontsize")) || 18);
  const [fontFamily, setFontFamily] = useState(localStorage.getItem("reader-font") || "inter");
  const [compactMode, setCompactMode] = useState(localStorage.getItem("reader-compact") === "true");

  const [voiceGender, setVoiceGender] = useState(localStorage.getItem("reader-voice") || "female");

  const [favorites, setFavorites] = useState([]);

  const [versions, setVersions] = useState([
    { id: 'nvi', abbreviation: 'nvi', name: 'Nova Versão Internacional' },
    { id: 'acf', abbreviation: 'acf', name: 'Almeida Corrigida Fiel' },
    { id: 'aa', abbreviation: 'aa', name: 'Almeida Atualizada' }
  ]);

  const [currentVersion, setCurrentVersion] = useState("nvi");
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparingVersion, setComparingVersion] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (window.responsiveVoice) window.responsiveVoice.cancel();
    };
  }, []);

  useEffect(() => {
    if (window.responsiveVoice) window.responsiveVoice.cancel();
    setIsPlaying(false);
    setShowPlayer(false);
    setCurrentVerseIndex(-1);
  }, [chapterId, bookId]);

  const speakVerse = (index) => {
    if (!verses[index] || !window.responsiveVoice) return;

    window.responsiveVoice.cancel();
    setCurrentVerseIndex(index);
    setIsPlaying(true);

    const textToRead = index === 0
      ? `${bookName} capítulo ${chapterId}. ${verses[index].text}`
      : verses[index].text;

    const voiceName = voiceGender === "male" ? "Brazilian Portuguese Male" : "Brazilian Portuguese Female";

    window.responsiveVoice.speak(textToRead, voiceName, {
      pitch: voiceGender === "male" ? 1 : 1.05,
      rate: 0.9,
      volume: 1,
      onstart: () => setIsPlaying(true),
      onend: () => {
        if (index + 1 < verses.length) {
          speakVerse(index + 1);
        } else {
          setIsPlaying(false);
          setCurrentVerseIndex(-1);
        }
      },
      onerror: () => setIsPlaying(false)
    });
  };

  const handleStartAudio = () => {
    if (verses.length === 0) return;
    setShowPlayer(true);
    const indexToStart = currentVerseIndex >= 0 ? currentVerseIndex : 0;
    speakVerse(indexToStart);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      window.responsiveVoice.cancel();
      setIsPlaying(false);
    } else {
      const index = currentVerseIndex >= 0 ? currentVerseIndex : 0;
      speakVerse(index);
    }
  };

  const skipForward = () => {
    if (currentVerseIndex + 1 < verses.length) speakVerse(currentVerseIndex + 1);
    else toast("Fim do capítulo");
  };

  const skipBack = () => {
    if (currentVerseIndex > 0) speakVerse(currentVerseIndex - 1);
    else speakVerse(0);
  };

  const closePlayer = () => {
    window.responsiveVoice.cancel();
    setIsPlaying(false);
    setShowPlayer(false);
    setCurrentVerseIndex(-1);
  };

  useEffect(() => {
    const bgColors = { light: "#f4f4f5", sepia: "#f3e9d2", dark: "#050505" };
    document.body.style.backgroundColor = bgColors[theme] || "#050505";
    return () => { document.body.style.backgroundColor = "#000000"; };
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("reader-theme", theme);
    localStorage.setItem("reader-fontsize", fontSize);
    localStorage.setItem("reader-font", fontFamily);
    localStorage.setItem("reader-compact", compactMode);
    localStorage.setItem("reader-voice", voiceGender);
  }, [theme, fontSize, fontFamily, compactMode, voiceGender]);

  const markAsRead = async () => {
    if (!token) return;
    try {
      const response = await api.post('/api/stats/mark-read', {
        bookId,
        chapter: chapterId
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.newBadge) {
        setShowConfetti(true);
        const badgeConfig = getBadgeConfig(bookId);
        const BadgeIcon = badgeConfig.icon;
        const iconHtml = renderToString(<BadgeIcon size={90} color={badgeConfig.color} strokeWidth={1.5} />);

        Swal.fire({
          html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="font-size: 1.2rem; font-weight: 600; color: #fff; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Conquista Desbloqueada!</div>
              <div style="position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%; -50%); width: 100%; height: 100%; background: radial-gradient(circle, ${badgeConfig.color}55 0%, transparent 70%); filter: blur(10px);"></div>
                  <div class="animate-pop-in-bounce" style="position: relative; z-index: 2; filter: drop-shadow(0 0 8px ${badgeConfig.color}aa);">${iconHtml}</div>
              </div>
              <h2 style="color: ${badgeConfig.color}; margin: 0; font-family: 'Playfair Display', serif; font-size: 2.5rem; text-shadow: 0 2px 10px ${badgeConfig.color}44;">${response.data.newBadge.bookName}</h2>
              <p style="color: #aaa; margin: 5px 0 0 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">${badgeConfig.label}</p>
              <p style="color: #eee; margin-top: 15px; font-size: 1rem;">Você completou todo o livro!</p>
            </div>
          `,
          color: '#fff',
          showConfirmButton: true,
          confirmButtonText: 'Resgatar Selo',
          confirmButtonColor: badgeConfig.color,
          backdrop: `rgba(0,0,0,0.6) backdrop-filter: blur(4px)`,
          customClass: { popup: 'glass-swal-popup', confirmButton: 'glass-swal-btn' },
          padding: 0
        }).then(() => setShowConfetti(false));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!loading && verses.length > 0) {
      const timer = setTimeout(() => markAsRead(), 2000);
      return () => clearTimeout(timer);
    }
  }, [chapterId, loading]);

  useEffect(() => {
    if (!bookId || !chapterId) return;

    async function loadChapter() {
      setLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const versionParam = urlParams.get("version") || "nvi";
        setCurrentVersion(versionParam);

        const [resChapter, resBook] = await Promise.all([
          api.get(`/api/bible/books/${bookId}/chapters/${chapterId}?version=${versionParam}`),
          api.get(`/api/bible/books/${bookId}`)
        ]);

        setVerses(resChapter.data);
        setBookName(resBook.data.name);
        setTotalChapters(resBook.data.total_chapters);

        if (token) {
          try {
            const resFavs = await api.get("/api/favorites", { headers: { Authorization: `Bearer ${token}` } });
            if (Array.isArray(resFavs.data)) setFavorites(resFavs.data.map(f => f.verse_id));
          } catch (e) { }
        }

        try {
          const resVersions = await api.get("/api/bible/versions");
          if (resVersions.data && Array.isArray(resVersions.data) && resVersions.data.length > 0) {
            setVersions(resVersions.data);
          }
        } catch (e) {
          console.log("Usando versões padrão devido a erro na API");
        }

        const currentReadData = { bookId, bookName: resBook.data.name, chapter: chapterId, version: versionParam };
        localStorage.setItem("bibliafyLastRead", JSON.stringify(currentReadData));
        if (token) api.put('/api/users/progress', currentReadData, { headers: { Authorization: `Bearer ${token}` } });

      } catch (err) {
        if (err.response && err.response.status === 404) toast.error("Capítulo não encontrado");
      } finally {
        setLoading(false);
      }
    }
    loadChapter();
  }, [bookId, chapterId, token, location.search]);

  const changeVersion = (newVersion) => {
    navigate(`?version=${newVersion}`);
  };

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
    } catch { toast.error("Erro ao atualizar favorito"); }
  };

  const handleCompare = async (version) => {
    if (!selectedVerseForCompare) return;
    setComparingVersion(version.abbreviation);
    setLoadingComparison(true);
    try {
      const res = await api.get(`/api/bible/verses/${selectedVerseForCompare.id}/compare?targetVersion=${version.abbreviation}`);
      setComparisonResult(res.data);
    } catch { toast.error("Erro ao comparar"); } finally { setLoadingComparison(false); }
  };

  const handleSaveNote = async (data) => {
    if (!token) return toast("Faça login para criar anotações", { icon: "🔒" });
    try {
      await api.post("/api/notes", {
        verse_id: data.verse_id, title: data.title, content: data.content,
        book_name: bookName, chapter: chapterId, verse: selectedVerseForNote.verse, verse_text: selectedVerseForNote.text
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Anotação salva!");
      setNoteModalOpen(false);
    } catch { toast.error("Erro ao salvar anotação."); }
  };

  const copyVerse = (text, ref) => {
    navigator.clipboard.writeText(`"${text}" - ${ref}`);
    toast.success("Copiado!");
  };

  if (loading) return <div className="loading-screen">Carregando leitura...</div>;

  return (
    <div className={`chapter-wrapper theme-${theme} font-${fontFamily} ${compactMode ? 'compact' : ''}`}>
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}

      <header className="toolbar-glass">
        <Link to="/home" className="back-btn-glass">
          <ChevronLeft size={24} />
          <span>Voltar</span>
        </Link>
        <span className="chapter-label">{bookName} {chapterId}</span>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`settings-btn-glass ${showPlayer ? 'active-audio' : ''}`}
            onClick={handleStartAudio}
            title="Ouvir capítulo"
            style={{ color: showPlayer ? (theme === 'light' ? '#000' : '#fff') : 'inherit' }}
          >
            <Headphones size={22} />
          </button>

          <button className="settings-btn-glass" onClick={() => setSettingsOpen(true)}>
            <Settings size={22} className="icon-settings-animated" />
          </button>
        </div>
      </header>

      <main className="verse-list">
        {verses.map((verse, index) => (
          <div
            key={verse.id}
            className={`verse-card ${index === currentVerseIndex ? 'reading-active' : ''}`}
          >
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
              <button className="action-chip" onClick={() => { setSelectedVerseForCompare(verse); setCompareOpen(true); setComparisonResult(null); setComparingVersion(null); }}>
                <Layers size={14} /> <span>Comparar</span>
              </button>
              <button className="action-chip" onClick={() => { setSelectedVerseForNote(verse); setNoteModalOpen(true); }}>
                <NotebookPen size={14} /> <span>Anotar</span>
              </button>
              <button className="action-chip" onClick={() => { if (navigator.share) navigator.share({ title: 'Bibliafy', text: `"${verse.text}" - ${bookName} ${chapterId}:${verse.verse}` }); }}>
                <Share2 size={14} /> <span>Enviar</span>
              </button>
            </div>
          </div>
        ))}
      </main>

      <footer className="footer-glass">
        <button className="f-btn" disabled={Number(chapterId) <= 1} onClick={() => navigate(`/livro/${bookId}/capitulo/${Number(chapterId) - 1}${window.location.search}`)}>
          <ArrowLeft size={18} /> Anterior
        </button>
        <span className="center-btn">{chapterId} / {totalChapters}</span>
        <button className="f-btn" disabled={Number(chapterId) >= totalChapters} onClick={() => navigate(`/livro/${bookId}/capitulo/${Number(chapterId) + 1}${window.location.search}`)}>
          Próximo <ArrowRight size={18} />
        </button>
      </footer>

      {showPlayer && (
        <div className="floating-audio-player">
          <div className="player-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              {isPlaying ? (
                <div className="audio-visualizer">
                  <div className="bar"></div><div className="bar"></div><div className="bar"></div>
                </div>
              ) : <Headphones size={16} className="close-player" />}

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="player-text">
                  {currentVerseIndex >= 0 ? `${bookName} ${chapterId}:${verses[currentVerseIndex].verse}` : "Preparando..."}
                </span>
                <span className="player-subtext">Voz Neural • Leitura {voiceGender === 'male' ? '(M)' : '(F)'}</span>
              </div>
            </div>
            <button className="close-player" onClick={closePlayer}><X size={20} /></button>
          </div>
          <div className="player-controls">
            <button className="ctrl-btn" onClick={skipBack} title="Versículo Anterior"><SkipBack size={20} /></button>
            <button className="ctrl-btn main-play" onClick={togglePlayPause}>
              {isPlaying ? <Pause size={20} fill={theme === 'dark' ? 'black' : (theme === 'light' ? 'white' : '#f3e9d2')} /> : <Play size={20} fill={theme === 'dark' ? 'black' : (theme === 'light' ? 'white' : '#f3e9d2')} style={{ marginLeft: '2px' }} />}
            </button>
            <button className="ctrl-btn" onClick={skipForward} title="Próximo Versículo"><SkipForward size={20} /></button>
          </div>
        </div>
      )}

      {noteModalOpen && selectedVerseForNote && (
        <NoteModal isOpen={noteModalOpen} verse={selectedVerseForNote} bookName={bookName} chapterNum={chapterId} onClose={() => setNoteModalOpen(false)} onSave={handleSaveNote} />
      )}

      {settingsOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false) }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Aparência</h2>
              <button className="close-button" onClick={() => setSettingsOpen(false)}><X size={24} /></button>
            </div>

            <div className="modal-section">
              <h3>Voz</h3>
              <div className="theme-options">
                <button className={`theme-btn ${voiceGender === 'female' ? 'active' : ''}`} onClick={() => setVoiceGender('female')}>
                  <User size={18} style={{ marginRight: 6 }} /> Feminina
                </button>
                <button className={`theme-btn ${voiceGender === 'male' ? 'active' : ''}`} onClick={() => setVoiceGender('male')}>
                  <User size={18} style={{ marginRight: 6 }} /> Masculina
                </button>
              </div>
            </div>

            <div className="modal-section">
              <h3>Versão</h3>
              <div className="theme-options">
                {versions.map(v => (
                  <button
                    key={v.id}
                    className={`theme-btn ${currentVersion === v.abbreviation ? 'active' : ''}`}
                    onClick={() => changeVersion(v.abbreviation)}
                    style={{ textTransform: 'uppercase' }}
                  >
                    {v.abbreviation}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-section"><h3>Tema</h3><div className="theme-options"><button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}><Sun size={20} /> Claro</button><button className={`theme-btn ${theme === 'sepia' ? 'active' : ''}`} onClick={() => setTheme('sepia')}><BookOpen size={20} /> Sépia</button><button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}><Moon size={20} /> Escuro</button></div></div>
            <div className="modal-section"><h3>Tamanho</h3><div className="font-controls"><button className="font-btn" onClick={() => setFontSize(s => Math.max(12, s - 2))}>A-</button><div className="font-size-display">{fontSize}</div><button className="font-btn" onClick={() => setFontSize(s => Math.min(32, s + 2))}>A+</button></div></div>
            <div className="modal-section"><h3>Fonte</h3><div className="font-family-options"><button className={`font-fam-btn font-inter ${fontFamily === 'inter' ? 'active' : ''}`} onClick={() => setFontFamily('inter')}>Inter</button><button className={`font-fam-btn font-lora ${fontFamily === 'lora' ? 'active' : ''}`} onClick={() => setFontFamily('lora')}>Lora</button><button className={`font-fam-btn font-garamond ${fontFamily === 'garamond' ? 'active' : ''}`} onClick={() => setFontFamily('garamond')}>Serif</button></div></div>
            <div className="modal-section"><h3>Layout</h3><button className={`toggle-mode-btn ${compactMode ? 'active' : ''}`} onClick={() => setCompactMode(!compactMode)}>{compactMode ? "Modo Compacto: ON" : "Modo Compacto: OFF"}</button></div>
          </div>
        </div>
      )}

      {compareOpen && selectedVerseForCompare && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setCompareOpen(false) }}>
          <div className="modal-content">
            <div className="modal-header"><div><h2>Comparar</h2><p className="subtitle">{bookName} {chapterId}:{selectedVerseForCompare.verse}</p></div><button className="close-button" onClick={() => setCompareOpen(false)}><X size={24} /></button></div>
            <div className="compare-body">
              <div className="current-verse-text font-lora">{selectedVerseForCompare.text}</div>
              <div className="compare-list"><h3>Escolha uma versão:</h3><div className="versions-grid">{versions.map(v => (<button key={v.id} className={`version-compare-btn ${comparingVersion === v.abbreviation ? 'active' : ''}`} onClick={() => handleCompare(v)}>{v.abbreviation.toUpperCase()}</button>))}</div>
                {loadingComparison && <div className="comparison-result loading">Carregando...</div>}{comparisonResult && !loadingComparison && (<div className="comparison-result"><strong>{comparisonResult.version.toUpperCase()}:</strong><p style={{ marginTop: 8 }}>{comparisonResult.text}</p></div>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}