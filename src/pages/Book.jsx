import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { ChevronLeft, LibraryBig, Loader2 } from "lucide-react";
import "./Book.css";

const ChapterPill = React.memo(({ num, bookId, selectedVersion }) => (
  <Link
    to={`/livro/${bookId}/capitulo/${num}?version=${selectedVersion}`}
    className="chapter-pill fade-in"
    aria-label={`Capítulo ${num}`}
  >
    {num}
  </Link>
));

export default function Book() {
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
        const [cRes, bRes, vRes] = await Promise.all([
          api.get(`/api/bible/books/${bookId}/chapters`),
          api.get("/api/bible/books"),
          api.get("/api/bible/versions"),
        ]);

        const bk = bRes.data.find((b) => String(b.id) === String(bookId));
        if (!bk) throw new Error("Livro não encontrado.");

        setBookName(bk.name);
        setChapters(cRes.data || []);
        setVersions(vRes.data || []);
      } catch {
        setError("Erro ao carregar os capítulos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [bookId]);

  const handleVersionChange = (e) =>
    setSearchParams({ version: e.target.value });

  if (loading)
    return (
      <div className="loading-container">
        <Loader2 size={32} className="spin" />
        <p>Carregando capítulos…</p>
      </div>
    );

  if (error)
    return <p className="error-message">❌ {error}</p>;

  return (
    <div className="book-wrapper fade-in">

      {/* Toolbar */}
      <div className="book-toolbar">
        <Link to="/home" className="back-btn">
          <ChevronLeft size={18} />
          <span>Voltar</span>
        </Link>

        <select
          className="version-pill"
          value={selectedVersion}
          onChange={handleVersionChange}
        >
          {versions.map((v) => (
            <option key={v.id} value={v.abbreviation}>
              {v.abbreviation}
            </option>
          ))}
        </select>
      </div>

      {/* Header */}
      <header className="book-header">
        <div className="book-title">
          <LibraryBig size={24} />
          <h1>{bookName}</h1>
        </div>
        <p className="book-subtitle">
          Escolha um capítulo para começar a leitura
        </p>
      </header>

      {/* Chapters */}
      <div className="chapters-grid">
        {chapters.map((num) => (
          <ChapterPill
            key={num}
            num={num}
            bookId={bookId}
            selectedVersion={selectedVersion}
          />
        ))}
      </div>
    </div>
  );
}
