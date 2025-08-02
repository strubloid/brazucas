import React from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { NewsService } from '../services/newsService';
import { AdService } from '../services/adService';
import { NewsPost } from '../types/news';
import { Advertisement } from '../types/ads';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home: React.FC = () => {
  // Fetch latest published news for homepage
  const { data: news, loading: newsLoading } = useAsync<NewsPost[]>(
    () => NewsService.getPublishedNews(),
    []
  );

  // Fetch latest published ads for homepage
  const { data: ads, loading: adsLoading } = useAsync<Advertisement[]>(
    () => AdService.getPublishedAds(),
    []
  );

  // Get the latest 3 published news for homepage
  const latestNews = news?.slice(0, 3) || [];
  
  // Get the latest 3 published ads for homepage
  const latestAds = ads?.slice(0, 3) || [];

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
    adsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem',
    },
    adCard: {
      background: '#fff',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      border: '1px solid #e5e7eb',
    },
    adHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    adTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#333',
      flex: 1,
      marginRight: '1rem',
    },
    adCategory: {
      background: '#f3f4f6',
      color: '#6b7280',
      padding: '4px 8px',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: '500',
    },
    adDescription: {
      color: '#666',
      lineHeight: 1.6,
      marginBottom: '1rem',
      fontSize: '0.95rem',
    },
    adPrice: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#009639',
      marginBottom: '1rem',
    },
    adFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '1rem',
      borderTop: '1px solid #f3f4f6',
    },
    adAuthor: {
      fontSize: '0.85rem',
      color: '#6b7280',
    },
    adContact: {
      background: '#009639',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '0.85rem',
      fontWeight: '600',
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

      {/* Latest Ads Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Últimos Anúncios</h2>
        
        {adsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <LoadingSpinner text="Carregando anúncios..." />
          </div>
        ) : latestAds.length > 0 ? (
          <div style={styles.adsGrid}>
            {latestAds.map((ad) => (
              <article key={ad.id} style={styles.adCard}>
                <div style={styles.adHeader}>
                  <h3 style={styles.adTitle}>{ad.title}</h3>
                  <span style={styles.adCategory}>{ad.category}</span>
                </div>
                <p style={styles.adDescription}>
                  {ad.description.length > 100 
                    ? `${ad.description.substring(0, 100)}...` 
                    : ad.description
                  }
                </p>
                <div style={styles.adPrice}>
                  {ad.price.includes('€') ? ad.price : `€${ad.price}`}
                </div>
                <div style={styles.adFooter}>
                  <span style={styles.adAuthor}>
                    Por: {ad.authorNickname || 'Anônimo'}
                  </span>
                  <a 
                    href={`mailto:${ad.contactEmail}`}
                    style={styles.adContact}
                    title="Entrar em contato"
                  >
                    Contatar
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          // Boilerplate content when no published ads exist
          <div style={styles.adsGrid}>
            <article style={styles.adCard}>
              <div style={styles.adHeader}>
                <h3 style={styles.adTitle}>Aulas de Português</h3>
                <span style={styles.adCategory}>Educação</span>
              </div>
              <p style={styles.adDescription}>
                Aulas particulares de português para brasileiros que querem melhorar sua comunicação profissional.
              </p>
              <div style={styles.adPrice}>€25/hora</div>
              <div style={styles.adFooter}>
                <span style={styles.adAuthor}>Por: Maria Silva</span>
                <Link to="/ads" style={styles.adContact}>Ver mais</Link>
              </div>
            </article>

            <article style={styles.adCard}>
              <div style={styles.adHeader}>
                <h3 style={styles.adTitle}>Serviço de Limpeza</h3>
                <span style={styles.adCategory}>Serviços</span>
              </div>
              <p style={styles.adDescription}>
                Limpeza residencial e comercial com produtos eco-friendly. Experiência de 5 anos.
              </p>
              <div style={styles.adPrice}>€15/hora</div>
              <div style={styles.adFooter}>
                <span style={styles.adAuthor}>Por: João Santos</span>
                <Link to="/ads" style={styles.adContact}>Ver mais</Link>
              </div>
            </article>

            <article style={styles.adCard}>
              <div style={styles.adHeader}>
                <h3 style={styles.adTitle}>Produtos Brasileiros</h3>
                <span style={styles.adCategory}>Produtos</span>
              </div>
              <p style={styles.adDescription}>
                Venda de produtos brasileiros importados: temperos, doces, café e muito mais!
              </p>
              <div style={styles.adPrice}>A partir de €5</div>
              <div style={styles.adFooter}>
                <span style={styles.adAuthor}>Por: Ana Costa</span>
                <Link to="/ads" style={styles.adContact}>Ver mais</Link>
              </div>
            </article>
          </div>
        )}

        <div style={styles.cta}>
          <h3 style={styles.ctaTitle}>Quer anunciar também?</h3>
          <p style={styles.ctaText}>
            Divulgue seus produtos e serviços para a comunidade brasileira em Cork.
          </p>
          <Link to="/submit-ad" style={styles.primaryButton}>
            Criar Anúncio
          </Link>
          <span style={{ margin: '0 1rem' }}>ou</span>
          <Link to="/ads" style={styles.secondaryButton}>
            Ver Todos os Anúncios
          </Link>
        </div>
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
