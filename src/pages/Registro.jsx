import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import useRegisterForm from "../hooks/useRegisterForm";
import "./Auth.css";

export default function Registro() {
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
    handleBlur,
  } = useRegisterForm();

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const { name, nickname, email, password } = formData;

    if (!name.trim()) newErrors.name = "O nome é obrigatório.";
    if (!nickname.trim()) newErrors.nickname = "O apelido é obrigatório.";

    if (!email.trim()) newErrors.email = "O e-mail é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "E-mail inválido.";

    if (!password.trim()) newErrors.password = "A senha é obrigatória.";
    else if (password.length < 6)
      newErrors.password = "A senha deve ter pelo menos 6 caracteres.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await api.post("/api/users/register", formData);

      toast.success("Conta criada com sucesso! 🎉");

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Erro ao cadastrar. Tente novamente.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-header">
          <div className="logo-wrapper">
            <div className="logo-icon" />
            <h2 className="bible-title">Criar Conta</h2>
          </div>
          <p className="welcome-text">Junte-se ao Bibliafy</p>
        </div>

        <div className="input-group">
          <div
            className={`input-wrapper ${isFocused.name ? "focused" : ""
              } ${errors.name ? "error" : ""}`}
          >
            <input
              id="name"
              type="text"
              placeholder="Nome completo"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => handleFocus("name")}
              onBlur={() => handleBlur("name")}
              disabled={isLoading}
            />
          </div>
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="input-group">
          <div
            className={`input-wrapper ${isFocused.nickname ? "focused" : ""
              } ${errors.nickname ? "error" : ""}`}
          >
            <input
              id="nickname"
              type="text"
              placeholder="Como quer ser chamado (apelido)"
              value={formData.nickname}
              onChange={handleChange}
              onFocus={() => handleFocus("nickname")}
              onBlur={() => handleBlur("nickname")}
              disabled={isLoading}
            />
          </div>
          {errors.nickname && (
            <span className="error-message">{errors.nickname}</span>
          )}
        </div>

        <div className="input-group">
          <div
            className={`input-wrapper ${isFocused.email ? "focused" : ""
              } ${errors.email ? "error" : ""}`}
          >
            <input
              id="email"
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        <div className="input-group">
          <div
            className={`input-wrapper ${isFocused.password ? "focused" : ""
              } ${errors.password ? "error" : ""}`}
          >
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus("password")}
              onBlur={() => handleBlur("password")}
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`login-btn ${isLoading ? "loading" : ""}`}
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


        <p className="redirect-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
