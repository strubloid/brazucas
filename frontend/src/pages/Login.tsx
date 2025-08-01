import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #009639 0%, #FEDF00 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    loginCard: {
      background: '#fff',
      borderRadius: '16px',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#666',
      fontSize: '1rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    field: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: '#333',
    },
    input: {
      padding: '12px 16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    inputFocus: {
      borderColor: '#009639',
    },
    submitButton: {
      background: '#009639',
      color: 'white',
      padding: '14px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '1rem',
    },
    submitButtonHover: {
      backgroundColor: '#007530',
    },
    submitButtonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
    error: {
      background: '#fee',
      color: '#c33',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #fcc',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem',
    },
    footer: {
      textAlign: 'center' as const,
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e0e0e0',
    },
    signupText: {
      color: '#666',
      fontSize: '0.9rem',
    },
    signupLink: {
      color: '#009639',
      textDecoration: 'none',
      fontWeight: 'bold',
    },
    backHome: {
      display: 'inline-block',
      marginBottom: '1rem',
      color: '#009639',
      textDecoration: 'none',
      fontSize: '0.9rem',
    },
  };

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

    setIsLoading(true);

    try {
      // Call login through auth context
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      // Navigate to dashboard on successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <Link to="/" style={styles.backHome}>
          ← Voltar ao início
        </Link>
        
        <div style={styles.header}>
          <h1 style={styles.title}>Entrar</h1>
          <p style={styles.subtitle}>Acesse sua conta Brazucas em Cork</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div style={styles.error}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="seu-email@exemplo.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Sua senha"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.submitButtonDisabled : {}),
            }}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.signupText}>
            Não tem uma conta?{' '}
            <Link to="/register" style={styles.signupLink}>
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
