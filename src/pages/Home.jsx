import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Home.css';
import styled from 'styled-components';

// Componente Estilizado (mantém o mesmo)
const VerseContainer = styled.div`
  position: relative;
  border-radius: 12px;
  padding: 30px 20px;
  margin: 20px auto 2.5rem auto;
  max-width: 800px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
  min-height: 200px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
background-image: url('https://i.imgur.com/79n2p3T.jpeg'); // Usando uma imagem direta do Imgur para o teste
  background-color: transparent;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.5s ease-in-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1;
  }
`;

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [isOldTestamentOpen, setIsOldTestamentOpen] = useState(true);
  const [isNewTestamentOpen, setIsNewTestamentOpen] = useState(true);

  const [verseOfTheDay, setVerseOfTheDay] = useState(null);
  const [randomImageUrl, setRandomImageUrl] = useState('');

  // Função para buscar os dados, agora com logs de depuração
  const fetchNewDailyData = useCallback(async () => {
    console.log("--- Iniciando busca de novos dados diários ---");
    try {
      const verseResponse = await api.get('/api/bible/verses/random');
      const verse = verseResponse.data;

      const imageUrl = `https://source.unsplash.com/random/1200x400/?nature,sky,faith,hope`;
      console.log("✅ 1. URL da imagem gerada:", imageUrl); // LOG 1

      const today = new Date().toISOString().split('T')[0];
      const dailyData = { verse, imageUrl, date: today };
      console.log("✅ 2. Objeto completo a ser salvo:", dailyData); // LOG 2

      localStorage.setItem('dailyData', JSON.stringify(dailyData));
      console.log("✅ 3. Dados salvos no localStorage.");

      setVerseOfTheDay(verse);
      setRandomImageUrl(imageUrl);
    } catch (err) {
      console.error("❌ Erro ao buscar novos dados diários:", err);
    }
  }, []);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const storedData = localStorage.getItem('dailyData');

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log("🔍 Dados encontrados no localStorage:", parsedData); // LOG 4
          const { verse, imageUrl, date } = parsedData;

          const today = new Date().toISOString().split('T')[0];

          if (date === today && imageUrl) { // Verificação extra se a imageUrl existe
            console.log("👍 Usando dados de hoje salvos no localStorage.");
            setVerseOfTheDay(verse);
            setRandomImageUrl(imageUrl);
          } else {
            console.log("⚠️ Dados antigos ou incompletos. Buscando novos...");
            await fetchNewDailyData();
          }
        } else {
          console.log("ℹ️ Nenhum dado no localStorage. Buscando pela primeira vez...");
          await fetchNewDailyData();
        }

        const booksPromise = api.get('/api/bible/books').then(res => setBooks(res.data));
        await booksPromise;
      } catch (err) {
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
        console.error("❌ Erro em fetchInitialData:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [fetchNewDailyData]);

  // O resto do componente permanece igual
  const filteredBooks = books.filter(book => book.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const oldTestamentBooks = filteredBooks.filter(book => book.testament_id === 1);
  const newTestamentBooks = filteredBooks.filter(book => book.testament_id === 2);

  if (loading) return <p className="loading-message">Carregando...</p>;
  if (error) return <p className="error-message-home">{error}</p>;

  return (
    <div className="home-container">
      <h1>Bibliafy</h1>
      {verseOfTheDay && (
        <VerseContainer $imageUrl={randomImageUrl}>
          <p className="verse-of-the-day-text">"{verseOfTheDay.text}"</p>
          <p className="verse-of-the-day-ref">{`${verseOfTheDay.book_name} ${verseOfTheDay.chapter}:${verseOfTheDay.verse}`}</p>
        </VerseContainer>
      )}
      {/* ...resto do JSX... */}
      <div className="search-container">
        <input type="search" placeholder="Pesquisar livro..." className="search-bar" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>
      <section className="testament-section">
        <h2 onClick={() => setIsOldTestamentOpen(!isOldTestamentOpen)}>
          Velho Testamento<span className={`arrow-icon ${isOldTestamentOpen ? 'open' : ''}`}>▼</span>
        </h2>
        {isOldTestamentOpen && (
          <div className="books-list">{oldTestamentBooks.map(book => (<Link to={`/livro/${book.id}`} key={book.id} className="book-link"><div className="book-card"><h3>{book.name}</h3><p>({book.abbreviation})</p></div></Link>))}</div>
        )}
      </section>
      <section className="testament-section">
        <h2 onClick={() => setIsNewTestamentOpen(!isNewTestamentOpen)}>
          Novo Testamento<span className={`arrow-icon ${isNewTestamentOpen ? 'open' : ''}`}>▼</span>
        </h2>
        {isNewTestamentOpen && (
          <div className="books-list">{newTestamentBooks.map(book => (<Link to={`/livro/${book.id}`} key={book.id} className="book-link"><div className="book-card new-testament"><h3>{book.name}</h3><p>({book.abbreviation})</p></div></Link>))}</div>
        )}
      </section>
    </div>
  );
}

export default Home;