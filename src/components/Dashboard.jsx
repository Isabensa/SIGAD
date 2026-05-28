import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getCourses, createCourse, deleteCourse } from '../services/courseService';

const pageStyles = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'radial-gradient(circle at top left, rgba(91, 45, 255, 0.32), transparent 28%), radial-gradient(circle at bottom right, rgba(255, 66, 164, 0.22), transparent 26%), #07070e',
  color: '#eef0ff'
};

const panelStyles = {
  width: '100%',
  maxWidth: '960px',
  padding: '32px',
  borderRadius: '28px',
  background: 'rgba(15, 18, 33, 0.96)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 30px 70px rgba(0, 0, 0, 0.35)',
  display: 'flex',
  flexDirection: 'column',
  gap: '28px'
};

const titleStyles = {
  margin: 0,
  fontSize: '2rem',
  letterSpacing: '0.06em'
};

const subtitleStyles = {
  margin: '10px 0 0',
  color: '#9da3bf',
  fontSize: '0.95rem'
};

const rowStyles = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px'
};

const actionButtonStyles = {
  border: 'none',
  borderRadius: '18px',
  padding: '12px 22px',
  background: 'linear-gradient(135deg, #8d6bff 0%, #ff3d9b 100%)',
  color: '#ffffff',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  boxShadow: '0 18px 32px rgba(143, 76, 255, 0.22)'
};

const inputStyles = {
  width: '100%',
  maxWidth: '520px',
  padding: '14px 16px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#eef0ff',
  fontSize: '0.96rem',
  outline: 'none'
};

const sectionCardStyles = {
  borderRadius: '22px',
  padding: '24px',
  background: 'rgba(7, 10, 22, 0.92)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)'
};

const listStyles = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  display: 'grid',
  gap: '14px'
};

const itemStyles = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '20px 24px',
  borderRadius: '20px',
  background: 'rgba(18, 24, 51, 0.88)',
  border: '1px solid rgba(255,255,255,0.06)',
  transition: 'transform 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease'
};

const itemTitleStyles = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: '#eef0ff',
  flex: '1 1 240px',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const controlsStyles = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px'
};

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
    <main style={pageStyles}>
      <div style={panelStyles}>
        <div style={rowStyles}>
          <div>
            <h1 style={titleStyles}>Dashboard SIGAD</h1>
            <p style={subtitleStyles}>Bienvenido docente, gestiona tus cursos con una interfaz moderna.</p>
          </div>
          <button style={actionButtonStyles} type="button" onClick={handleCreateCourse}>
            Crear curso
          </button>
        </div>

        {showCourseInput && (
          <section style={sectionCardStyles}>
            <div style={rowStyles}>
              <input
                type="text"
                placeholder="Nombre del curso"
                value={courseName}
                onChange={(event) => setCourseName(event.target.value)}
                style={inputStyles}
              />
              <button style={actionButtonStyles} type="button" onClick={saveCourse}>
                Guardar curso
              </button>
            </div>
          </section>
        )}

        <section style={sectionCardStyles}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#eef0ff' }}>Mis cursos</h2>
              <p style={{ margin: '8px 0 0', color: '#8f97bd', fontSize: '0.92rem' }}>Accede rápidamente a tus cursos activos.</p>
            </div>
            <span style={{ color: '#d7dcff', fontSize: '0.95rem', minWidth: 'fit-content' }}>{courses.length} curso{courses.length === 1 ? '' : 's'} activos</span>
          </div>

          {courses.length === 0 ? (
            <p style={{ marginTop: '20px', color: '#d7dcff' }}>No hay cursos aún.</p>
          ) : (
            <ul style={listStyles}>
              {courses.map((course) => (
                <li key={course.id} className="dashboard-course-item" style={itemStyles}>
                  <span style={itemTitleStyles}>{course.nombre}</span>
                  <div style={controlsStyles}>
                    <button style={actionButtonStyles} type="button" onClick={() => navigate(`/curso/${course.id}`)}>
                      Entrar
                    </button>
                    <button style={actionButtonStyles} type="button" onClick={() => handleDeleteCourse(course.id)}>
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
