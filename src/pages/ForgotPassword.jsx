import { useState } from 'react';
import api from '../services/api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Informe um e-mail válido.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/users/forgot-password', { email });
      setSent(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Não foi possível enviar o e-mail. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-header">
          <div className="logo-wrapper">
            <div className="logo-icon">📖</div>
            <h2 className="bible-title">Recuperar senha</h2>
          </div>
          <p className="welcome-text">
            Informe o e-mail cadastrado para receber instruções de recuperação.
          </p>
        </div>

        <div className="input-group">
          <div className={`input-wrapper ${error ? 'error' : ''}`}>
            <input
              type="email"
              placeholder="E-mail cadastrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          {error && <span className="error-message">⚠️ {error}</span>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`login-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>Enviando...</span>
            </>
          ) : (
            <span>Enviar link de recuperação</span>
          )}
        </button>

        {sent && !error && (
          <p className="redirect-link" style={{ marginTop: '1rem' }}>
            Se este e-mail estiver cadastrado, você receberá um link em alguns minutos.
          </p>
        )}
      </form>
    </div>
  );
}