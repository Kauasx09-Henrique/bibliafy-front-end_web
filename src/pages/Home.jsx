import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import api from "../services/api";
import VerseOfTheDay from "../components/VerseOfTheDay/VerseOfTheDay";
import "./Home.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

function Home() {
  const [books, setBooks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [verseOfTheDay, setVerseOfTheDay] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const r = await api.get(`/api/bible/verses/random?version=${selectedVersion}`);
      setVerseOfTheDay(r.data || { text: "Nenhum versículo disponível", reference: "" });
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
      await fetchVerseOfTheDay();
      setLoading(false);
    })();
  }, [fetchVersions, fetchBooks, fetchVerseOfTheDay]);

  // Filtro
  const filteredBooks = books.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const oldTestament = filteredBooks.filter((b) => b.testament_id === 1);
  const newTestament = filteredBooks.filter((b) => b.testament_id === 2);

  // Card
  const BookCard = ({ book }) => (
    <Link to={`/livro/${book.id}?version=${selectedVersion}`} className="book-link">
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
  );

  // Grid desktop
  const renderGrid = (list) => (
    <div className="books-grid desktop-grid">
      {list.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );

  // Carrossel mobile
  const renderCarousel = (list) => (
    <div className="mobile-carousel">
      <Swiper
        modules={[FreeMode]}
        freeMode
        grabCursor
        spaceBetween={12}
        slidesPerView={2.2}
        breakpoints={{ 420: { slidesPerView: 2.6 }, 520: { slidesPerView: 3.2 }, 640: { slidesPerView: 3.6 } }}
        className="books-swiper"
      >
        {list.map((b) => (
          <SwiperSlide key={b.id}>
            <BookCard book={b} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  if (loading) return <p className="loading-message">Carregando…</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="home-wrapper">
      <div className="home-top animate-in">
        <h1 className="home-title">Bibliafy</h1>
        <div className="version-selector">
          <label htmlFor="version">Versão</label>
          <select id="version" value={selectedVersion} onChange={(e) => setSelectedVersion(e.target.value)}>
            {versions.map((v) => (
              <option key={v.id} value={v.abbreviation}>{v.name} ({v.abbreviation})</option>
            ))}
          </select>
        </div>
      </div>

      {verseOfTheDay && <VerseOfTheDay verse={verseOfTheDay} onRefresh={fetchVerseOfTheDay} />}

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
        <h2>Velho Testamento<span className="section-accent" /></h2>
        {renderCarousel(oldTestament)}
        {renderGrid(oldTestament)}
      </section>

      <section className="testament-section">
        <h2>Novo Testamento<span className="section-accent" /></h2>
        {renderCarousel(newTestament)}
        {renderGrid(newTestament)}
      </section>
    </div>
  );
}

export default Home;
