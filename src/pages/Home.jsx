import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, ArrowRight, ChevronDown, X } from "lucide-react";
import Lottie from "lottie-react";
import toast, { Toaster } from "react-hot-toast";

import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import bibleAnimation from "../../public/Loanding.json";

import "./Home.css";

const BookCard = ({ book, selectedVersion }) => (
  <Link
    to={`/livro/${book.id}?version=${selectedVersion}`}
    className="home-book-link"
  >
    <div className="home-book-card">
      <div className="home-book-icon">
        <BookOpen size={18} color="#fff" strokeWidth={1.6} />
      </div>

      <div className="home-book-info">
        <h3>{book.name}</h3>
        <p>{book.total_chapters} caps</p>
      </div>
    </div>
  </Link>
);

const LoadingBookCard = () => (
  <div className="home-loading-card">
    <Lottie
      animationData={bibleAnimation}
      loop
      className="home-loading-lottie"
    />
  </div>
);

export default function Home() {
  const { user, token } = useAuth();

  const [books, setBooks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastRead, setLastRead] = useState(null);
  const [loading, setLoading] = useState(true);

  const [needsNickname, setNeedsNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(user?.logo_url || null);
  const [displayName, setDisplayName] = useState(user?.nickname || user?.name || "Visitante");

  const getSafeAvatar = () => {
    if (avatarUrl) return avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`;
  };

  useEffect(() => {
    if (!user) return;
    const timerShow = setTimeout(() => setShowWelcome(true), 500);
    const timerHide = setTimeout(() => setShowWelcome(false), 6000);
    return () => { clearTimeout(timerShow); clearTimeout(timerHide); };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const checkAndNotify = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const todayKey = now.toISOString().slice(0, 10);
      const lastNotified = localStorage.getItem("bibliafyDaily8amNotified");

      if (hours === 8 && minutes === 0 && lastNotified !== todayKey) {
        toast("Olá, vamos meditar na Palavra hoje? 📖✨", { icon: "🙏", duration: 6000 });
        localStorage.setItem("bibliafyDaily8amNotified", todayKey);
      }
    };
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Carrega do LocalStorage ou do User Context inicialmente
  useEffect(() => {
    if (user && user.last_read) {
      setLastRead(user.last_read);
    } else {
      const saved = localStorage.getItem("bibliafyLastRead");
      if (saved) setLastRead(JSON.parse(saved));
    }
  }, [user]);

  // Verifica dados no servidor (CORREÇÃO APLICADA AQUI)
  useEffect(() => {
    if (!token) return;
    const checkUserData = async () => {
      try {
        const { data } = await api.get("/api/users/check-nickname", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.logo_url) {
          setAvatarUrl(data.logo_url);
        }

        if (data.nickname) {
          setDisplayName(data.nickname);
        }

        // --- AQUI ESTA A CORREÇÃO: Atualiza o lastRead vindo do banco ---
        if (data.last_read) {
          setLastRead(data.last_read);
        }
        // ---------------------------------------------------------------

        if (!data.hasNickname) {
          setNeedsNickname(true);
          setNicknameInput(data.suggestedNickname || "");
        }
      } catch (err) {
        console.error("Erro ao verificar dados do usuário:", err);
      }
    };
    checkUserData();
  }, [token]);

  const handleSaveNickname = async (e) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return toast.error("Digite um apelido.");
    try {
      setSavingNickname(true);
      await api.put(
        "/api/users/profile",
        { nickname: nicknameInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Apelido salvo!");

      setDisplayName(nicknameInput.trim());
      setNeedsNickname(false);

      if (user) user.nickname = nicknameInput.trim();
    } catch {
      toast.error("Erro ao atualizar.");
    } finally {
      setSavingNickname(false);
    }
  };

  const fetchVersions = useCallback(async () => {
    try {
      const response = await api.get("/api/bible/versions");
      setVersions(response.data || []);
      if (!selectedVersion && response.data?.length > 0) setSelectedVersion(response.data[0].abbreviation);
    } catch { toast.error("Erro ao carregar versões"); }
  }, [selectedVersion]);

  const fetchBooks = useCallback(async () => {
    try {
      const response = await api.get("/api/bible/books");
      setBooks(response.data || []);
    } catch { toast.error("Erro ao carregar livros"); }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchVersions(), fetchBooks()]);
      setLoading(false);
    })();
  }, [fetchVersions, fetchBooks]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [books, searchTerm]);

  const oldTestament = filteredBooks.filter((b) => b.testament_id === 1);
  const newTestament = filteredBooks.filter((b) => b.testament_id === 2);

  const renderGrid = (list) => (
    <div className="home-books-grid">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <LoadingBookCard key={i} />)
        : list.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            selectedVersion={selectedVersion}
          />
        ))}
    </div>
  );

  return (
    <div className="home-page">
      <Toaster position="top-center" toastOptions={{ style: { background: '#151515', color: '#fff', border: '1px solid #333' } }} />

      {showWelcome && user && (
        <div style={{
          position: 'fixed',
          top: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 8px 6px 6px',
          borderRadius: '999px',
          backgroundColor: '#050505',
          background: 'rgba(5, 5, 5, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          width: 'max-content',
          maxWidth: '90vw',
          animation: 'fadeInSlide 0.5s ease-out forwards'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={getSafeAvatar()}
              alt="Avatar"
              style={{
                width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.9)', display: 'block', background: '#333'
              }}
            />
            <span style={{ fontSize: '0.9rem', color: '#e5e5e5', fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>
              Olá, <strong style={{ color: '#ffffff' }}>{displayName}</strong>
            </span>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)', margin: '0 2px' }}></div>

          <button onClick={() => setShowWelcome(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {needsNickname && (
        <form className="home-nickname-banner" onSubmit={handleSaveNickname}>
          <div className="home-nickname-text">
            <span>Como você quer ser chamado?</span>
            <p>Defina um apelido para personalizar sua experiência.</p>
          </div>
          <div className="home-nickname-actions">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Ex: Kauã..."
              className="home-nickname-input"
            />
            <button type="submit" className="home-nickname-btn" disabled={savingNickname}>
              {savingNickname ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      <header className="home-header">
        <div className="home-header-row">
          <div className="home-brand">
            <span className="home-dot" />
            <h1 className="home-title">Bibliafy</h1>
          </div>

          <div className="home-version-wrapper">
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="home-version-select"
            >
              {versions.map((v) => (
                <option key={v.id} value={v.abbreviation}>
                  {v.abbreviation.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="home-version-arrow" />
          </div>
        </div>

        <div className="home-search-row">
          <div className="home-search-wrapper">
            <Search className="home-search-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="home-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {lastRead && (
        <div className="home-continue">
          <div className="home-continue-content">
            <p className="home-continue-label">CONTINUAR LENDO</p>
            <h3 className="home-continue-book">
              {lastRead.bookName} <span className="home-continue-divider">|</span> Cap {lastRead.chapter}
            </h3>
          </div>

          <Link
            to={`/livro/${lastRead.bookId}/capitulo/${lastRead.chapter}?version=${lastRead.version || selectedVersion}`}
            className="home-continue-arrow-btn"
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      )}

      <main className="home-main">
        <section className="home-testament">
          <div className="home-testament-header"><h2>Velho Testamento</h2><div className="home-testament-line" /></div>
          {renderGrid(oldTestament)}
        </section>

        <section className="home-testament">
          <div className="home-testament-header"><h2>Novo Testamento</h2><div className="home-testament-line" /></div>
          {renderGrid(newTestament)}
        </section>
      </main>

      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}