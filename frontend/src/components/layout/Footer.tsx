import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const styles = {
    footer: {
      background: '#2c3e50',
      color: '#ecf0f1',
      padding: '3rem 0 1rem',
      marginTop: 'auto',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    content: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem',
    },
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#FEDF00',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#009639',
      marginBottom: '0.5rem',
    },
    description: {
      lineHeight: 1.6,
      color: '#bdc3c7',
    },
    linksList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    link: {
      color: '#bdc3c7',
      textDecoration: 'none',
      transition: 'color 0.2s',
    },
    linkHover: {
      color: '#FEDF00',
    },
    social: {
      display: 'flex',
      gap: '1rem',
    },
    socialLink: {
      fontSize: '1.5rem',
      textDecoration: 'none',
      transition: 'transform 0.2s',
    },
    bottom: {
      borderTop: '1px solid #34495e',
      paddingTop: '1rem',
      textAlign: 'center' as const,
    },
    copyright: {
      color: '#bdc3c7',
      fontSize: '0.9rem',
      margin: 0,
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.section}>
            <h3 style={styles.title}>🇧🇷 Brazucas em Cork</h3>
            <p style={styles.description}>
              Conectando a comunidade brasileira em Cork, Irlanda. 
              Encontre eventos, notícias e oportunidades para se sentir em casa.
            </p>
          </div>
          
          <div style={styles.section}>
            <h4 style={styles.subtitle}>Links Úteis</h4>
            <ul style={styles.linksList}>
              <li>
                <Link to="/news" style={styles.link}>
                  📰 Notícias
                </Link>
              </li>
              <li>
                <Link to="/register" style={styles.link}>
                  👥 Cadastre-se
                </Link>
              </li>
              <li>
                <Link to="/submit-ad" style={styles.link}>
                  💼 Anunciar Negócio
                </Link>
              </li>
            </ul>
          </div>
          
          <div style={styles.section}>
            <h4 style={styles.subtitle}>Redes Sociais</h4>
            <div style={styles.social}>
              <a 
                href="https://www.facebook.com/groups/809178700599371" 
                style={styles.socialLink} 
                aria-label="Facebook" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                📘
              </a>
              
              <a 
                href="https://chat.whatsapp.com/HZciDfnj0j457ZoQK8cXjw" 
                style={styles.socialLink} 
                aria-label="WhatsApp" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                �
              </a>
            </div>
          </div>

          <div style={styles.section}>
            <h4 style={styles.subtitle}>Contato</h4>
            <p style={styles.description}>
              📧 brazucascork@gmail.com<br />
              📍 Cork, Irlanda<br />
              🕒 Atendimento: Seg-Sex 10h-17h (UTC+1)
            </p>
          </div>
        </div>
        
        <div style={styles.bottom}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} Brazucas em Cork. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
