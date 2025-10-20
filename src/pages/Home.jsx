import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import api from "../services/api";
import VerseOfTheDay from "../components/VerseOfTheDay/VerseOfTheDay";
import "./Home.css";

// Imports de Carrossel (Slick/Swiper) REMOVIDOS

// Card memoizado (continua otimizado)
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

function Home() {
  const [books, setBooks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [verseOfTheDay, setVerseOfTheDay] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // (Funções fetchVersions, fetchVerseOfTheDay, fetchBooks, useEffect...
  // ...continuam iguais, omitidas para brevidade)
   // Carrega versões
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

  // Carrega versículo do dia
  const fetchVerseOfTheDay = useCallback(async () => {
    if (!selectedVersion) return;
    try {
      const r = await api.get(
        `/api/bible/verses/random?version=${selectedVersion}`
      );
      setVerseOfTheDay(
        r.data || { text: "Nenhum versículo disponível", reference: "" }
      );
    } catch (err) {
      console.error("Erro ao carregar versículo do dia:", err);
      setVerseOfTheDay({ text: "Erro ao carregar versículo", reference: "" });
    }
  }, [selectedVersion]);

  // Carrega livros
  const fetchBooks = useCallback(async () => {
    try {
      const r = await api.get("/api/bible/books");
      setBooks(r.data || []);
    } catch (err) {
      console.error("Erro ao carregar livros:", err);
      setError("Não foi possível carregar os livros.");
    }
  }, []);

  // Inicializa dados
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchVersions();
      await fetchBooks();
      setLoading(false); // Move setLoading para cá
    })();
  }, [fetchVersions, fetchBooks]);

   // Efeito separado para buscar versículo
   useEffect(() => {
    // Busca o versículo assim que selectedVersion estiver disponível
    if (selectedVersion) {
      fetchVerseOfTheDay();
    }
  }, [selectedVersion, fetchVerseOfTheDay]);

  // Filtros (otimizados com useMemo)
  const filteredBooks = useMemo(() =>
    books.filter((b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [books, searchTerm]);

  const oldTestament = useMemo(() =>
    filteredBooks.filter((b) => b.testament_id === 1), [filteredBooks]);

  const newTestament = useMemo(() =>
    filteredBooks.filter((b) => b.testament_id === 2), [filteredBooks]);


  // ✅ Função ÚNICA: Renderiza o Grid (Mobile e Desktop)
  const renderGrid = (list) => (
    <div className="books-grid"> {/* Classe única para o grid */}
      {list.map((b) => (
        <BookCard
          key={b.id}
          book={b}
          selectedVersion={selectedVersion}
        />
      ))}
    </div>
  );

  // Função renderCarousel REMOVIDA

  // Mensagem de carregamento (pode usar o spinner do index.css)
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

      {verseOfTheDay && (
        <VerseOfTheDay
          verse={verseOfTheDay}
          onRefresh={fetchVerseOfTheDay}
        />
      )}

      <div className="search-container">
        <input
          type="search"
          className="search-bar"
          placeholder="Pesquisar livro…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <section className="testament-section">
        <h2>
          Velho Testamento
          <span className="section-accent" />
        </h2>
        {/* ✅ Chama APENAS o grid */}
        {renderGrid(oldTestament)}
      </section>

      <section className="testament-section">
        <h2>
          Novo Testamento
          <span className="section-accent" />
        </h2>
        {/* ✅ Chama APENAS o grid */}
        {renderGrid(newTestament)}
      </section>
    </div>
  );
}

export default Home;