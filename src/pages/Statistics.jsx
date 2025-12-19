import React, { useEffect, useState } from "react";
import { BookOpen, Trophy, Calculator, Calendar as CalendarIcon } from "lucide-react";
import Calendar from 'react-calendar'; // Importando a biblioteca
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { getBadgeConfig } from "../utils/badges";
import "./Statistics.css";

export default function Statistics() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const [goalValue, setGoalValue] = useState(1);
    const [goalUnit, setGoalUnit] = useState('years');
    const [chaptersPerDay, setChaptersPerDay] = useState(0);

    const [readDates, setReadDates] = useState([
        new Date().toISOString().split('T')[0], // Hoje
        new Date(Date.now() - 86400000).toISOString().split('T')[0], // Ontem
        new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 dias atrás
    ]);

    useEffect(() => {
        async function loadStats() {
            const start = Date.now();
            try {
                const response = await api.get("/api/stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const duration = Date.now() - start;
                if (duration < 600) await new Promise(r => setTimeout(r, 600 - duration));

                setStats(response.data);


            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        if (token) loadStats();
    }, [token]);

    useEffect(() => {
        if (!stats) return;
        const remainingChapters = stats.general.totalChapters - stats.general.totalRead;

        if (remainingChapters <= 0) {
            setChaptersPerDay(0);
            return;
        }

        let totalDays = 0;
        if (goalUnit === 'days') totalDays = Number(goalValue);
        else if (goalUnit === 'months') totalDays = Number(goalValue) * 30;
        else if (goalUnit === 'years') totalDays = Number(goalValue) * 365;

        if (totalDays > 0) {
            const cpd = Math.ceil(remainingChapters / totalDays);
            setChaptersPerDay(cpd);
        } else {
            setChaptersPerDay(0);
        }
    }, [goalValue, goalUnit, stats]);

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toISOString().split('T')[0];
            if (readDates.includes(dateString)) {
                return 'highlight-read';
            }
        }
        return null;
    };

    if (loading) {
        return <div className="loading-screen">Carregando estatísticas...</div>;
    }

    if (!stats) return null;

    const oldTestament = stats.books.filter(b => b.testament_id === 1);
    const newTestament = stats.books.filter(b => b.testament_id === 2);

    const renderBookCard = (book) => {
        const isCompleted = book.progress === 100;
        const badgeConfig = getBadgeConfig(book.id);
        const BadgeIcon = badgeConfig.icon;

        const cardStyle = isCompleted ? {
            borderColor: badgeConfig.color,
            boxShadow: `0 4px 20px ${badgeConfig.color}20`,
            background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, ${badgeConfig.color}08 100%)`
        } : {};

        return (
            <div key={book.id} className={`stat-book-card ${isCompleted ? 'completed' : ''}`} style={cardStyle}>
                <div className="stat-book-header">
                    <span className="stat-book-name" style={isCompleted ? { color: '#fff', fontWeight: '700' } : {}}>
                        {book.name}
                    </span>
                    {isCompleted ? (
                        <div className="mini-badge-icon" style={{ color: badgeConfig.color }}>
                            <BadgeIcon size={20} />
                        </div>
                    ) : (
                        <span className="stat-book-percent">{book.progress}%</span>
                    )}
                </div>
                <div className="stat-progress-bg">
                    <div className="stat-progress-fill" style={{
                        width: `${book.progress}%`,
                        background: isCompleted ? badgeConfig.color : 'linear-gradient(90deg, #4facfe, #00f2fe)',
                        boxShadow: isCompleted ? `0 0 10px ${badgeConfig.color}` : 'none'
                    }} />
                </div>
                <div className="stat-book-details">
                    <span>{book.chapters_read} / {book.total_chapters}</span>
                    <span className="detail-label">{isCompleted ? badgeConfig.label : 'capítulos'}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="stats-page">
            <header className="stats-header">
                <h1 className="stats-title">Meu Progresso</h1>
            </header>

            <div className="stats-hero fade-in-up">
                <div className="circular-wrapper">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#4facfe" />
                                <stop offset="100%" stopColor="#00f2fe" />
                            </linearGradient>
                        </defs>
                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="circle" strokeDasharray={`${stats.general.totalPercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="percentage-display">
                        <span className="number">{stats.general.totalPercentage}%</span>
                        <span className="label">Concluído</span>
                    </div>
                </div>

                <div className="hero-stats-row">
                    <div className="hero-stat-item">
                        <div className="icon-box blue"><BookOpen size={18} /></div>
                        <div className="stat-info"><strong>{stats.general.totalRead}</strong><span>Lidos</span></div>
                    </div>
                    <div className="divider-vertical"></div>
                    <div className="hero-stat-item">
                        <div className="icon-box purple"><Trophy size={18} /></div>
                        <div className="stat-info"><strong>{stats.general.totalChapters - stats.general.totalRead}</strong><span>Restantes</span></div>
                    </div>
                </div>
            </div>

            <main className="stats-content fade-in-up delay-100">

                <div className="tools-grid">

                    <section className="goal-calculator-section tool-card">
                        <div className="goal-header">
                            <div className="icon-box green"><Calculator size={20} /></div>
                            <h2>Planejador</h2>
                        </div>
                        <div className="goal-body">
                            <div className="input-group">
                                <label>Meta de término:</label>
                                <div className="input-row">
                                    <input type="number" min="1" value={goalValue} onChange={(e) => setGoalValue(e.target.value)} className="goal-number-input" />
                                    <select value={goalUnit} onChange={(e) => setGoalUnit(e.target.value)} className="goal-select-input">
                                        <option value="days">Dias</option>
                                        <option value="months">Meses</option>
                                        <option value="years">Anos</option>
                                    </select>
                                </div>
                            </div>
                            <div className="goal-result">
                                <span className="highlight-number">{chaptersPerDay}</span>
                                <span className="result-text">capítulos/dia</span>
                            </div>
                        </div>
                    </section>

                    {/* CALENDÁRIO DE ATIVIDADE */}
                    <section className="calendar-section tool-card">
                        <div className="goal-header">
                            <div className="icon-box orange"><CalendarIcon size={20} /></div>
                            <h2>Atividade</h2>
                        </div>
                        <div className="calendar-container">
                            <Calendar
                                className="custom-calendar"
                                tileClassName={tileClassName}
                                locale="pt-BR"
                                prev2Label={null} // Remove botões de pular ano
                                next2Label={null}
                            />
                        </div>
                    </section>

                </div>

                <section className="stats-section">
                    <h2 className="section-title">Novo Testamento</h2>
                    <div className="stats-grid">{newTestament.map(renderBookCard)}</div>
                </section>

                <section className="stats-section">
                    <h2 className="section-title">Velho Testamento</h2>
                    <div className="stats-grid">{oldTestament.map(renderBookCard)}</div>
                </section>
            </main>

            <div style={{ height: '100px' }}></div>
        </div>
    );
}