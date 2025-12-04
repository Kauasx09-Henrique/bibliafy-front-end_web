import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, ArrowRight, ChevronDown } from "lucide-react";
import Lottie from "lottie-react";
import toast from "react-hot-toast";

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

  useEffect(() => {
    if (!user) return;
    const alreadyWelcomed = sessionStorage.getItem("bibliafyWelcomed");
    const name = user.displayName || user.nickname || user.name || "bem-vindo(a) de volta";
    if (!alreadyWelcomed) {
      setTimeout(() => {
        toast.success(`Bem-vindo(a), ${name}! ✨`, {
          duration: 3800,
        });
      }, 400);
      sessionStorage.setItem("bibliafyWelcomed", "1");
    }
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
        toast("Olá, vamos meditar na Palavra hoje? 📖✨", {
          icon: "🙏",
          duration: 6000,
        });
        localStorage.setItem("bibliafyDaily8amNotified", todayKey);
      }
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!token) return;

    const checkNickname = async () => {
      try {
        const { data } = await api.get("/api/users/check-nickname", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!data.hasNickname) {
          setNeedsNickname(true);
          setNicknameInput(data.suggestedNickname || "");
          toast("Escolha como você quer ser chamado no Bibliafy ✨", {
            icon: "👤",
            duration: 5500,
          });
        }
      } catch (err) {
        console.error("Erro ao checar nickname:", err);
      }
    };

    checkNickname();
  }, [token]);

  const handleSaveNickname = async (e) => {
    e.preventDefault();
    const nick = nicknameInput.trim();
    if (!nick) {
      toast.error("Digite um apelido para continuar.");
      return;
    }

    try {
      setSavingNickname(true);
      await api.put(
        "/api/users/profile",
        { nickname: nick },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Apelido salvo com sucesso! 🙌");
      setNeedsNickname(false);

      if (user && (user.id || user.email)) {
        const key = `bibliafyNicknameSet:${user.id || user.email}`;
        localStorage.setItem(key, "1");
      }
    } catch (err) {
      toast.error("Não foi possível atualizar seu apelido.");
    } finally {
      setSavingNickname(false);
    }
  };

  const fetchVersions = useCallback(async () => {
    try {
      const response = await api.get("/api/bible/versions");
      const data = response.data || [];
      setVersions(data);
      if (!selectedVersion && data.length > 0) {
        setSelectedVersion(data[0].abbreviation);
      }
    } catch {
      toast.error("Erro ao carregar versões");
    }
  }, [selectedVersion]);

  const fetchBooks = useCallback(async () => {
    try {
      const response = await api.get("/api/bible/books");
      setBooks(response.data || []);
    } catch {
      toast.error("Erro ao carregar livros");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchVersions(), fetchBooks()]);
      setLoading(false);
    })();
  }, [fetchVersions, fetchBooks]);

  useEffect(() => {
    const saved = localStorage.getItem("bibliafyLastRead");
    if (saved) {
      setLastRead(JSON.parse(saved));
    }
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
      {needsNickname && (
        <form className="home-nickname-banner" onSubmit={handleSaveNickname}>
          <div className="home-nickname-text">
            <span>Como você quer ser chamado?</span>
            <p>Defina um apelido para personalizar sua experiência no Bibliafy.</p>
          </div>

          <div className="home-nickname-actions">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Ex: Kauã, K. Henrique..."
              className="home-nickname-input"
            />
            <button
              type="submit"
              className="home-nickname-btn"
              disabled={savingNickname}
            >
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
          <div>
            <p className="home-continue-label">CONTINUAR LENDO</p>
            <h3 className="home-continue-book">
              {lastRead.bookName} <span>|</span> Cap {lastRead.chapter}
            </h3>
          </div>

          <Link
            to={`/livro/${lastRead.bookId}/capitulo/${lastRead.chapter}?version=${
              lastRead.version || selectedVersion
            }`}
            className="home-continue-btn"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      )}

      <main className="home-main">
        <section className="home-testament">
          <div className="home-testament-header">
            <h2>Velho Testamento</h2>
            <div className="home-testament-line" />
          </div>
          {renderGrid(oldTestament)}
        </section>

        <section className="home-testament">
          <div className="home-testament-header">
            <h2>Novo Testamento</h2>
            <div className="home-testament-line" />
          </div>
          {renderGrid(newTestament)}
        </section>
      </main>
    </div>
  );
}
