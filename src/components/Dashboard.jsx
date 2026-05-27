import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getCourses, createCourse, deleteCourse } from '../services/courseService';

function Dashboard({ pb }) {
  const [showCourseInput, setShowCourseInput] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courses, setCourses] = useState([]);

  const navigate = useNavigate();

  const handleCreateCourse = () => {
    setShowCourseInput(true);
  };

  const fetchCourses = async () => {
    try {
      const coursesList = await getCourses(pb);
      setCourses(coursesList);
      console.log('cursos obtenidos', coursesList);
    } catch (error) {
      console.log('error al obtener cursos', error);
    }
  };

  useEffect(() => {
    const loadCourses = async () => {
      await fetchCourses();
    };

    loadCourses();
  }, []);

  const saveCourse = async () => {
    console.log('CLICK EN GUARDAR');

    if (!courseName.trim()) {
      console.log('nombre vacío');
      return;
    }

    try {
      const result = await createCourse(pb, {
        nombre: courseName,
        descripcion: ''
      });

      console.log('curso guardado', result);

      setCourseName('');
      setShowCourseInput(false);

      fetchCourses();

    } catch (error) {
      console.log('error al guardar curso', error);
    }
  };

  const handleDeleteCourse = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar curso?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteCourse(pb, id);
      await fetchCourses();

      await Swal.fire({
        title: 'Curso eliminado correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.log('error al eliminar curso', error);
    }
  };

  return (
    <main className="login-page">
      <div
        className="login-form"
        style={{
          width: '100%',
          maxWidth: '900px',
          minWidth: '320px',
          padding: '28px',
          boxSizing: 'border-box'
        }}
      >
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
            <div
              style={{
                maxHeight: '320px',
                overflowY: 'auto',
                scrollBehavior: 'smooth',
                paddingRight: '4px',
                marginTop: '12px'
              }}
            >
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {courses.map((course) => (
                  <li
                    key={course.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    <span
                      style={{
                        flex: '1 1 auto',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {course.nombre}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate(`/curso/${course.id}`)}>
                        Entrar
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)}>
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
