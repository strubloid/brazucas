import React from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { NewsService } from '../services/newsService';
import { NewsPost } from '../types/news';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home: React.FC = () => {
  // Fetch latest published news for homepage
  const { data: news, loading: newsLoading } = useAsync<NewsPost[]>(
    () => NewsService.getPublishedNews(),
    []
  );

  // Get the latest 3 published news for homepage
  const latestNews = news?.slice(0, 3) || [];

  const styles = {
    container: {
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
    },
    hero: {
      background: 'linear-gradient(135deg, #009639 0%, #FEDF00 100%)',
      color: 'white',
      padding: '100px 20px',
      textAlign: 'center' as const,
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    },
    heroSubtitle: {
      fontSize: '1.2rem',
      marginBottom: '2rem',
      opacity: 0.9,
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap' as const,
      justifyContent: 'center',
    },
    primaryButton: {
      background: '#fff',
      color: '#009639',
      padding: '12px 24px',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 'bold',
      border: 'none',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    secondaryButton: {
      background: 'transparent',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 'bold',
      border: '2px solid #fff',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    section: {
      padding: '60px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: '2.5rem',
      textAlign: 'center' as const,
      marginBottom: '3rem',
      color: '#333',
    },
    newsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem',
    },
    newsCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      background: '#fff',
    },
    newsImage: {
      height: '200px',
      background: '#009639',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '3rem',
    },
    newsContent: {
      padding: '1.5rem',
    },
    newsTitle: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#333',
    },
    newsExcerpt: {
      color: '#666',
      lineHeight: 1.6,
      marginBottom: '1rem',
    },
    newsLink: {
      color: '#009639',
      textDecoration: 'none',
      fontWeight: 'bold',
    },
    communitySection: {
      background: '#f8f9fa',
      padding: '60px 20px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      margin: '3rem 0',
    },
    statCard: {
      textAlign: 'center' as const,
      padding: '2rem',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    statNumber: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#009639',
      marginBottom: '0.5rem',
    },
    statLabel: {
      color: '#666',
      fontSize: '1.1rem',
    },
    cta: {
      textAlign: 'center' as const,
      marginTop: '3rem',
      padding: '2rem',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    ctaTitle: {
      fontSize: '2rem',
      color: '#333',
      marginBottom: '1rem',
    },
    ctaText: {
      color: '#666',
      fontSize: '1.1rem',
      marginBottom: '2rem',
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Brazucas em Cork
        </h1>
        <p style={styles.heroSubtitle}>
          Sua comunidade brasileira no coração da Irlanda
        </p>
        <div style={styles.buttonGroup}>
          <Link to="/news" style={styles.primaryButton}>
            Ver Notícias
          </Link>
          <Link to="/register" style={styles.secondaryButton}>
            Junte-se a Nós
          </Link>
        </div>
      </section>

      {/* Latest News Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Últimas Notícias</h2>
        
        {newsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <LoadingSpinner text="Carregando notícias..." />
          </div>
        ) : latestNews.length > 0 ? (
          <div style={styles.newsGrid}>
            {latestNews.map((post) => (
              <article key={post.id} style={styles.newsCard}>
                {post.imageUrl ? (
                  <div style={styles.newsImage}>
                    <img 
                      src={post.imageUrl} 
                      alt={post.title}
                      style={{ 
                        height: '100%', 
                        width: '100%', 
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{...styles.newsImage, background: '#009639'}}>
                    📰
                  </div>
                )}
                <div style={styles.newsContent}>
                  <h3 style={styles.newsTitle}>
                    {post.title}
                  </h3>
                  <p style={styles.newsExcerpt}>
                    {post.excerpt}
                  </p>
                  <Link to={`/news/${post.id}`} style={styles.newsLink}>
                    Leia mais →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          // Boilerplate content when no published news exists
          <div style={styles.newsGrid}>
            <article style={styles.newsCard}>
              <div style={{...styles.newsImage, background: '#009639'}}>
                📰
              </div>
              <div style={styles.newsContent}>
                <h3 style={styles.newsTitle}>
                  Comunidade Brasileira em Cork Cresce
                </h3>
                <p style={styles.newsExcerpt}>
                  A comunidade brasileira em Cork continua crescendo com novos eventos e iniciativas que conectam brasileiros na Irlanda.
                </p>
                <Link to="/news" style={styles.newsLink}>
                  Leia mais →
                </Link>
              </div>
            </article>

            <article style={styles.newsCard}>
              <div style={{...styles.newsImage, background: '#FEDF00', color: '#333'}}>
                🎉
              </div>
              <div style={styles.newsContent}>
                <h3 style={styles.newsTitle}>
                  Próximo Evento da Comunidade
                </h3>
                <p style={styles.newsExcerpt}>
                  Junte-se a nós para nosso próximo encontro mensal da comunidade brasileira em Cork. Networking e diversão garantidos!
                </p>
                <Link to="/news" style={styles.newsLink}>
                  Leia mais →
                </Link>
              </div>
            </article>

            <article style={styles.newsCard}>
              <div style={{...styles.newsImage, background: '#0066CC'}}>
                ℹ️
              </div>
              <div style={styles.newsContent}>
                <h3 style={styles.newsTitle}>
                  Guia para Brasileiros em Cork
                </h3>
                <p style={styles.newsExcerpt}>
                  Informações essenciais para brasileiros recém-chegados em Cork: documentação, trabalho, moradia e muito mais.
                </p>
                <Link to="/news" style={styles.newsLink}>
                  Leia mais →
                </Link>
              </div>
            </article>
          </div>
        )}
      </section>

      {/* Community Section */}
      <section style={styles.communitySection}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Nossa Comunidade</h2>
          
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>500+</div>
              <div style={styles.statLabel}>Membros Ativos</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>50+</div>
              <div style={styles.statLabel}>Eventos Realizados</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>10+</div>
              <div style={styles.statLabel}>Empresas Parceiras</div>
            </div>
          </div>
          
          <div style={styles.cta}>
            <h3 style={styles.ctaTitle}>Faça Parte da Nossa Comunidade!</h3>
            <p style={styles.ctaText}>
              Conecte-se com outros brasileiros, encontre oportunidades de trabalho, 
              participe de eventos e sinta-se em casa em Cork.
            </p>
            <div style={styles.buttonGroup}>
              <Link to="/register" style={styles.primaryButton}>
                Cadastre-se Grátis
              </Link>
              <Link to="/submit-ad" style={styles.secondaryButton}>
                Anunciar Negócio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
