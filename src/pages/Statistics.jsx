import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, BookOpen, Trophy, Award } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import "./Statistics.css";

export default function Statistics() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.get("/api/stats", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      } finally {
        setLoading(false);
      }
    }
    if (token) loadStats();
  }, [token]);

  if (loading) {
    return <div className="stats-loading">Calculando seu progresso...</div>;
  }

  if (!stats) return null;

  // Separa os testamentos para organizar a tela
  const oldTestament = stats.books.filter(b => b.testament_id === 1);
  const newTestament = stats.books.filter(b => b.testament_id === 2);

  // Função para renderizar um card de livro
  const renderBookCard = (book) => (
    <div key={book.id} className={`stat-book-card ${book.progress === 100 ? 'completed' : ''}`}>
      <div className="stat-book-header">
        <span className="stat-book-name">{book.name}</span>
        <span className="stat-book-percent">{book.progress}%</span>
      </div>
      
      <div className="stat-progress-bg">
        <div 
          className="stat-progress-fill" 
          style={{ width: `${book.progress}%` }}
        />
      </div>
      
      <div className="stat-book-details">
        {book.chapters_read} de {book.total_chapters} caps
      </div>
    </div>
  );

  return (
    <div className="stats-page">
      <header className="stats-header">
        <h1 className="stats-title">Meu Progresso</h1>
      </header>

      {/* PAINEL PRINCIPAL (HERO) */}
      <div className="stats-hero glass-effect">
        <div className="circular-progress-container">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path className="circle"
                strokeDasharray={`${stats.general.totalPercentage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="percentage-text">
                <span className="number">{stats.general.totalPercentage}%</span>
                <span className="label">da Bíblia</span>
            </div>
        </div>

        <div className="hero-details">
            <div className="hero-item">
                <BookOpen size={20} className="hero-icon" />
                <div>
                    <strong>{stats.general.totalRead}</strong>
                    <span>Capítulos Lidos</span>
                </div>
            </div>
            <div className="hero-item">
                <Trophy size={20} className="hero-icon" />
                <div>
                    <strong>{stats.general.totalChapters - stats.general.totalRead}</strong>
                    <span>Restantes</span>
                </div>
            </div>
        </div>
      </div>

      {/* LISTAS DE LIVROS */}
      <main className="stats-content">
        <section className="stats-section">
            <h2 className="section-title">Novo Testamento</h2>
            <div className="stats-grid">
                {newTestament.map(renderBookCard)}
            </div>
        </section>

        <section className="stats-section">
            <h2 className="section-title">Velho Testamento</h2>
            <div className="stats-grid">
                {oldTestament.map(renderBookCard)}
            </div>
        </section>
      </main>
      
      {/* Espaço para o menu inferior não cobrir o conteúdo */}
      <div style={{ height: '80px' }}></div>
    </div>
  );
}