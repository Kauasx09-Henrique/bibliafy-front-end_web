import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Book.css';

function Book() {
  // --- ESTADOS ---
  const [chapters, setChapters] = useState([]);
  const [bookName, setBookName] = useState('');
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState([]);
  const [error, setError] = useState(null);

  // --- HOOKS DO REACT ROUTER ---
  const { bookId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedVersion = searchParams.get('version') || 'NVI';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const chaptersPromise = api.get(`/api/bible/books/${bookId}/chapters`);
        const booksPromise = api.get('/api/bible/books');
        // ✅ CORREÇÃO APLICADA AQUI: Adicionado '/bible' ao caminho
        const versionsPromise = api.get('/api/bible/versions');

        const [chaptersResponse, booksResponse, versionsResponse] = await Promise.all([
          chaptersPromise,
          booksPromise,
          versionsPromise
        ]);

        setChapters(chaptersResponse.data);
        setVersions(versionsResponse.data);

        const currentBook = booksResponse.data.find(b => b.id.toString() === bookId);
        if (currentBook) {
          setBookName(currentBook.name);
        } else {
          throw new Error(`Livro com ID ${bookId} não encontrado.`);
        }

      } catch (err) {
        console.error("--- ERRO DETALHADO DA API ---");
        if (err.response) {
          console.error("Status do Erro:", err.response.status);
          console.error("Dados do Erro:", err.response.data);
        } else if (err.request) {
          console.error("Nenhuma resposta recebida. Verifique o backend e as políticas de CORS.");
        } else {
          console.error('Erro na configuração do Axios:', err.message);
        }
        console.error("-----------------------------");
        setError('Não foi possível carregar os dados do livro.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [bookId]);

  const handleVersionChange = (event) => {
    const newVersion = event.target.value;
    setSearchParams({ version: newVersion });
  };

  if (loading) {
    return <p className="loading-message">Carregando...</p>;
  }

  if (error) {
    return <p className="error-message-home">{error}</p>;
  }

  return (
    <div className="book-container">
      <div className="book-header">
        <h1>{bookName}</h1>
        <div className="version-selector-container-book">
          <select
            value={selectedVersion}
            onChange={handleVersionChange}
            className="version-selector-book"
          >
            {versions.map(version => (
              <option key={version.id} value={version.abbreviation}>
                {version.name} ({version.abbreviation})
              </option>
            ))}
          </select>
        </div>
      </div>

      <h2>Selecione um Capítulo</h2>
      <div className="chapters-grid">
        {chapters.map(chapterNum => (
          <Link
            to={`/livro/${bookId}/capitulo/${chapterNum}?version=${selectedVersion}`}
            key={chapterNum}
            className="chapter-link"
          >
            {chapterNum}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Book;