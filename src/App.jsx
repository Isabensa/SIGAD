import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';
import './App.css';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import CourseDetail from './components/CourseDetail';
import AttendanceSheet from './components/AttendanceSheet';
import AdminDocentes from './components/AdminDocentes';
import Payments from './components/Payments';
import AdminPayments from './components/AdminPayments';
import { ChangePassword, ForgotPassword, ResetPassword } from './components/AccountAccess';
import TeacherProfile from './components/TeacherProfile';

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(pbUrl);

const pageStyles = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'radial-gradient(circle at top left, rgba(91, 45, 255, 0.35), transparent 26%), radial-gradient(circle at bottom right, rgba(255, 98, 177, 0.22), transparent 24%), #09090f',
  color: '#f7f7fb',
};

const cardStyles = {
  width: '100%',
  maxWidth: '420px',
  padding: '36px 30px',
  borderRadius: '28px',
  background: 'rgba(15, 18, 33, 0.95)',
  boxShadow: '0 24px 80px rgba(1, 8, 27, 0.45)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(18px)',
};

const formStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
  width: '100%'
};

const fieldStyles = {
  width: '100%',
  maxWidth: '380px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const inputStyles = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.05)',
  color: '#eef0ff',
  outline: 'none',
  fontSize: '0.98rem',
  boxSizing: 'border-box'
};

const labelStyles = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#adb0c7',
};

const buttonStyles = {
  width: '100%',
  maxWidth: '380px',
  marginTop: '8px',
  padding: '14px 0',
  borderRadius: '18px',
  border: 'none',
  color: '#fff',
  fontWeight: 700,
  letterSpacing: '0.02em',
  fontSize: '1rem',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #8d6bff 0%, #ff3d9b 100%)',
  boxShadow: '0 18px 32px rgba(143, 76, 255, 0.26)',
};

const headingStyles = {
  margin: 0,
  marginBottom: '18px',
  fontSize: '2rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const subtitleStyles = {
  margin: 0,
  marginBottom: '30px',
  color: '#8f97bd',
  fontSize: '0.95rem',
  lineHeight: 1.6,
};

const errorStyles = {
  width: '100%',
  maxWidth: '380px',
  padding: '12px 14px',
  borderRadius: '14px',
  background: 'rgba(255, 61, 155, 0.12)',
  border: '1px solid rgba(255, 61, 155, 0.35)',
  color: '#ff9fc9',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  boxSizing: 'border-box',
};

function LoginPage({ pb, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loggingIn) return;
    setLoginError('');
    setLoggingIn(true);

    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      const user = authData.record;

      if (user.activo === false) {
        pb.authStore.clear();
        setLoginError('Tu espacio está suspendido. Comunícate con la administración.');
        return;
      }

      const subscriptionStatus = user.suscripcionEstado;
      const subscriptionExpiration = user.suscripcionHasta
        ? new Date(user.suscripcionHasta).getTime()
        : 0;
      const hasCommercialAccess = subscriptionStatus === 'exento' || (
        subscriptionStatus === 'activo' && subscriptionExpiration >= Date.now()
      );

      if (!hasCommercialAccess) {
        const messages = {
          pendiente: 'Tu espacio todavía está pendiente de habilitación.',
          vencido: 'El alquiler de tu espacio está vencido.',
          suspendido: 'Tu espacio está suspendido.'
        };
        if (user.administrador === 'docente') {
          onAuthSuccess();
          navigate('/pagos');
          return;
        }
        pb.authStore.clear();
        setLoginError(messages[subscriptionStatus] || 'Tu espacio no tiene una suscripción vigente.');
        return;
      }

      onAuthSuccess();
      navigate('/dashboard');
    } catch {
      setLoginError('Correo o contraseña incorrectos.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <main style={pageStyles} className="auth-page">
      <section style={cardStyles} className="auth-card">
        <header>
          <p className="auth-eyebrow">Acceso docente</p>
          <h1 style={headingStyles}>SIGAD</h1>
          <p style={subtitleStyles}>Gestiona cursos, alumnos y asistencias desde un espacio simple y seguro.</p>
        </header>

        <form onSubmit={handleSubmit} style={formStyles}>
          <div style={fieldStyles}>
            <label htmlFor="email" style={labelStyles}>
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={inputStyles}
            />
          </div>

          <div style={fieldStyles}>
            <label htmlFor="password" style={labelStyles}>
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={inputStyles}
            />
          </div>

          {loginError && (
            <p style={errorStyles}>
              {loginError}
            </p>
          )}

          <button type="submit" style={buttonStyles} className="busy-button app-primary-button" disabled={loggingIn}>
            {loggingIn && <span className="button-spinner" aria-hidden="true" />}
            {loggingIn ? 'Ingresando...' : 'Ingresar'}
          </button>
          <button type="button" className="app-secondary-button" disabled={loggingIn} style={{ ...buttonStyles, marginTop: 0, background: 'rgba(255,255,255,0.07)', boxShadow: 'none' }} onClick={() => navigate('/recuperar-clave')}>
            Olvidé mi contraseña
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(pb.authStore.isValid);
  const [sessionStartedAt] = useState(() => Date.now());
  const currentUser = pb.authStore.model;
  const canUseCourses = currentUser?.suscripcionEstado === 'exento' || (
    currentUser?.suscripcionEstado === 'activo' &&
    currentUser?.suscripcionHasta &&
    new Date(currentUser.suscripcionHasta).getTime() >= sessionStartedAt
  );

  const logout = () => {
    pb.authStore.clear();
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing pb={pb} />} />

        <Route
          path="/login"
          element={<LoginPage pb={pb} onAuthSuccess={() => setIsLoggedIn(true)} />}
        />
        <Route path="/recuperar-clave" element={<ForgotPassword pb={pb} />} />
        <Route path="/reset-password" element={<ResetPassword pb={pb} />} />
        <Route path="/seguridad" element={isLoggedIn ? <ChangePassword pb={pb} logout={logout} /> : <Navigate replace to="/login" />} />
        <Route path="/perfil" element={isLoggedIn ? <TeacherProfile pb={pb} /> : <Navigate replace to="/login" />} />

        <Route
          path="/dashboard"
          element={isLoggedIn ? (canUseCourses ? <Dashboard pb={pb} logout={logout} /> : <Navigate replace to="/pagos" />) : <Navigate replace to="/login" />}
        />

        <Route
          path="/curso/:id"
          element={isLoggedIn ? (canUseCourses ? <CourseDetail logout={logout} /> : <Navigate replace to="/pagos" />) : <Navigate replace to="/login" />}
        />

        <Route
          path="/curso/:id/asistencia"
          element={isLoggedIn ? (canUseCourses ? <AttendanceSheet logout={logout} /> : <Navigate replace to="/pagos" />) : <Navigate replace to="/login" />}
        />

        <Route
          path="/admin/docentes"
          element={isLoggedIn ? <AdminDocentes pb={pb} logout={logout} /> : <Navigate replace to="/login" />}
        />
        <Route path="/pagos" element={isLoggedIn ? <Payments pb={pb} logout={logout} /> : <Navigate replace to="/login" />} />
        <Route path="/admin/pagos" element={isLoggedIn ? <AdminPayments pb={pb} /> : <Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
