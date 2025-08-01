import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnimateOnMount } from '../hooks/useAnimateOnMount';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { UserRole } from '../types/auth';
import './AdminRegister.scss';

interface AdminRegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  adminSecretKey: string;
}

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const ref = useAnimateOnMount('scaleIn');

  const [formData, setFormData] = useState<AdminRegisterRequest>({
    email: '',
    password: '',
    role: UserRole.ADMIN,
    adminSecretKey: '',
  });
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
    setSuccess('');
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !confirmPassword || !formData.adminSecretKey) {
      setError('Por favor, preencha todos os campos');
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting admin registration...');
      
      // Use the correct backend URL for local development
      const backendUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:4444/.netlify/functions/register'
        : '/.netlify/functions/register';
      
      // Call the register endpoint with admin role
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      let data;
      const responseText = await response.text();
      console.log('Response text:', responseText);

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Erro do servidor: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP ${response.status}: ${data.message || 'Erro desconhecido'}`);
      }

      setSuccess('Administrador registrado com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao registrar administrador');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-register-container">
      <div className="admin-register-card" ref={ref}>
        <div className="admin-register-header">
          <h1>🔐 Registro de Administrador</h1>
          <p>Crie uma conta de administrador para gerenciar o sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-register-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirme sua senha"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminSecretKey">Chave Secreta de Administrador</label>
            <input
              type="password"
              id="adminSecretKey"
              name="adminSecretKey"
              value={formData.adminSecretKey}
              onChange={handleInputChange}
              placeholder="Chave secreta fornecida pelo sistema"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : 'Registrar Administrador'}
          </button>
        </form>

        <div className="admin-register-footer">
          <p>
            <strong>Atenção:</strong> Esta página é apenas para registro de administradores. 
            Para registro de usuários normais, use a <a href="/register">página de registro</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
