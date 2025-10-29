import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
// 1. Importa os ícones
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Gift,
  TrendingUp,
} from "lucide-react";
import api from "../services/api";
import "./Home.css";

// --- 2. Lista de Tópicos (Sem alterações) ---
const dailyTopics = [
  {
    title: "Esperança",
    reference: "Jeremias 29:11",
    bookName: "Jeremias",
    icon: "Sparkles",
  },
  {
    title: "Ansiedade",
    reference: "Filipenses 4:6",
    bookName: "Filipenses",
    icon: "ShieldCheck",
  },
  {
    title: "Gratidão",
    reference: "Salmos 107:1",
    bookName: "Salmos", // A API pode chamar "Salmos"
    icon: "Gift",
  },
  {
    title: "Força",
    reference: "Isaías 41:10",
    bookName: "Isaías",
    icon: "TrendingUp",
  },
];

const topicIcons = {
  Sparkles: <Sparkles size={22} />,
  ShieldCheck: <ShieldCheck size={22} />,
  Gift: <Gift size={22} />,
  TrendingUp: <TrendingUp size={22} />,
};

// --- 3. Componente Card de Tópico (Sem alterações) ---
const TopicCard = React.memo(({ topic, bookId, selectedVersion }) => (
  <Link
    to={`/livro/${bookId}?version=${selectedVersion}`}
    className="topic-link"
  >
    <div className="topic-card">
      <div className="topic-icon">
        {topicIcons[topic.icon] || <Sparkles size={22} />}
      </div>
      <div className="topic-info">
        <h3>{topic.title}</h3>
        <p>{topic.reference}</p>
      </div>
    </div>
  </Link>
));

// --- Card de Livro (Sem alterações) ---
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

// --- Componente Home (Atualizado) ---
function Home() {
  const [books, setBooks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  // const [verseOfTheDay, setVerseOfTheDay] = useState(null); // REMOVIDO
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRead, setLastRead] = useState(null); // 4. NOVO: Estado "Continuar Lendo"

  // Funções fetch (sem alterações)
  const fetchVersions = useCallback(async () => {
    try {
      const r = await api.get("/api/bible/versions");
      setVersions(r.data || []);
      if (r.data?.length) setSelectedVersion(r.data[0].abbreviation);
    } catch (err) {
      console.error("Erro ao carregar versões:", err);
      setError("Não foi possível carregar as versões.");
    }
  }, []);

  // const fetchVerseOfTheDay = useCallback(async () => { ... }); // REMOVIDO

  const fetchBooks = useCallback(async () => {
    try {
      const r = await api.get("/api/bible/books");
      setBooks(r.data || []);
    } catch (err) {
      console.error("Erro ao carregar livros:", err);
      setError("Não foi possível carregar os livros.");
    }
  }, []);

  // UseEffects
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchVersions();
      await fetchBooks();
      setLoading(false);
    })();
  }, [fetchVersions, fetchBooks]);

  // useEffect(() => { ... }); // useEffect do Versículo do Dia REMOVIDO

  // --- 5. NOVO: Carrega o "Continuar Lendo" do LocalStorage ---
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem("bibliafyLastRead");
      if (savedLocation) {
        setLastRead(JSON.parse(savedLocation));
      }
    } catch (err) {
      console.error("Erro ao carregar 'Continuar Lendo':", err);
      setLastRead(null); // Garante que não quebra
    }
  }, []); // Roda só uma vez ao carregar a Home

  // --- Lógica de Tópicos (Sem alterações) ---
  const topicsWithBookId = useMemo(() => {
    if (books.length === 0) return [];
    return dailyTopics.map((topic) => {
      const book = books.find(
        (b) => b.name.toLowerCase() === topic.bookName.toLowerCase()
      );
      return {
        ...topic,
        bookId: book ? book.id : null,
      };
    });
  }, [books]);

  // Filtros de Livros (sem alterações)
  const filteredBooks = useMemo(
    () =>
      books.filter((b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [books, searchTerm]
  );

  const oldTestament = useMemo(
    () => filteredBooks.filter((b) => b.testament_id === 1),
    [filteredBooks]
  );

  const newTestament = useMemo(
    () => filteredBooks.filter((b) => b.testament_id === 2),
    [filteredBooks]
  );

  // Render Grid (sem alterações)
  const renderGrid = (list) => (
    <div className="books-grid">
      {list.map((b) => (
        <BookCard
          key={b.id}
          book={b}
          selectedVersion={selectedVersion}
        />
      ))}
    </div>
  );

  if (loading) return <div className="loading-message">Carregando…</div>;
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

      {/* --- 6. Bloco "Continuar Lendo" (Substitui o VerseOfTheDay) --- */}
      {lastRead && (
        <div className="continue-reading-card animate-in">
          <div className="continue-info">
            <p className="continue-title">Continuar Lendo</p>
            <h3 className="continue-book">
              {lastRead.bookName}, Capítulo {lastRead.chapter}
            </h3>
          </div>
          <Link
            // ATENÇÃO: O link precisa da versão, que também deve ser salva
            to={`/livro/${lastRead.bookId}/capitulo/${lastRead.chapter}?version=${lastRead.version || selectedVersion}`}
            className="continue-button"
            aria-label={`Continuar lendo ${lastRead.bookName} capítulo ${lastRead.chapter}`}
          >
            {/* Ícone de seta "play" ou "direita" */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
        </div>
      )}
      {/* --- Fim do "Continuar Lendo" --- */}

      <div className="search-container">
        <input
          type="search"
          className="search-bar"
          placeholder="Pesquisar livro…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- Seção de Tópicos (Sem alterações) --- */}
      <section className="topic-section">
        <h2>
          Tópicos do Dia
          <span className="section-accent" />
        </h2>
        <div className="topic-grid">
          {topicsWithBookId.map(
            (topic) =>
              topic.bookId && (
                <TopicCard
                  key={topic.title}
                  topic={topic}
                  bookId={topic.bookId}
                  selectedVersion={selectedVersion}
                />
              )
          )}
        </div>
      </section>

      {/* --- Seções de Livros (Sem alterações) --- */}
      <section className="testament-section">
        <h2>
          Velho Testamento
          <span className="section-accent" />
        </h2>
        {renderGrid(oldTestament)}
      </section>

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

