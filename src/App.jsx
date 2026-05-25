import { useState } from 'react';
import PocketBase from 'pocketbase';
import './App.css';

const pb = new PocketBase('http://127.0.0.1:8090');

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ NUEVO

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await pb.collection('users').authWithPassword(email, password);
      console.log('login correcto');
      setIsLoggedIn(true); // ✅ NUEVO
    } catch {
      console.log('error de login');
    }
  };

  // ✅ NUEVO: vista después del login
  if (isLoggedIn) {
    return (
      <div className="login-page">
        <h1>Bienvenido al sistema SIGAD</h1>
      </div>
    );
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>SIGAD</h1>

        <label htmlFor="email">Email</label>
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
  );
}

export default App;