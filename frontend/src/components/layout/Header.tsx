import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { useAnimateOnMount } from '../../hooks/useAnimateOnMount';
import './Header.scss';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ref = useAnimateOnMount('slideIn', 200);

  const handleLogout = (): void => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header ref={ref} className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <span className="header__logo-text">Brazucas em Cork</span>
        </Link>

        <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <Link to="/" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li className="header__nav-item">
              <Link to="/news" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>
                Notícias
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                {user?.role === UserRole.ADMIN && (
                  <li className="header__nav-item">
                    <Link to="/dashboard" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </li>
                )}
                {user?.role === UserRole.ADVERTISER && (
                  <li className="header__nav-item">
                    <Link to="/submit-ad" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>
                      Anunciar
                    </Link>
                  </li>
                )}
                <li className="header__nav-item">
                  <span className="header__user-info">Olá, {user?.email}</span>
                </li>
                <li className="header__nav-item">
                  <button onClick={handleLogout} className="header__nav-link header__nav-link--button">
                    Sair
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="header__nav-item">
                  <Link to="/login" className="header__nav-link" onClick={() => setIsMenuOpen(false)}>
                    Entrar
                  </Link>
                </li>
                <li className="header__nav-item">
                  <Link to="/register" className="header__nav-link header__nav-link--cta" onClick={() => setIsMenuOpen(false)}>
                    Cadastrar
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <button 
          className={`header__menu-toggle ${isMenuOpen ? 'header__menu-toggle--open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
