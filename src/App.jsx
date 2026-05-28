import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PocketBase from 'pocketbase';
import './App.css';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import CourseDetail from './components/CourseDetail';

const pb = new PocketBase('http://127.0.0.1:8090');

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

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await pb.collection('users').authWithPassword(email, password);
      console.log('login correcto');
      setIsLoggedIn(true);
    } catch {
      console.log('error de login');
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Dashboard pb={pb} />
            ) : (
              <main style={pageStyles}>
                <section style={cardStyles}>
                  <header>
                    <h1 style={headingStyles}>SIGAD</h1>
                    <p style={subtitleStyles}>Gestión Académica de Próxima Generación</p>
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

                    <button type="submit" style={buttonStyles}>
                      Ingresar
                    </button>
                  </form>
                </section>
              </main>
            )
          }
        />
        <Route path="/curso/:id" element={<CourseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
