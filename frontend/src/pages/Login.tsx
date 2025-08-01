import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { LoginRequest } from '../types/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Login.scss';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useAnimateOnMount('scaleIn');

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
    }
  };

  return (
    <div className="login">
      <div ref={ref} className="login__container">
        <div className="login__header">
          <h1 className="login__title">Entrar</h1>
          <p className="login__subtitle">Acesse sua conta para continuar</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          {error && (
            <div className="login__error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="login__field">
            <label htmlFor="email" className="login__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="login__input"
              placeholder="seu-email@exemplo.com"
              required
            />
          </div>

          <div className="login__field">
            <label htmlFor="password" className="login__label">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="login__input"
              placeholder="Sua senha"
              required
            />
          </div>

          <button
            type="submit"
            className="login__submit"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" text="" /> : 'Entrar'}
          </button>
        </form>

        <div className="login__footer">
          <p className="login__signup-prompt">
            Não tem uma conta?{' '}
            <Link to="/register" className="login__signup-link">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
