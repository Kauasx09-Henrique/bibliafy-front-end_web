import React from 'react';
import './CompareModal.css';

function CompareModal({ verse, comparisonData, isLoading, onClose, currentVersion, theme }) {
  if (!verse) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${theme}`} onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Comparar Versículo</h2>
          {/* CORREÇÃO: Trocado 'verse.number' por 'verse.verse' */}
          <p>{`${verse.bookName} ${verse.chapter}:${verse.verse}`}</p>
          <button onClick={onClose} className="close-button">&times;</button>
        </header>
        <div className="modal-body">
          {isLoading ? (
            <p className="loading-comparison">Carregando comparações...</p>
          ) : (
            <>
              <div className="comparison-item original-verse">
                <span className="version-tag">{currentVersion}</span>
                <p>{verse.text}</p>
              </div>

              {comparisonData.length > 0 ? (
                comparisonData.map((data, index) => (
                  <div key={index} className="comparison-item">
                    <span className="version-tag">{data.version}</span>
                    <p>{data.text}</p>
                  </div>
                ))
              ) : (
                <p className="no-comparison-found">Nenhuma outra versão encontrada para comparar.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompareModal;
