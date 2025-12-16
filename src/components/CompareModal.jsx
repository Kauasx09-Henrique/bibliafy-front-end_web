const CompareModal = ({
  isOpen,
  onClose,
  verse,
  versions,
  onSelectVersionToCompare,
  bookName,
  chapterNum,
  comparisonResult,
  isComparing
}) => {
  if (!isOpen || !verse) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h2>Comparar Versões</h2>
            <p className="subtitle">{bookName} {chapterNum}:{verse.verse}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className="modal-body">
          <div className="current-verse-text">
            <span style={{ fontSize: "0.85rem", opacity: 0.7, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Versão Atual
            </span>
            {verse.text}
          </div>

          {isComparing && (
            <div className="comparison-result loading">
              <div className="spinner"></div> Buscando versículo...
            </div>
          )}

          {!isComparing && comparisonResult && (
            <div className="comparison-result">
              <span style={{ fontSize: "0.85rem", color: "#fbbf24", textTransform: "uppercase", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                {comparisonResult.version.toUpperCase()}
              </span>
              {comparisonResult.text}
            </div>
          )}

          <div className="compare-list" style={{ marginTop: "24px" }}>
            <h3>Escolha uma versão para comparar:</h3>
            <div className="versions-grid">
              {versions.map((v) => (
                <button
                  key={v.id}
                  className={`version-compare-btn ${comparisonResult?.version === v.abbreviation ? "active" : ""}`}
                  onClick={() => onSelectVersionToCompare(v.abbreviation)}
                  disabled={isComparing}
                >
                  {v.abbreviation.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};