import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { ChevronLeft, LibraryBig, Loader2, ChevronDown } from "lucide-react";
import "./Book.css";

const SETTINGS_KEY = "bibliafyReadingSettings";

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
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const { readingTheme } = JSON.parse(saved);
        if (readingTheme) {
          document.body.classList.remove("theme-dark", "theme-light", "theme-sepia");
          document.body.classList.add(readingTheme);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar tema", e);
    }
  }, []);

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

        const bk = bRes.data.find((b) => String(b.id) === String(bookId) || b.abbrev === bookId);

        if (!bk) throw new Error("Livro não encontrado.");

        setBookName(bk.name);
        setChapters(cRes.data || []);
        setVersions(vRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar este livro.");
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
        <Loader2 size={48} className="spin-icon" />
        <p>Abrindo livro...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <p>❌ {error}</p>
        <Link to="/home" className="back-btn">Voltar ao Início</Link>
      </div>
    );

  return (
    <div className="book-wrapper fade-in">
      <div className="book-toolbar">
        <Link to="/home" className="back-btn">
          <ChevronLeft size={20} />
          <span>Voltar</span>
        </Link>

        <div className="select-wrapper">
          <select
            className="version-select"
            value={selectedVersion}
            onChange={handleVersionChange}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.abbreviation}>
                {v.abbreviation.toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="select-icon" />
        </div>
      </div>

      <header className="book-header">
        <div className="book-icon-wrapper">
          <LibraryBig size={32} strokeWidth={1.5} />
        </div>
        <h1>{bookName}</h1>
        <p className="book-subtitle">
          {chapters.length} Capítulos disponíveis
        </p>
      </header>

      <div className="chapters-grid">
        {chapters.map((num) => (
          <Link
            key={num}
            to={`/livro/${bookId}/capitulo/${num}?version=${selectedVersion}`}
            className="chapter-card"
          >
            {num}
          </Link>
        ))}
      </div>
    </div>
  );
}