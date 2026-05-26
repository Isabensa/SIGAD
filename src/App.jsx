import { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import './App.css';

const pb = new PocketBase('http://127.0.0.1:8090');

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCourseInput, setShowCourseInput] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courses, setCourses] = useState([]);

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

  const handleCreateCourse = () => {
    setShowCourseInput(true);
  };

  const fetchCourses = async () => {
    try {
      const coursesList = await pb.collection('cursos').getFullList();
      setCourses(coursesList);
      console.log('cursos obtenidos', coursesList);
    } catch (error) {
      console.log('error al obtener cursos', error);
    }
  };

  useEffect(() => {
  if (!isLoggedIn) return;

  const loadCourses = async () => {
    await fetchCourses();
  };

  loadCourses();
}, [isLoggedIn]);

  // 👉 FUNCIÓN PARA GUARDAR
  const saveCourse = async () => {
    console.log("CLICK EN GUARDAR"); // 👈 DEBUG

    // 👉 VALIDACIÓN
    if (!courseName.trim()) {
      console.log("nombre vacío");
      return;
    }

    try {
      const result = await pb.collection('cursos').create({
        nombre: courseName,
        descripcion: ''
      });

      console.log('curso guardado', result);

      setCourseName('');
      setShowCourseInput(false);

      // 👉 ACTUALIZAR LISTA DE CURSOS
      fetchCourses();

    } catch (error) {
      console.log('error al guardar curso', error);
    }
  };

  // 👉 DASHBOARD
  if (isLoggedIn) {
    return (
      <main className="login-page">
        <div className="login-form">
          <h1 style={{ fontSize: '28px', lineHeight: '1.2' }}>
            Dashboard SIGAD
          </h1>

          <p style={{ marginTop: '10px' }}>Bienvenido docente</p>

          <button onClick={handleCreateCourse}>Crear curso</button>

          {showCourseInput && (
            <div style={{ marginTop: '20px' }}>
              <input
                type="text"
                placeholder="Nombre del curso"
                value={courseName}
                onChange={(event) => setCourseName(event.target.value)}
              />

              <button
                onClick={saveCourse}
                style={{ marginTop: '10px' }}
              >
                Guardar curso
              </button>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <h3>Mis cursos</h3>
            {courses.length === 0 ? (
              <p>No hay cursos creados aún</p>
            ) : (
              <ul>
                {courses.map((course) => (
                  <li key={course.id}>{course.nombre}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    );
  }

  // 👉 LOGIN (NO MODIFICADO)
  return (
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
  );
}

export default App;