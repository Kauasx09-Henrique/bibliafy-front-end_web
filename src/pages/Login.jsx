import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import '../pages/Auth.css';
import { useAuth } from '../contexts/AuthContext'; // 1. Importe o hook useAuth

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // 2. Pegue a função 'login' do nosso contexto

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/api/users/login', { email, password });

      // 3. ✅ A MUDANÇA PRINCIPAL: Use a função 'login' do contexto!
      // Isso vai atualizar o estado global e salvar no localStorage.
      login(response.data.token);

      // O alerta de sucesso continua o mesmo, ele espera o tempo definido
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

      // Agora, quando esta navegação acontecer, o ProtectedRoute já saberá que você está logado.
      navigate('/home');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      Swal.fire({ // Não precisa de 'await' aqui, pois não há ação após o erro
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
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          required
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