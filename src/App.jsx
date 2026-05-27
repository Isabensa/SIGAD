import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PocketBase from 'pocketbase';
import './App.css';
import Dashboard from './components/Dashboard';
import CourseDetail from './components/CourseDetail';

const pb = new PocketBase('http://127.0.0.1:8090');

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
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Dashboard pb={pb} />
            ) : (
              <main className="login-page">
                <form className="login-form" onSubmit={handleSubmit}>
                  <h1>SIGAD</h1>

                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />

                  <label htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />

                  <button type="submit">Ingresar</button>
                </form>
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