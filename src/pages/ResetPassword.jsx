import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../pages/Auth.css'; // Usando o mesmo CSS do Login

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'As senhas não coincidem.' });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: 'error', message: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    try {
      setLoading(true);

      await api.post('/api/users/reset-password', {
        token,
        password
      });

      setStatus({ type: 'success', message: 'Senha alterada com sucesso! Redirecionando...' });

      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao redefinir senha.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2 className="bible-title">Link Inválido</h2>
          <p>O token de recuperação não foi encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-header">
          <div className="logo-wrapper">
            <div className="logo-icon">🔐</div>
            <h2 className="bible-title">Nova Senha</h2>
          </div>
          <p className="welcome-text">Digite sua nova senha abaixo.</p>
        </div>

        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <div className="input-wrapper">
            <input
              type="password"
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {status.message && (
            <span className={`message ${status.type === 'error' ? 'error-message' : 'success-message'}`} style={{ display: 'block', marginTop: '10px', color: status.type === 'error' ? '#ef4444' : '#22c55e' }}>
              {status.message}
            </span>
          )}
        </div>

        <button type="submit" disabled={loading} className={`login-btn ${loading ? 'loading' : ''}`}>
          {loading ? 'Salvando...' : 'Redefinir Senha'}
        </button>
      </form>
    </div>
  );
}