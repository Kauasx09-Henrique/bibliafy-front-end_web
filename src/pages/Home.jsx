import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isOldTestamentOpen, setIsOldTestamentOpen] = useState(true);
  const [isNewTestamentOpen, setIsNewTestamentOpen] = useState(true);
  const [verseOfTheDay, setVerseOfTheDay] = useState(null);

  const fetchNewDailyData = useCallback(async () => {
    try {
      const verseResponse = await api.get('/api/bible/verses/random');
      const verse = verseResponse.data;
      const today = new Date().toISOString().split('T')[0];
      const dailyData = { verse, date: today };
      localStorage.setItem('dailyData', JSON.stringify(dailyData));
      setVerseOfTheDay(verse);
    } catch (err) {
      console.error("Erro ao buscar o versículo do dia:", err);
    }
  }, []);

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        const storedData = localStorage.getItem('dailyData');
        const today = new Date().toISOString().split('T')[0];
        let shouldFetchNew = true;

        if (storedData) {
          const { verse, date } = JSON.parse(storedData);
          if (date === today && verse) {
            setVerseOfTheDay(verse);
            shouldFetchNew = false;
          }
        }

        if (shouldFetchNew) {
          await fetchNewDailyData();
        }

        const booksResponse = await api.get('/api/bible/books');
        setBooks(booksResponse.data);
      } catch (err) {
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, [fetchNewDailyData]);

  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const oldTestamentBooks = filteredBooks.filter(book => book.testament_id === 1);
  const newTestamentBooks = filteredBooks.filter(book => book.testament_id === 2);

  if (loading) return <p className="loading-message">Carregando...</p>;
  if (error) return <p className="error-message-home">{error}</p>;

  return (
    <div className="home-container">
      <h1>Bibliafy</h1>

      {verseOfTheDay && (
        <div className="verse-of-the-day">
          <p className="verse-of-the-day-text">"{verseOfTheDay.text}"</p>
          <p className="verse-of-the-day-ref">
            {`${verseOfTheDay.book_name} ${verseOfTheDay.chapter}:${verseOfTheDay.verse}`}
          </p>
        </div>
      )}

      <div className="search-container">
        <input
          type="search"
          placeholder="Pesquisar livro..."
          className="search-bar"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <section className="testament-section">
        <h2 onClick={() => setIsOldTestamentOpen(!isOldTestamentOpen)}>
          Velho Testamento
          <span className={`arrow-icon ${isOldTestamentOpen ? 'open' : ''}`}>▼</span>
        </h2>
        {isOldTestamentOpen && (
          <div className="books-list">
            {oldTestamentBooks.map(book => (
              <Link to={`/livro/${book.id}`} key={book.id} className="book-link">
                <div className="book-card">
                  <h3>{book.name}</h3>
                  <p>({book.abbreviation})</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="testament-section">
        <h2 onClick={() => setIsNewTestamentOpen(!isNewTestamentOpen)}>
          Novo Testamento
          <span className={`arrow-icon ${isNewTestamentOpen ? 'open' : ''}`}>▼</span>
        </h2>
        {isNewTestamentOpen && (
          <div className="books-list">
            {newTestamentBooks.map(book => (
              <Link to={`/livro/${book.id}`} key={book.id} className="book-link">
                <div className="book-card new-testament">
                  <h3>{book.name}</h3>
                  <p>({book.abbreviation})</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
