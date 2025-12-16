import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Informe seu e-mail.');
      return;
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      const msg = 'Por questões de segurança, permitimos apenas recuperação via contas Gmail.';
      setError(msg);
      toast.error(msg, {
        style: {
          background: '#1a0000',
          border: '1px solid #5a1c1c',
          color: '#ff7777',
        }
      });
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/users/forgot-password', { email });
      
      toast.success('Link de recuperação enviado! Verifique seu e-mail.', {
        duration: 5000,
        style: {
          background: '#0d0d0d',
          border: '1px solid #2a2a2a',
          color: '#fff',
        }
      });
      
      setEmail('');
      
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao enviar. Tente novamente.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-header">
          <div className="logo-wrapper">
            <div className="logo-icon" />
            <h2 className="bible-title">Recuperar senha</h2>
          </div>
          <p className="welcome-text">
            Informe seu e-mail para continuar.
          </p>
        </div>

        <div style={{ 
          background: 'rgba(251, 191, 36, 0.1)', 
          border: '1px solid rgba(251, 191, 36, 0.2)', 
          borderRadius: '8px', 
          padding: '12px', 
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          alignItems: 'start'
        }}>
          <AlertCircle size={18} color="#fbbf24" style={{ marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#fbbf24', lineHeight: '1.4' }}>
            Atenção: A redefinição de senha está disponível apenas para contas <strong>@gmail.com</strong>.
          </p>
        </div>

        <div className="input-group">
          <div className={`input-wrapper ${error ? 'error' : ''}`}>
            <input
              type="email"
              placeholder="Seu Gmail cadastrado"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if(error) setError('');
              }}
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
            <span>Enviar link</span>
          )}
        </button>

        <div className="auth-footer">
          <Link to="/login" className="redirect-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Voltar para o Login
          </Link>
        </div>
      </form>
    </div>
  );
}