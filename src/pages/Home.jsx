import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import Lottie from "lottie-react";
import bibleAnimation from "../../public/Loanding.json";
import api from "../services/api";
import "./Home.css";

// --- Card de Livro ---
const BookCard = React.memo(({ book, selectedVersion }) => (
  <Link
    to={`/livro/${book.id}?version=${selectedVersion}`}
    className="book-link"
  >
    <div className="book-card">
      <div className="book-icon">
        <BookOpen size={24} />
      </div>
      <div className="book-info">
        <h3>{book.name}</h3>
        <p>{book.total_chapters} capítulos</p>
      </div>
    </div>
  </Link>
));

// --- Card de Loading com Lottie (aparece no lugar dos livros) ---
const LoadingBookCard = React.memo(() => (
  <div className="loading-book-card">
    <Lottie
      animationData={bibleAnimation}
      loop={true}
      className="loading-book-lottie"
    />
  </div>
));

function Home() {
  const [books, setBooks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRead, setLastRead] = useState(null);

  // Carregar versões
  const fetchVersions = useCallback(async () => {
    try {
      const r = await api.get("/api/bible/versions");
      setVersions(r.data || []);
      if (r.data?.length) setSelectedVersion(r.data[0].abbreviation);
    } catch {
      setError("Não foi possível carregar as versões.");
    }
  }, []);

  // Carregar livros
  const fetchBooks = useCallback(async () => {
    try {
      const r = await api.get("/api/bible/books");
      setBooks(r.data || []);
    } catch {
      setError("Não foi possível carregar os livros.");
    }
  }, []);

  // Chamar APIs
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchVersions();
      await fetchBooks();
      setLoading(false);
    })();
  }, [fetchVersions, fetchBooks]);

  // Continuar Lendo
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bibliafyLastRead");
      if (saved) setLastRead(JSON.parse(saved));
    } catch {
      setLastRead(null);
    }
  }, []);

  // Filtro de busca
  const filteredBooks = useMemo(
    () =>
      books.filter((b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [books, searchTerm]
  );

  const oldTestament = filteredBooks.filter((b) => b.testament_id === 1);
  const newTestament = filteredBooks.filter((b) => b.testament_id === 2);

  // Renderiza Grid de livros OU Lottie
  const renderGrid = (list) => (
    <div className="books-grid">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => <LoadingBookCard key={i} />)
        : list.map((b) => (
            <BookCard key={b.id} book={b} selectedVersion={selectedVersion} />
          ))}
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-wrapper">
      <div className="home-top animate-in">
        <h1 className="home-title">Bibliafy</h1>
        <div className="version-selector">
          <label htmlFor="version">Versão</label>
          <select
            id="version"
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.abbreviation}>
                {v.name} ({v.abbreviation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Continuar Lendo */}
      {lastRead && (
        <div className="continue-reading-card animate-in">
          <div className="continue-info">
            <p className="continue-title">Continuar Lendo</p>
            <h3 className="continue-book">
              {lastRead.bookName}, Capítulo {lastRead.chapter}
            </h3>
          </div>

          <Link
            to={`/livro/${lastRead.bookId}/capitulo/${lastRead.chapter}?version=${
              lastRead.version || selectedVersion
            }`}
            className="continue-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      )}

      {/* Busca */}
      <div className="search-container">
        <input
          type="search"
          className="search-bar"
          placeholder="Pesquisar livro…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Velho Testamento */}
      <section className="testament-section">
        <h2>
          Velho Testamento
          <span className="section-accent" />
        </h2>
        {renderGrid(oldTestament)}
      </section>

      {/* Novo Testamento */}
      <section className="testament-section">
        <h2>
          Novo Testamento
          <span className="section-accent" />
        </h2>
        {renderGrid(newTestament)}
      </section>
    </div>
  );
}

export default Home;
