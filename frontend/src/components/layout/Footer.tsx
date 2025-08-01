import React from 'react';
import { useAnimateOnMount } from '../../hooks/useAnimateOnMount';
import './Footer.scss';

const Footer: React.FC = () => {
  const ref = useAnimateOnMount('fadeIn', 300);

  return (
    <footer ref={ref} className="footer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__section">
            <h3 className="footer__title">Brazucas em Cork</h3>
            <p className="footer__description">
              Conectando a comunidade brasileira em Cork, Irlanda.
            </p>
          </div>
          
          <div className="footer__section">
            <h4 className="footer__subtitle">Links Úteis</h4>
            <ul className="footer__links">
              <li><a href="/news" className="footer__link">Notícias</a></li>
              <li><a href="/about" className="footer__link">Sobre</a></li>
              <li><a href="/contact" className="footer__link">Contato</a></li>
            </ul>
          </div>
          
          <div className="footer__section">
            <h4 className="footer__subtitle">Redes Sociais</h4>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Facebook">
                📘
              </a>
              <a href="#" className="footer__social-link" aria-label="Instagram">
                📷
              </a>
              <a href="#" className="footer__social-link" aria-label="WhatsApp">
                📱
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {new Date().getFullYear()} Brazucas em Cork. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
