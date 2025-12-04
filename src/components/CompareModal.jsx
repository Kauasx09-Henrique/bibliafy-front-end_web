import React from 'react';
import './CompareModal.css';
import { X } from 'lucide-react';

function CompareModal({
  verse,
  comparisonData,
  isLoading,
  onClose,
  currentVersion,
  theme
}) {
  if (!verse) return null;

  return (
    <div className="cmp-overlay" onClick={onClose}>
      <div
        className={`cmp-modal ${theme}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cmp-header">
          <div>
            <h2>Comparar Versículo</h2>
            <p className="cmp-ref">
              {verse.bookName} {verse.chapter}:{verse.verse}
            </p>
          </div>

          <button className="cmp-close" onClick={onClose} aria-label="Fechar">
            <X size={22} />
          </button>
        </header>

        <div className="cmp-body">
          {isLoading ? (
            <p className="cmp-loading">Carregando versões...</p>
          ) : (
            <>
              <div className="cmp-card highlight">
                <span className="cmp-tag">{currentVersion}</span>
                <p>{verse.text}</p>
              </div>

              {comparisonData.length > 0 ? (
                comparisonData.map((v, i) => (
                  <div key={i} className="cmp-card">
                    <span className="cmp-tag">{v.version}</span>
                    <p>{v.text}</p>
                  </div>
                ))
              ) : (
                <p className="cmp-empty">
                  Nenhuma outra versão disponível para comparação.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompareModal;
