import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getCourses, createCourse, deleteCourse } from '../services/courseService';

const pageStyles = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
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

const topActionsWrapperStyles = {
  width: '100%',
  maxWidth: '960px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '18px'
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

function Dashboard({ pb, logout }) {
  const [showCourseInput, setShowCourseInput] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [escuela, setEscuela] = useState('');
  const [anio, setAnio] = useState('');
  const [diasClase, setDiasClase] = useState('');
  const [courses, setCourses] = useState([]);

  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const handleCreateCourse = () => {
    setShowCourseInput(true);
  };

  const fetchCourses = async () => {
    try {
      // ensure we only fetch when auth is valid
      if (!pb?.authStore?.isValid) {
        console.log('fetchCourses: auth not valid, skipping');
        return;
      }

      const coursesList = await getCourses(pb);
      setCourses(coursesList);
      console.log('cursos obtenidos', coursesList);
    } catch (error) {
      console.log('error al obtener cursos', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadCourses = async () => {
      if (!mounted) return;
      try {
        if (!pb?.authStore?.isValid) {
          console.log('Dashboard mounted but auth not valid - skipping initial fetch');
          return;
        }

        const coursesList = await getCourses(pb);
        if (!mounted) return;
        setCourses(coursesList);
        console.log('cursos obtenidos', coursesList);
      } catch (e) {
        console.log('loadCourses error', e);
      }
    };

    loadCourses();

    return () => {
      mounted = false;
    };
  }, [pb]);

  const saveCourse = async () => {
    console.log('CLICK EN GUARDAR');

    // Validar campos obligatorios
    if (!courseName.trim() || !escuela.trim() || !anio.toString().trim()) {
      console.log('Por favor complete los campos: nombre, escuela y anio');
      return;
    }

    // Validar que el usuario esté autenticado
    if (!pb?.authStore?.model?.id) {
      console.error('Error: Usuario no autenticado. docenteId no disponible');
      return;
    }

    const payload = {
      nombre: courseName.trim(),
      descripcion: descripcion.trim(),
      escuela: escuela.trim(),
      anio: anio.toString().trim(),
      diasclase: diasClase.trim(),
      docenteId: pb.authStore.model.id
    };

    console.log('📤 Payload a enviar:', payload);
    console.log('🔐 docenteId:', pb.authStore.model.id);

    try {
      const result = await createCourse(pb, payload);
      console.log('✅ curso guardado', result);

      // limpiar formulario
      setCourseName('');
      setDescripcion('');
      setEscuela('');
      setAnio('');
      setDiasClase('');
      setShowCourseInput(false);

      await fetchCourses();
    } catch (error) {
      console.error('❌ error al guardar curso:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
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
      <div style={topActionsWrapperStyles}>
        <button className="topActionButton" type="button" onClick={handleGoBack}>
          Volver
        </button>
        <button className="topActionButton topActionButtonSecondary" type="button" onClick={handleLogout}>
          Salir del sistema
        </button>
      </div>
      <div style={panelStyles}>
        <div style={rowStyles}>
          <div>
            <h1 style={titleStyles}>Dashboard SIGAD</h1>
            <p style={subtitleStyles}>Bienvenido docente, gestiona tus cursos con una interfaz moderna.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button style={actionButtonStyles} type="button" onClick={handleCreateCourse}>
              Crear curso
            </button>
          </div>
        </div>

        {showCourseInput && (
          <section style={sectionCardStyles}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Nombre del curso"
                  value={courseName}
                  onChange={(event) => setCourseName(event.target.value)}
                  style={{ ...inputStyles, flex: '1 1 320px' }}
                />
                <input
                  type="text"
                  placeholder="Escuela"
                  value={escuela}
                  onChange={(event) => setEscuela(event.target.value)}
                  style={{ ...inputStyles, flex: '1 1 240px' }}
                />
                <input
                  type="text"
                  placeholder="Año"
                  value={anio}
                  onChange={(event) => setAnio(event.target.value)}
                  style={{ ...inputStyles, width: '120px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <textarea
                  placeholder="Descripción (opcional)"
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  style={{ ...inputStyles, minHeight: '84px', resize: 'vertical' }}
                />

                <input
                  type="text"
                  placeholder="Días de clase (ej: martes,jueves)"
                  value={diasClase}
                  onChange={(event) => setDiasClase(event.target.value)}
                  style={inputStyles}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button style={{ ...actionButtonStyles, background: 'rgba(255,255,255,0.06)', color: '#d7dcff', boxShadow: 'none', fontWeight:600 }} type="button" onClick={() => setShowCourseInput(false)}>
                  Cancelar
                </button>
                <button style={actionButtonStyles} type="button" onClick={saveCourse}>
                  Guardar curso
                </button>
              </div>
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

          <div style={{ marginTop: '20px' }}>
            {courses.length === 0 ? (
              <p style={{ color: '#d7dcff' }}>No hay cursos aún.</p>
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
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
