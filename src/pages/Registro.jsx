import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import './Auth.css';

function Registro() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    
    try {
      await api.post('/api/users/register', { name, email, password });
      Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado!',
        text: 'Você será redirecionado para o login.',
        timer: 2500,
        showConfirmButton: false
      });
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao realizar o cadastro. Tente novamente.';
      setError(errorMessage);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage
      });
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Crie sua Conta</h2>
        <p>Junte-se à comunidade Bibliafy</p>
        {error && <p className="error-message">{error}</p>}
        <input 
          type="text" 
          placeholder="Nome completo"
          value={name}
          onChange={e => setName(e.target.value)} 
        />
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
        <button type="submit">Cadastrar</button>
        <p className="redirect-link">
          Já tem uma conta? <Link to="/login">Entre aqui</Link>
        </p>
      </form>
    </div>
  );
}

export default Registro;
