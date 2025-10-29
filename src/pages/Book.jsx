import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { ChevronLeft, BookOpen } from "lucide-react";
import "./Book.css";

const ChapterPill = React.memo(({ n, bookId, selectedVersion }) => (
  <Link
    to={`/livro/${bookId}/capitulo/${n}?version=${selectedVersion}`}
    className="chapter-pill"
    aria-label={`Capítulo ${n}`}
  >
    {n}
  </Link>
));

function Book() {
  const { bookId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedVersion = searchParams.get("version") || "NVI";

  const [chapters, setChapters] = useState([]);
  const [bookName, setBookName] = useState("");
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [chaptersRes, booksRes, versionsRes] = await Promise.all([
          api.get(`/api/bible/books/${bookId}/chapters`),
          api.get("/api/bible/books"),
          api.get("/api/bible/versions"),
        ]);

        setChapters(chaptersRes.data || []);
        setVersions(versionsRes.data || []);

        const current = (booksRes.data || []).find(
          (b) => String(b.id) === String(bookId)
        );
        if (!current) throw new Error("Livro não encontrado.");
        setBookName(current.name);
      } catch (e) {
        setError("Não foi possível carregar os dados do livro.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [bookId]);

  const handleVersionChange = (e) => {
    setSearchParams({ version: e.target.value });
  };

  if (loading) return <p className="loading-message">Carregando…</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="book-wrapper animate-in">
      <div className="book-toolbar">
        <Link to="/home" className="back-btn" aria-label="Voltar para Home">
          <ChevronLeft size={18} />
          <span>Voltar</span>
        </Link>

        <div className="version-selector-book">
          <label htmlFor="version">Versão</label>
          <select
            id="version"
            value={selectedVersion}
            onChange={handleVersionChange}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.abbreviation}>
                {v.name} ({v.abbreviation})
              </option>
            ))}
          </select>
        </div>
      </div>

      <header className="book-header">
        <div className="book-title">
          <BookOpen size={22} />
          <h1>{bookName}</h1>
        </div>
        <p className="book-subtitle">Selecione um capítulo</p>
      </header>

      <div className="chapters-grid">
        {chapters.map((n) => (
          <ChapterPill
            key={n}
            n={n}
            bookId={bookId}
            selectedVersion={selectedVersion}
          />
        ))}
      </div>
    </div>
  );
}

export default Book;
