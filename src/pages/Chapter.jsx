import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import NoteModal from '../components/NoteModal';
import CompareModal from '../components/CompareModal'; // ✅ NOVO
import './Chapter.css';

// Ícones
const StarIcon = ({ filled = false }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const NoteIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
// No topo do Chapter.jsx, junto com os outros ícones

// ✅ NOVO Ícone de Comparação (duas páginas lado a lado)
const CompareIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4v0M14 3h4a2 2 0 0 1 2 2v14c0 1.1-.9 2-2 2h-4v0M12 3v18"/></svg>;
function Chapter() {
  const { bookId, chapterNum } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedVersion = searchParams.get('version') || 'NVI';

  // --- ESTADOS ---
  const [verses, setVerses] = useState([]);
  const [bookName, setBookName] = useState('');
  const [totalChapters, setTotalChapters] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [noteModalVerse, setNoteModalVerse] = useState(null);
  const [theme, setTheme] = useState('theme-dark');
  const [font, setFont] = useState('font-inter');
  const [fontSize, setFontSize] = useState(18);
  const [versions, setVersions] = useState([]);

  // ✅ NOVO: Estados para a comparação por versículo
  const [verseToCompare, setVerseToCompare] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [isCompareLoading, setIsCompareLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const versionsPromise = api.get('/api/bible/versions');
        const versesPromise = api.get(`/api/bible/books/${bookId}/chapters/${chapterNum}?version=${selectedVersion}`);
        const booksPromise = api.get('/api/bible/books');
        const chaptersListPromise = api.get(`/api/bible/books/${bookId}/chapters`);
        const favoritesPromise = isAuthenticated ? api.get('/api/favorites', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ data: [] });

        const [versionsRes, versesRes, booksRes, chaptersListRes, favoritesRes] = await Promise.all([versionsPromise, versesPromise, booksPromise, chaptersListPromise, favoritesPromise]);

        setVersions(versionsRes.data);
        setVerses(versesRes.data);
        setTotalChapters(chaptersListRes.data.length);
        setFavorites(new Set(favoritesRes.data.map(fav => fav.verse_id)));
        const currentBook = booksRes.data.find(b => b.id.toString() === bookId);
        if (currentBook) setBookName(currentBook.name);

      } catch (err) {
        console.error("Erro CRÍTICO ao buscar dados:", err);
        Swal.fire({ icon: 'error', title: 'Erro de Conexão', text: 'Não foi possível carregar os dados.' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [bookId, chapterNum, selectedVersion, isAuthenticated, token]);

  // ✅ NOVO: Função para buscar e comparar um versículo específico
  const handleCompareVerse = async (verse) => {
    setVerseToCompare({ ...verse, bookName, chapter: chapterNum });
    setIsCompareLoading(true);
    setComparisonData([]);

    const otherVersions = versions.filter(v => v.abbreviation !== selectedVersion);

    try {
      const comparisonPromises = otherVersions.map(v =>
        api.get(`/api/bible/books/${bookId}/chapters/${chapterNum}?version=${v.abbreviation}`)
      );

      const responses = await Promise.all(comparisonPromises);

      const finalData = responses.map((res, index) => {
        const foundVerse = res.data.find(v => v.verse === verse.verse);
        return {
          version: otherVersions[index].abbreviation,
          text: foundVerse ? foundVerse.text : "Versículo não encontrado nesta versão."
        };
      });

      setComparisonData(finalData);
    } catch (err) {
      console.error("Erro ao comparar versículos:", err);
      setComparisonData([{ version: 'Erro', text: 'Não foi possível carregar as outras versões.' }]);
    } finally {
      setIsCompareLoading(false);
    }
  };

  const handleVersionChange = (e) => setSearchParams({ version: e.target.value });
  const handleToggleFavorite = async (verseId) => { /* sua lógica... */ };
  const handleSaveNote = async (noteData) => { /* sua lógica... */ };
  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 40));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));
  const currentChapter = parseInt(chapterNum, 10);
  const prevChapter = currentChapter > 1 ? currentChapter - 1 : null;
  const nextChapter = currentChapter < totalChapters ? currentChapter + 1 : null;

  if (loading) return <div className={`chapter-container ${theme}`}><p className="loading-message">Carregando...</p></div>;

  return (
    <div className={`chapter-container ${theme} ${font}`}>
      <header className="chapter-header">
        <div className="chapter-nav">{prevChapter ? <Link to={`/livro/${bookId}/capitulo/${prevChapter}?version=${selectedVersion}`} className="nav-arrow">‹</Link> : <span className="nav-arrow disabled">‹</span>}</div>
        <div className="chapter-title-container"><Link to={`/livro/${bookId}?version=${selectedVersion}`} className="book-title-link"><h1>{bookName}</h1></Link><p className="chapter-subtitle">Capítulo {chapterNum}</p></div>
        <div className="chapter-nav">{nextChapter ? <Link to={`/livro/${bookId}/capitulo/${nextChapter}?version=${selectedVersion}`} className="nav-arrow">›</Link> : <span className="nav-arrow disabled">›</span>}</div>
      </header>

      <div className="reading-options">
        <div className="option-group"><span className="option-label">Tema:</span><div className="theme-buttons"><button onClick={() => setTheme('theme-light')} className={`theme-btn light ${theme === 'theme-light' ? 'active' : ''}`} title="Claro" /><button onClick={() => setTheme('theme-dark')} className={`theme-btn dark ${theme === 'theme-dark' ? 'active' : ''}`} title="Escuro" /><button onClick={() => setTheme('theme-sepia')} className={`theme-btn sepia ${theme === 'theme-sepia' ? 'active' : ''}`} title="Sépia" /><button onClick={() => setTheme('theme-blue-dark')} className={`theme-btn blue-dark ${theme === 'theme-blue-dark' ? 'active' : ''}`} title="Azul Escuro" /><button onClick={() => setTheme('theme-slate')} className={`theme-btn slate ${theme === 'theme-slate' ? 'active' : ''}`} title="Ardósia" /></div></div>
        <div className="option-group font-controls"><span className="option-label">Fonte:</span><select value={font} onChange={(e) => setFont(e.target.value)} className="font-select"><option value="font-inter">Moderna</option><option value="font-lora">Elegante</option><option value="font-garamond">Clássica</option></select><button onClick={decreaseFontSize} className="font-size-btn">-</button><span className="font-size-display">{fontSize}px</span><button onClick={increaseFontSize} className="font-size-btn">+</button></div>
        <div className="option-group"><span className="option-label">Versão:</span><select value={selectedVersion} onChange={handleVersionChange} className="font-select">{versions.map(v => <option key={`main-${v.id}`} value={v.abbreviation}>{v.name}</option>)}</select></div>
        <div className="option-group"><Link to="/" className="nav-btn" title="Voltar à Home"><HomeIcon /></Link></div>
      </div>

      <main className="verses-list" style={{ fontSize: `${fontSize}px` }}>
        {verses.map(verse => {
          const isFavorited = favorites.has(verse.id);
          return (
            <div key={verse.id} className="verse-item">
              <p className="verse-text">
                <span className="verse-number">{verse.verse}</span>
                {verse.text}
              </p>
              {isAuthenticated && (
                <div className="verse-actions">
                  <button onClick={() => handleToggleFavorite(verse.id)} className={`action-btn ${isFavorited ? 'active' : ''}`} title="Favoritar"><StarIcon filled={isFavorited} /></button>
                  <button onClick={() => setNoteModalVerse({ ...verse, bookName, chapter: chapterNum })} className="action-btn" title="Adicionar nota"><NoteIcon /></button>
                  {/* ✅ NOVO: Botão de Comparar */}
                  <button onClick={() => handleCompareVerse(verse)} className="action-btn" title="Comparar Versões"><CompareIcon /></button>
                </div>
              )}
            </div>
          );
        })}
      </main>

      <NoteModal verse={noteModalVerse} onClose={() => setNoteModalVerse(null)} onSave={handleSaveNote} />
      {/* ✅ NOVO: Renderiza o modal de comparação */}
      <CompareModal
        verse={verseToCompare}
        comparisonData={comparisonData}
        isLoading={isCompareLoading}
        onClose={() => setVerseToCompare(null)}
        currentVersion={selectedVersion}
      />
    </div>
  );
}

export default Chapter;