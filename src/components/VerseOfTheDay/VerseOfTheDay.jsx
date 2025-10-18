import React from "react";
import { RefreshCw } from "lucide-react";
import "./VerseOfTheDay.css";

export default function VerseOfTheDay({ verse, onRefresh }) {
  if (!verse) return null;

  return (
    <section className="votd-card" aria-label="Versículo do dia">
      <header className="votd-header">
        <h3>Versículo do Dia</h3>
        <button className="votd-refresh" onClick={onRefresh} title="Atualizar">
          <RefreshCw size={18} />
        </button>
      </header>

      <blockquote className="votd-text">“{verse.text}”</blockquote>
      <p className="votd-ref">
        {verse.book_name} {verse.chapter}:{verse.verse}
      </p>
    </section>
  );
}
