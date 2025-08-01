import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  const handleLogout = (): void => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const styles = {
    header: {
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '70px',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#009639',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
    },
    navList: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    navLink: {
      color: '#333',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.2s',
      padding: '8px 0',
    },
    navLinkCta: {
      background: '#009639',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 'bold',
      transition: 'background-color 0.2s',
    },
    menuToggle: {
      display: 'none',
      flexDirection: 'column' as const,
      gap: '4px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
    },
    menuToggleLine: {
      width: '24px',
      height: '2px',
      background: '#333',
      transition: 'all 0.2s',
    },
    // Mobile styles (simplified - would normally use media queries)
    mobileNav: {
      position: 'absolute' as const,
      top: '70px',
      left: 0,
      right: 0,
      background: '#fff',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      padding: '1rem',
      display: isMenuOpen ? 'block' : 'none',
    },
    mobileNavList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          <Link to="/" style={styles.logo}>
            Brazucas em Cork
          </Link>

          {/* Desktop Navigation */}
          <nav style={styles.nav}>
            <ul style={styles.navList}>
              <li>
                <Link to="/" style={styles.navLink}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/news" style={styles.navLink}>
                  Notícias
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/dashboard" style={styles.navLink}>
                    Dashboard
                  </Link>
                </li>
              )}
              {isAuthenticated ? (
                <>
                  <li>
                    <span style={styles.navLink}>Olá, {user?.nickname || 'usuário'}!</span>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout} 
                      style={{...styles.navLink, background: 'none', border: 'none', cursor: 'pointer'}}
                    >
                      Sair
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" style={styles.navLink}>
                      Entrar
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" style={styles.navLinkCta}>
                      Cadastrar
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            style={styles.menuToggle}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span style={styles.menuToggleLine}></span>
            <span style={styles.menuToggleLine}></span>
            <span style={styles.menuToggleLine}></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav style={styles.mobileNav}>
            <ul style={styles.mobileNavList}>
              <li>
                <Link to="/" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/news" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                  Notícias
                </Link>
              </li>
              {isAuthenticated && (
                <li>
                  <Link to="/dashboard" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                </li>
              )}
              {isAuthenticated ? (
                <>
                  <li>
                    <button 
                      onClick={handleLogout} 
                      style={{...styles.navLink, background: 'none', border: 'none', cursor: 'pointer'}}
                    >
                      Sair
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                      Entrar
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" style={styles.navLinkCta} onClick={() => setIsMenuOpen(false)}>
                      Cadastrar
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </header>
      
      {/* Spacer to account for fixed header */}
      <div style={{ height: '70px' }}></div>
    </>
  );
};

export default Header;
