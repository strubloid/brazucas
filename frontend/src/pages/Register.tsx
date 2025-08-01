import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import { RegisterRequest, UserRole } from '../types/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Register.scss';

const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const ref = useAnimateOnMount('scaleIn');

  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    nickname: '',
    role: UserRole.NORMAL,
  });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.nickname || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return false;
    }

    if (formData.nickname.length < 2) {
      setError('O apelido deve ter pelo menos 2 caracteres');
      return false;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return false;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número');
      return false;
    }

    if (formData.password !== confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      await register(formData);
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao criar conta');
    }
  };

  return (
    <div className="register">
      <div ref={ref} className="register__container">
        <div className="register__header">
          <h1 className="register__title">Criar Conta</h1>
          <p className="register__subtitle">Junte-se à comunidade Brazucas em Cork</p>
        </div>

        <form className="register__form" onSubmit={handleSubmit}>
          {error && (
            <div className="register__error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="register__field">
            <label htmlFor="email" className="register__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="register__input"
              placeholder="seu-email@exemplo.com"
              required
            />
          </div>

          <div className="register__field">
            <label htmlFor="nickname" className="register__label">
              Apelido
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              className="register__input"
              placeholder="Como você gostaria de ser chamado?"
              required
            />
            <small className="register__hint">
              Este será o nome exibido no site
            </small>
          </div>

          <div className="register__field">
            <label htmlFor="password" className="register__label">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="register__input"
              placeholder="Mínimo 8 caracteres"
              required
            />
            <small className="register__hint">
              Deve conter pelo menos uma letra maiúscula, uma minúscula e um número
            </small>
          </div>

          <div className="register__field">
            <label htmlFor="confirmPassword" className="register__label">
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange}
              className="register__input"
              placeholder="Repita sua senha"
              required
            />
          </div>

          <div className="register__field">
            <label htmlFor="role" className="register__label">
              Tipo de Conta
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="register__select"
              required
            >
              <option value={UserRole.NORMAL}>Usuário Normal</option>
              <option value={UserRole.ADVERTISER}>Anunciante</option>
            </select>
            <small className="register__hint">
              {formData.role === UserRole.NORMAL 
                ? 'Pode visualizar notícias e navegar pelo site'
                : 'Pode submeter um anúncio para aprovação'
              }
            </small>
          </div>

          <button
            type="submit"
            className="register__submit"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" text="" /> : 'Criar Conta'}
          </button>
        </form>

        <div className="register__footer">
          <p className="register__login-prompt">
            Já tem uma conta?{' '}
            <Link to="/login" className="register__login-link">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
