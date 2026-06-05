import { Link } from 'react-router-dom';

const pageStyles = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '28px 20px 40px',
  gap: '36px',
  background: 'radial-gradient(circle at top left, rgba(91, 45, 255, 0.32), transparent 28%), radial-gradient(circle at bottom right, rgba(255, 98, 177, 0.20), transparent 30%), #07070e',
  color: '#eef0ff'
};

const containerStyles = {
  width: '100%',
  maxWidth: '1200px',
  display: 'flex',
  flexDirection: 'column',
  gap: '40px'
};

const headerStyles = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '20px'
};

const brandStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const brandNameStyles = {
  margin: 0,
  fontSize: '1.45rem',
  fontWeight: 800,
  letterSpacing: '0.08em'
};

const smallBadgeStyles = {
  padding: '6px 14px',
  borderRadius: '999px',
  background: 'rgba(141, 107, 255, 0.16)',
  color: '#d7d8ff',
  fontSize: '0.82rem',
  fontWeight: 700
};

const textButtonStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 22px',
  borderRadius: '18px',
  background: 'linear-gradient(135deg, #8d6bff 0%, #ff3d9b 100%)',
  color: '#ffffff',
  fontWeight: 700,
  textDecoration: 'none'
};

const heroStyles = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: '32px',
  alignItems: 'center'
};

const heroTextStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const heroTitleStyles = {
  margin: 0,
  fontSize: 'clamp(2rem, 4vw, 3.4rem)',
  lineHeight: 1.05,
  maxWidth: '700px'
};

const heroDescriptionStyles = {
  margin: 0,
  color: '#a8accf',
  fontSize: '1rem',
  maxWidth: '620px',
  lineHeight: 1.75
};

const heroCardStyles = {
  width: '100%',
  borderRadius: '32px',
  padding: '28px',
  background: 'rgba(15, 18, 33, 0.96)',
  boxShadow: '0 40px 90px rgba(0, 0, 0, 0.32)',
  border: '1px solid rgba(255,255,255,0.08)'
};

const heroImageStyles = {
  width: '100%',
  minHeight: '320px',
  borderRadius: '24px',
  background: 'linear-gradient(180deg, rgba(113, 70, 255, 0.18) 0%, rgba(255, 62, 155, 0.08) 100%), #141c39',
  display: 'grid',
  placeItems: 'center',
  color: 'rgba(255,255,255,0.8)',
  fontSize: '0.95rem',
  textAlign: 'center',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)'
};

const featureGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '20px'
};

const featureCardStyles = {
  borderRadius: '24px',
  padding: '24px',
  background: 'rgba(7, 10, 22, 0.92)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)'
};

const featureTitleStyles = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 700
};

const featureTextStyles = {
  margin: '10px 0 0',
  color: '#a6abd7',
  fontSize: '0.95rem',
  lineHeight: 1.6
};

const finalSectionStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  padding: '28px',
  borderRadius: '28px',
  background: 'rgba(15, 18, 33, 0.95)',
  border: '1px solid rgba(255,255,255,0.07)',
  textAlign: 'center'
};

const finalTitleStyles = {
  margin: 0,
  fontSize: '1.55rem',
  fontWeight: 700
};

const finalTextStyles = {
  margin: 0,
  color: '#b7bdd4',
  fontSize: '1rem',
  lineHeight: 1.75
};

const footerStyles = {
  width: '100%',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  paddingTop: '20px',
  textAlign: 'center',
  color: '#8f96b8',
  fontSize: '0.9rem'
};

const mediaQueries = {
  heroStyles: {
    display: 'flex',
    flexDirection: 'column'
  },
  featureGridStyles: {
    gridTemplateColumns: '1fr 1fr'
  }
};

function Landing() {
  return (
    <main style={pageStyles}>
      <div style={containerStyles}>
        <header style={headerStyles}>
          <div style={brandStyles}>
            <div style={{ width: '42px', height: '42px', borderRadius: '16px', background: 'linear-gradient(135deg, #8d6bff, #ff3d9b)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800 }}>S</div>
            <div>
              <h1 style={brandNameStyles}>SIGAD</h1>
            </div>
          </div>
          <Link to="/login" style={textButtonStyles}>
            Acceder
          </Link>
        </header>

        <section style={{ ...heroStyles, ...(window.innerWidth < 900 ? mediaQueries.heroStyles : {}) }}>
          <div style={heroTextStyles}>
            <div style={smallBadgeStyles}>Gestión Académica</div>
            <div>
              <h2 style={heroTitleStyles}>Gestión Académica de Próxima Generación</h2>
              <p style={heroDescriptionStyles}>SIGAD ayuda a docentes a organizar cursos, estudiantes y asistencia con una experiencia moderna, rápida y totalmente enfocada en resultados.</p>
            </div>
            <Link to="/login" style={textButtonStyles}>
              Ingresar
            </Link>
          </div>

          <div style={heroCardStyles}>
            <img
              src="/images/sigad-hero.png"
              alt="Sistema SIGAD en una computadora futurista"
              style={{
                ...heroImageStyles,
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: '#9da3bf', fontSize: '0.95rem' }}>Funciones principales</p>
              <h3 style={{ margin: '8px 0 0', fontSize: '1.8rem' }}>Todo lo que necesitas para trabajar con tranquilidad.</h3>
            </div>
          </div>

          <div style={{ ...featureGridStyles, ...(window.innerWidth < 760 ? { gridTemplateColumns: '1fr' } : {}) }}>
            <div style={featureCardStyles}>
              <h4 style={featureTitleStyles}>Gestión de cursos</h4>
              <p style={featureTextStyles}>Crea, organiza y accede a tus cursos con una vista clara y centralizada.</p>
            </div>
            <div style={featureCardStyles}>
              <h4 style={featureTitleStyles}>Registro de asistencia</h4>
              <p style={featureTextStyles}>Controla la asistencia de estudiantes con seguimiento simple y visual.</p>
            </div>
            <div style={featureCardStyles}>
              <h4 style={featureTitleStyles}>Organización de estudiantes</h4>
              <p style={featureTextStyles}>Mantén a tus grupos y perfiles ordenados para acceso rápido.</p>
            </div>
            <div style={featureCardStyles}>
              <h4 style={featureTitleStyles}>Acceso en cualquier dispositivo</h4>
              <p style={featureTextStyles}>Funciona bien en escritorio y móvil para tener todo siempre disponible.</p>
            </div>
          </div>
        </section>

        <section style={finalSectionStyles}>
          <h3 style={finalTitleStyles}>Listo para impulsar tu trabajo docente</h3>
          <p style={finalTextStyles}>SIGAD ofrece una experiencia profesional, minimalista y ágil para crear y administrar tu aula digital.</p>
          <Link to="/login" style={textButtonStyles}>
            Comenzar ahora
          </Link>
        </section>

        <footer style={footerStyles}>
          SIGAD • {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}

export default Landing;