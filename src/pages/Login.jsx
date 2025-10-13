import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import '../pages/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/api/users/login', { email, password });
      localStorage.setItem('token', response.data.token);

      // Alerta de sucesso aguardando fechar
      await Swal.fire({
        icon: 'success',
        title: 'Login bem-sucedido!',
        text: 'Redirecionando...',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-popup',
          title: 'swal2-title',
          htmlContainer: 'swal2-html-container',
        }
      });

      navigate('/home'); // Navega somente depois do alerta

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      await Swal.fire({
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
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Bibliafy</h2>
        <p>Acesse sua conta para continuar</p>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="redirect-link">
          Não tem uma conta? <Link to="/registro">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
