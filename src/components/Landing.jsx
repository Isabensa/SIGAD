import { Link } from 'react-router-dom';

const pageStyles = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px 16px 28px',
  gap: '28px',
  background:
    'radial-gradient(circle at top left, rgba(91, 45, 255, 0.32), transparent 28%), radial-gradient(circle at bottom right, rgba(255, 98, 177, 0.20), transparent 30%), #07070e',
  color: '#eef0ff',
};

const containerStyles = {
  width: '100%',
  maxWidth: '1100px',
  display: 'flex',
  flexDirection: 'column',
  gap: '28px',
};

const headerStyles = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
};

const brandStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const brandNameStyles = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 800,
  letterSpacing: '0.06em',
};

const smallBadgeStyles = {
  padding: '4px 10px',
  borderRadius: '999px',
  background: 'rgba(141, 107, 255, 0.12)',
  color: '#d7d8ff',
  fontSize: '0.78rem',
  fontWeight: 700,
};

const textButtonStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 18px',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #8d6bff 0%, #ff3d9b 100%)',
  color: '#ffffff',
  fontWeight: 700,
  textDecoration: 'none',
  fontSize: '0.95rem',
};

const heroStyles = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  alignItems: 'center',
};

const heroTextStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const heroTitleStyles = {
  margin: 0,
  fontSize: 'clamp(1.6rem, 3.6vw, 2.6rem)',
  lineHeight: 1.05,
  maxWidth: '640px',
};

const heroDescriptionStyles = {
  margin: 0,
  color: '#a8accf',
  fontSize: '0.95rem',
  maxWidth: '560px',
  lineHeight: 1.6,
};

const heroCardStyles = {
  width: '100%',
  borderRadius: '20px',
  padding: '18px',
  background: 'rgba(15, 18, 33, 0.9)',
  boxShadow: '0 18px 40px rgba(0, 0, 0, 0.28)',
  border: '1px solid rgba(255,255,255,0.06)',
};

const heroImageStyles = {
  width: '100%',
  minHeight: '220px',
  borderRadius: '16px',
  background:
    'linear-gradient(180deg, rgba(113, 70, 255, 0.14) 0%, rgba(255, 62, 155, 0.06) 100%), #141c39',
  display: 'grid',
  placeItems: 'center',
  color: 'rgba(255,255,255,0.8)',
  fontSize: '0.9rem',
  textAlign: 'center',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)',
};

const featureGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
};

const featureCardStyles = {
  borderRadius: '12px',
  padding: '12px',
  background: 'rgba(7, 10, 22, 0.88)',
  border: '1px solid rgba(255,255,255,0.04)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.01)',
  minHeight: '90px',
};

const featureTitleStyles = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 700,
};

const featureTextStyles = {
  margin: '8px 0 0',
  color: '#a6abd7',
  fontSize: '0.88rem',
  lineHeight: 1.4,
};

const featuresHeaderStyles = {
  marginBottom: '18px',
};

const finalSectionStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
  borderRadius: '14px',
  background: 'rgba(15, 18, 33, 0.6)',
  border: '1px solid rgba(255,255,255,0.04)',
  textAlign: 'center',
};

const footerStyles = {
  width: '100%',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  paddingTop: '16px',
  textAlign: 'center',
  color: '#8f96b8',
  fontSize: '0.85rem',
};

const mediaQueries = {
  heroStyles: {
    display: 'flex',
    flexDirection: 'column',
  },
  featureGridStyles: {
    gridTemplateColumns: '1fr 1fr',
  },
};

function Landing() {
  return (
    <main style={pageStyles}>
      <div style={containerStyles}>
        <header style={headerStyles}>
          <div style={brandStyles}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8d6bff, #ff3d9b)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 800,
              }}
            >
              S
            </div>
            <div>
              <h1 style={brandNameStyles}>SIGAD</h1>
            </div>
          </div>

          <Link to="/login" style={textButtonStyles}>
            Acceder
          </Link>
        </header>

        <section
          style={{
            ...heroStyles,
            ...(window.innerWidth < 900 ? mediaQueries.heroStyles : {}),
          }}
        >
          <div style={heroTextStyles}>
            <div style={smallBadgeStyles}>Gestión Académica</div>

            <div>
              <h2 style={heroTitleStyles}>
                Gestión Académica de Próxima Generación
              </h2>
              <p style={heroDescriptionStyles}>
                SIGAD ayuda a docentes a organizar cursos, estudiantes y
                asistencia con una experiencia moderna, rápida y totalmente
                enfocada en resultados.
              </p>
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
                display: 'block',
              }}
            />
          </div>
        </section>

        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div style={featuresHeaderStyles}>
              <p
                style={{
                  margin: 0,
                  color: '#9da3bf',
                  fontSize: '0.9rem',
                }}
              >
                Funciones principales
              </p>
              <h3
                style={{
                  margin: '6px 0 0',
                  fontSize: '1.25rem',
                  color: '#eef0ff',
                }}
              >
                Todo lo que necesitas para trabajar con tranquilidad.
              </h3>
            </div>
          </div>

          <div
            style={{
              ...featureGridStyles,
              ...(window.innerWidth < 760
                ? { gridTemplateColumns: '1fr' }
                : {}),
            }}
          >
            <div style={featureCardStyles}>
              <h4 style={featureTitleStyles}>Gestión de cursos</h4>
              <p style={featureTextStyles}>
                Crea, organiza y accede a tus cursos con una vista clara y
                centralizada.
              </p>
            </div>

            <div style={featureCardStyles}>
              <h4 style={featureTitleStyles}>Registro de asistencia</h4>
              <p style={featureTextStyles}>
                Controla la asistencia de estudiantes con seguimiento simple y
                visual.
              </p>
            </div>

            <div style={featureCardStyles}>
              <h4 style={featureTitleStyles}>Organización de estudiantes</h4>
              <p style={featureTextStyles}>
                Mantén a tus grupos y perfiles ordenados para acceso rápido.
              </p>
            </div>

            <div style={featureCardStyles}>
              <h4 style={featureTitleStyles}>
                Acceso en cualquier dispositivo
              </h4>
              <p style={featureTextStyles}>
                Funciona bien en escritorio y móvil para tener todo siempre
                disponible.
              </p>
            </div>
          </div>
        </section>

        <section style={finalSectionStyles}>
          <p
            style={{
              margin: 0,
              color: '#9da3bf',
              fontSize: '0.95rem',
            }}
          >
            Contacto:{' '}
            <a
              href="mailto:bensadoncelia@gmail.com"
              style={{
                color: '#e9d5ff',
                textDecoration: 'underline',
              }}
            >
              bensadoncelia@gmail.com
            </a>
          </p>
        </section>

        <footer style={footerStyles}>
          SIGAD • {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}

export default Landing;