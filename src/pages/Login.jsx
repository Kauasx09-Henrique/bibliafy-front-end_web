import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import '../pages/Auth.css'; // O CSS P&B que criamos
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook customizado para gerenciar todo o estado do formulário de login.
 * (Baseado no seu primeiro código, mas agora controla o isLoading também)
 */
const useLoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  return {
    formData,
    errors,
    showPassword,
    isLoading,
    isFocused,
    setErrors, // Expondo para o handleSubmit
    setIsLoading, // Expondo para o handleSubmit
    setShowPassword,
    handleChange,
    handleFocus,
    handleBlur
  };
};

function Login() {
  const {
    formData,
    errors,
    showPassword,
    isLoading,
    isFocused,
    setErrors,
    setIsLoading,
    setShowPassword,
    handleChange,
    handleFocus,
    handleBlur
  } = useLoginForm();

  const navigate = useNavigate();
  const { login } = useAuth(); // 1. Lógica de autenticação do seu NOVO arquivo

  // Função de validação do seu PRIMEIRO arquivo
  const validateForm = () => {
    const newErrors = {};
    const { email, password } = formData;

    if (!email.trim()) {
      newErrors.email = 'O e-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de e-mail inválido.';
    }

    if (!password.trim()) {
      newErrors.password = 'A senha é obrigatória.';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2. Validação primeiro
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await api.post('/api/users/login', formData);

      // 3. Usa a função de login do AuthContext
      login(response.data.token);

      // Usando os alertas temáticos do seu primeiro arquivo
      await Swal.fire({
        icon: 'success',
        title: 'Bem-vindo de volta! 🙏',
        html: '<p>Que o Senhor abençoe seu tempo conosco!</p>',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        // Classes para o CSS P&B
        customClass: {
          popup: 'swal2-popup',
          title: 'swal2-title',
          htmlContainer: 'swal2-html-container',
        }
      });

      navigate('/home');

    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        'Erro ao fazer login. Verifique suas credenciais.';

      Swal.fire({
        icon: 'error',
        title: 'Credenciais incorretas 😔',
        text: errorMessage,
        // Classes para o CSS P&B
        customClass: {
          popup: 'swal2-popup',
          title: 'swal2-title',
          htmlContainer: 'swal2-html-container',
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. JSX ESTRUTURADO que o nosso Auth.css espera
  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>

        {/* Cabeçalho que o CSS espera */}
        <div className="auth-header">
          <div className="logo-wrapper">
            <div className="logo-icon"></div> {/* Ícone P&B */}
            <h2 className="bible-title">Bibliafy</h2>
          </div>
          <p className="welcome-text">Acesse sua conta para continuar</p>
        </div>

        {/* Campo de e-mail que o CSS espera */}
        <div className="input-group">
          <div className={`input-wrapper ${isFocused.email ? 'focused' : ''} ${errors.email ? 'error' : ''}`}>
            <input
              type="email"
              id="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              disabled={isLoading}
              required
            />
          </div>
          {errors.email && (
            <span className="error-message">
              ⚠️ {errors.email}
            </span>
          )}
        </div>

        {/* Campo de senha que o CSS espera */}
        <div className="input-group">
          <div className={`input-wrapper ${isFocused.password ? 'focused' : ''} ${errors.password ? 'error' : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              disabled={isLoading}
              required
            />
            {/* Botão de ver senha (opcional, mas o CSS suporta) */}
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && (
            <span className="error-message">
              ⚠️ {errors.password}
            </span>
          )}
        </div>

        {/* Botão de login que o CSS espera */}
        <button
          type="submit"
          disabled={isLoading}
          className={`login-btn ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              <span>Entrando...</span>
            </>
          ) : (
            <span>Entrar</span>
          )}
        </button>

        {/* Rodapé que o CSS espera */}
        <div className="auth-footer">
          <p className="redirect-link">
            Não tem uma conta?
            <Link to="/registro">Cadastre-se</Link>
          </p>
        </div>

      </form>
    </div>
  );
}

export default Login;