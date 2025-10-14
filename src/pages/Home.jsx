import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Home.css';
import styled from 'styled-components';

const PREDEFINED_IMAGES = [
  'https://cdn.pixabay.com/photo/2023/12/01/21/50/sunset-8424565_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/12/01/21/50/sunset-8424565_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/12/01/21/50/sunset-8424565_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/12/01/21/50/sunset-8424565_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/12/01/21/50/sunset-8424565_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/12/01/21/50/sunset-8424565_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/12/01/21/50/sunset-8424565_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/12/01/21/50/sunset-8424565_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/12/01/21/50/sunset-8424565_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/12/01/21/50/sunset-8424565_1280.jpg',
];

// --- NOVO: Ícone de Download ---
const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

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
  background-image: url(${props => props.$imageUrl});
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

  const getDailyImageIndex = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth();
    return (day + month) % PREDEFINED_IMAGES.length;
  };

  const fetchNewDailyData = useCallback(async () => {
    try {
      const verseResponse = await api.get('/api/bible/verses/random');
      const verse = verseResponse.data;

      const today = new Date().toISOString().split('T')[0];
      const imageIndex = getDailyImageIndex(today);
      const imageUrl = PREDEFINED_IMAGES[imageIndex];

      const dailyData = { verse, imageUrl, date: today };
      localStorage.setItem('dailyData', JSON.stringify(dailyData));

      setVerseOfTheDay(verse);
      setRandomImageUrl(imageUrl);
    } catch (err) {
      console.error("❌ Erro ao buscar novos dados diários:", err);
      setRandomImageUrl(PREDEFINED_IMAGES[0]); // Fallback
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
          const parsedData = JSON.parse(storedData);
          const { verse, imageUrl, date } = parsedData;

          if (date === today && imageUrl) {
            setVerseOfTheDay(verse);
            setRandomImageUrl(imageUrl);
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
        console.error("❌ Erro em fetchInitialData:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [fetchNewDailyData]);

  // --- NOVA FUNÇÃO: handleDownloadImage ---
  const handleDownloadImage = async () => {
    if (!randomImageUrl) {
      alert("Nenhuma imagem para baixar.");
      return;
    }

    try {
      // Cria um link temporário para iniciar o download
      const link = document.createElement('a');
      link.href = randomImageUrl;
      link.download = 'bibliafy_versiculo_do_dia.jpeg'; // Nome do arquivo ao baixar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao tentar baixar a imagem:", error);
      alert("Não foi possível baixar a imagem. Tente novamente.");
    }
  };


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
          <div style={{ zIndex: 2, position: 'relative' }}> {/* Adicionado position: 'relative' */}
            <p className="verse-of-the-day-text">"{verseOfTheDay.text}"</p>
            <p className="verse-of-the-day-ref">{`${verseOfTheDay.book_name} ${verseOfTheDay.chapter}:${verseOfTheDay.verse}`}</p>
          </div>

          {/* --- NOVO: Botão de Download --- */}
          <button onClick={handleDownloadImage} className="download-image-btn" title="Baixar imagem do versículo">
            <DownloadIcon />
          </button>
        </VerseContainer>
      )}
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