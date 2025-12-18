import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import "../pages/Auth.css";
import { useAuth } from "../contexts/AuthContext";

const useLoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleFocus = (field) => setIsFocused((prev) => ({ ...prev, [field]: true }));
  const handleBlur = (field) => setIsFocused((prev) => ({ ...prev, [field]: false }));

  return { formData, errors, showPassword, isLoading, isFocused, setErrors, setIsLoading, setShowPassword, handleChange, handleFocus, handleBlur };
};

function Login() {
  const { formData, errors, showPassword, isLoading, isFocused, setErrors, setIsLoading, setShowPassword, handleChange, handleFocus, handleBlur } = useLoginForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    const { email, password } = formData;
    if (!email.trim()) newErrors.email = "O e-mail é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Formato de e-mail inválido.";
    if (!password.trim()) newErrors.password = "A senha é obrigatória.";
    else if (password.length < 4) newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const { data } = await api.post("/api/users/login", formData);
      login(data.token);
      sessionStorage.setItem("noSplash", "true");


      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 300);

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erro ao fazer login. Verifique suas credenciais.";
      toast.error(errorMessage, {
        duration: 3000,
        style: { background: "#151515", border: "1px solid #333", color: "#fff", borderRadius: "10px" },
        iconTheme: { primary: "#ff4444", secondary: "#fff" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Toaster position="top-center" />
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-header">
          <div className="logo-wrapper"><div className="logo-icon" /><h2 className="bible-title">Bibliafy</h2></div>
          <p className="welcome-text">Acesse sua conta para continuar</p>
        </div>

        <div className="input-group">
          <div className={`input-wrapper ${isFocused.email ? "focused" : ""} ${errors.email ? "error" : ""}`}>
            <input type="email" id="email" placeholder="E-mail" value={formData.email} onChange={handleChange} onFocus={() => handleFocus("email")} onBlur={() => handleBlur("email")} disabled={isLoading} required />
          </div>
          {errors.email && <span className="error-message">⚠️ {errors.email}</span>}
        </div>

        <div className="input-group">
          <div className={`input-wrapper ${isFocused.password ? "focused" : ""} ${errors.password ? "error" : ""}`}>
            <input type={showPassword ? "text" : "password"} id="password" placeholder="Senha" value={formData.password} onChange={handleChange} onFocus={() => handleFocus("password")} onBlur={() => handleBlur("password")} disabled={isLoading} required />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="error-message">⚠️ {errors.password}</span>}
          <div className="forgot-password-wrapper"><Link to="/esqueci-senha" className="forgot-password-link">Esqueci minha senha</Link></div>
        </div>

        <button type="submit" disabled={isLoading} className={`login-btn ${isLoading ? "loading" : ""}`}>
          {isLoading ? <><span className="spinner" /><span>Entrando...</span></> : <span>Entrar</span>}
        </button>
        <div className="auth-footer"><p className="redirect-link">Não tem uma conta?<Link to="/registro"> Cadastre-se</Link></p></div>
      </form>
    </div>
  );
}

export default Login;