import React, { useEffect, useState } from "react";
import { BookOpen, Trophy } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { getBadgeConfig } from "../utils/badges"; // Importando a configuração dos selos
import "./Statistics.css";

export default function Statistics() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

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

    if (loading) {
        return (
            <div className="stats-page">
                <header className="stats-header"><h1 className="stats-title">Meu Progresso</h1></header>
                <div className="stats-hero skeleton-pulse" style={{ height: '220px' }}></div>
                <div className="stats-content">
                    <div className="section-title skeleton-text" style={{ width: '150px', marginBottom: '15px' }}></div>
                    <div className="stats-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="stat-book-card skeleton-pulse" style={{ height: '100px' }}></div>
                        ))}
                    </div>
                </div>
            </div>
        );
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
            boxShadow: `0 4px 20px ${badgeConfig.color}20`, // 20 é transparência hex
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
                    <div
                        className="stat-progress-fill"
                        style={{
                            width: `${book.progress}%`,
                            background: isCompleted ? badgeConfig.color : 'linear-gradient(90deg, #4facfe, #00f2fe)',
                            boxShadow: isCompleted ? `0 0 10px ${badgeConfig.color}` : 'none'
                        }}
                    />
                </div>

                <div className="stat-book-details">
                    <span>{book.chapters_read} / {book.total_chapters}</span>
                    <span className="detail-label">
                        {isCompleted ? badgeConfig.label : 'capítulos'}
                    </span>
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
                        <path className="circle-bg"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path className="circle"
                            strokeDasharray={`${stats.general.totalPercentage}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className="percentage-display">
                        <span className="number">{stats.general.totalPercentage}%</span>
                        <span className="label">Concluído</span>
                    </div>
                </div>

                <div className="hero-stats-row">
                    <div className="hero-stat-item">
                        <div className="icon-box blue">
                            <BookOpen size={18} />
                        </div>
                        <div className="stat-info">
                            <strong>{stats.general.totalRead}</strong>
                            <span>Lidos</span>
                        </div>
                    </div>
                    <div className="divider-vertical"></div>
                    <div className="hero-stat-item">
                        <div className="icon-box purple">
                            <Trophy size={18} />
                        </div>
                        <div className="stat-info">
                            <strong>{stats.general.totalChapters - stats.general.totalRead}</strong>
                            <span>Restantes</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="stats-content fade-in-up delay-100">
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

            <div style={{ height: '100px' }}></div>
        </div>
    );
}