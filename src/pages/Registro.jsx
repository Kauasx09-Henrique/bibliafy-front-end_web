import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import './Auth.css'; // O CSS P&B que criamos

/**
 * Hook customizado para gerenciar o formulário de registro
 */
const useRegisterForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ name: false, email: false, password: false });

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
    setErrors,
    setIsLoading,
    setShowPassword,
    handleChange,
    handleFocus,
    handleBlur
  };
};

function Registro() {
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
  } = useRegisterForm();

  const navigate = useNavigate();

  // Validação para o registro
  const validateForm = () => {
    const newErrors = {};
    const { name, email, password } = formData;

    if (!name.trim()) {
      newErrors.name = 'O nome é obrigatório.';
    }

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await api.post('/api/users/register', formData);

      await Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado!',
        text: 'Você será redirecionado para o login.',
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-popup',
          title: 'swal2-title',
          htmlContainer: 'swal2-html-container',
        }
      });
      navigate('/login');

    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Erro ao realizar o cadastro. Tente novamente.';

      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
        customClass: {
          popup: 'swal2-popup',
          title: 'swal2-title',
          htmlContainer: 'swal2-html-container',
        }
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>

        {/* Cabeçalho */}
        <div className="auth-header">
          <div className="logo-wrapper">
            <div className="logo-icon"></div>
            <h2 className="bible-title">Criar Conta</h2>
          </div>
          <p className="welcome-text">Junte-se à comunidade Bibliafy</p>
        </div>

        {/* Campo de Nome */}
        <div className="input-group">
          <div className={`input-wrapper ${isFocused.name ? 'focused' : ''} ${errors.name ? 'error' : ''}`}>
            <input
              type="text"
              id="name"
              placeholder="Nome completo"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={() => handleBlur('name')}
              disabled={isLoading}
              required
            />
          </div>
          {errors.name && (
            <span className="error-message">
              ⚠️ {errors.name}
            </span>
          )}
        </div>

        {/* Campo de E-mail */}
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

        {/* Campo de Senha */}
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

        {/* Botão de Cadastro */}
        <button
          type="submit"
          disabled={isLoading}
          className={`login-btn ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              <span>Cadastrando...</span>
            </>
          ) : (
            <span>Cadastrar</span>
          )}
        </button>

        {/* Rodapé */}
        <div className="auth-footer">
          <p className="redirect-link">
            Já tem uma conta?
            <Link to="/login">Entre aqui</Link>
          </p>
        </div>

      </form>
    </div>
  );
}

export default Registro;