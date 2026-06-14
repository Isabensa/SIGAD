import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getCourses, createCourse, archiveCourse, restoreCourse, permanentlyDeleteCourse } from '../services/courseService';
import { exportCourseReport } from '../services/courseReportService';
import { getSubscriptionExpiryNotice } from '../utils/subscription';

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
  const MAX_COURSES = 10;
  const [showCourseInput, setShowCourseInput] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [escuela, setEscuela] = useState('');
  const [anio, setAnio] = useState('');
  const [diasClase, setDiasClase] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [busyAction, setBusyAction] = useState('');

  const navigate = useNavigate();

  const adminValue = pb?.authStore?.model?.administrador || '';
  const normalizedAdminValue = adminValue.toString().trim().toLowerCase();

  const isAdmin =
    normalizedAdminValue === 'admin' ||
    normalizedAdminValue === 'administración';

  const activeCourses = courses.filter((course) => !course.archivado);
  const expiryNotice = getSubscriptionExpiryNotice(pb?.authStore?.model);
  const archivedCourses = courses.filter((course) => course.archivado);
  const ownCoursesCount = activeCourses.filter(
    (course) => course.docenteId === pb?.authStore?.model?.id
  ).length;

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
    if (ownCoursesCount >= MAX_COURSES) {
      Swal.fire({
        title: 'Límite de cursos alcanzado',
        text: 'Tu espacio permite administrar hasta 10 cursos.',
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    setShowCourseInput(true);
  };

  const handleAdminDocentes = () => {
    navigate('/admin/docentes');
  };

  const fetchCourses = async () => {
    try {
      if (!pb?.authStore?.isValid) {
        await Swal.fire('La sesión venció', 'Vuelve a ingresar para continuar.', 'warning');
        navigate('/login');
        return;
      }

      const coursesList = await getCourses(pb);
      setCourses(coursesList);
    } catch (error) {
      await Swal.fire('No se pudieron cargar los cursos', error?.response?.message || 'Revisa la conexión e intenta nuevamente.', 'error');
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadCourses = async () => {
      if (!mounted) return;

      try {
        if (!pb?.authStore?.isValid) {
          if (mounted) {
            await Swal.fire('La sesión venció', 'Vuelve a ingresar para continuar.', 'warning');
            navigate('/login');
          }
          return;
        }

        const coursesList = await getCourses(pb);

        if (!mounted) return;

        setCourses(coursesList);
      } catch (e) {
        if (mounted) await Swal.fire('No se pudieron cargar los cursos', e?.response?.message || 'Revisa la conexión e intenta nuevamente.', 'error');
      } finally {
        if (mounted) setLoadingCourses(false);
      }
    };

    loadCourses();

    return () => {
      mounted = false;
    };
  }, [navigate, pb]);

  const saveCourse = async () => {
    if (busyAction) return;
    if (!courseName.trim() || !escuela.trim() || !anio.toString().trim()) {
      await Swal.fire('Datos incompletos', 'Completa el nombre, la institución y el año.', 'warning');
      return;
    }

    if (!pb?.authStore?.model?.id) {
      await Swal.fire('Sesión no disponible', 'Vuelve a ingresar para crear el curso.', 'error');
      return;
    }

    const payload = {
      nombre: courseName.trim(),
      descripcion: descripcion.trim(),
      escuela: escuela.trim(),
      anio: anio.toString().trim(),
      diasClase: diasClase,
      docenteId: pb.authStore.model.id
    };

    try {
      setBusyAction('create');
      await createCourse(pb, payload);

      setCourseName('');
      setDescripcion('');
      setEscuela('');
      setAnio('');
      setDiasClase([]);
      setShowCourseInput(false);

      await fetchCourses();
      await Swal.fire('Curso creado', 'El curso quedó disponible en tu panel.', 'success');
    } catch (error) {
      const reachedCourseLimit =
        error?.message?.toLowerCase().includes('límite de 10 cursos') ||
        error?.response?.message?.toLowerCase().includes('límite de 10 cursos');

      await Swal.fire({
        title: reachedCourseLimit ? 'Límite de cursos alcanzado' : 'No se pudo guardar el curso',
        text: reachedCourseLimit
          ? 'Tu espacio permite administrar hasta 10 cursos.'
          : 'Revisa los datos e intenta nuevamente.',
        icon: reachedCourseLimit ? 'info' : 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setBusyAction('');
    }
  };

  const handleArchiveCourse = async (course) => {
    if (busyAction) return;
    const result = await Swal.fire({
      title: '¿Exportar y archivar curso?',
      text: 'Se descargará un informe completo antes de liberar el cupo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Exportar y archivar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setBusyAction(`archive:${course.id}`);
      const report = await exportCourseReport(pb, course);
      await archiveCourse(pb, course.id);
      await fetchCourses();

      await Swal.fire({
        title: 'Curso archivado',
        text: `Informe generado con ${report.students} alumnos y ${report.attendances} asistencias.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      await Swal.fire('No se pudo archivar', error?.response?.message || 'No se pudo generar el informe o actualizar el curso. El curso no fue modificado.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  const handleRestoreCourse = async (course) => {
    if (busyAction) return;
    const isOwnCourse = course.docenteId === pb?.authStore?.model?.id;
    if (isOwnCourse && ownCoursesCount >= MAX_COURSES) {
      await Swal.fire('Sin cupo disponible', 'Archiva otro curso antes de restaurar este.', 'info');
      return;
    }

    try {
      setBusyAction(`restore:${course.id}`);
      await restoreCourse(pb, course.id);
      await fetchCourses();
      await Swal.fire('Curso restaurado', 'El curso volvió a la lista activa.', 'success');
    } catch (error) {
      await Swal.fire('No se pudo restaurar', error?.response?.message || 'Verifica que el docente tenga un cupo disponible e intenta nuevamente.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  const handlePermanentDelete = async (course) => {
    if (busyAction) return;
    const result = await Swal.fire({
      title: '¿Eliminar definitivamente?',
      text: 'Se eliminarán el curso, sus alumnos y todas sus asistencias.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Eliminar definitivamente',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;

    try {
      setBusyAction(`delete:${course.id}`);
      await exportCourseReport(pb, course);
      await permanentlyDeleteCourse(pb, course.id);
      await fetchCourses();
      await Swal.fire('Curso eliminado', 'El informe fue exportado antes de borrar los datos.', 'success');
    } catch (error) {
      await Swal.fire('No se pudo eliminar', error?.response?.message || 'El curso no fue eliminado. Verifica la conexión e intenta nuevamente.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  return (
    <main style={pageStyles} className="app-page dashboard-page">
      <div style={topActionsWrapperStyles}>
        <button className="topActionButton" type="button" onClick={handleGoBack}>
          Volver
        </button>

        <button className="topActionButton topActionButtonSecondary" type="button" onClick={handleLogout}>
          Salir del sistema
        </button>
      </div>

      <div style={panelStyles} className="app-shell">
        <div style={rowStyles}>
          <div>
            <h1 style={titleStyles}>Dashboard SIGAD</h1>
            <p style={subtitleStyles}>Bienvenido docente, gestiona tus cursos con una interfaz moderna.</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {isAdmin && (
              <>
                <button style={actionButtonStyles} type="button" onClick={handleAdminDocentes}>Administrar docentes</button>
                <button style={actionButtonStyles} type="button" onClick={() => navigate('/admin/pagos')}>Revisar pagos</button>
              </>
            )}

            {!isAdmin && <button style={actionButtonStyles} type="button" onClick={() => navigate('/pagos')}>Pagos y suscripción</button>}

            <button style={actionButtonStyles} type="button" onClick={() => navigate('/perfil')} disabled={Boolean(busyAction)}>Mi perfil</button>
            <button style={actionButtonStyles} type="button" onClick={() => navigate('/seguridad')}>Cambiar contraseña</button>

            <button style={actionButtonStyles} type="button" onClick={handleCreateCourse}>
              Crear curso
            </button>
          </div>
        </div>

        {expiryNotice && (
          <section className="subscription-expiry-notice" role="status" aria-live="polite">
            <div>
              <strong>Tu suscripción vence pronto</strong>
              <p>
                Quedan {expiryNotice.daysRemaining} {expiryNotice.daysRemaining === 1 ? 'día' : 'días'}.
                {' '}El vencimiento es el {expiryNotice.expiration.toLocaleDateString('es-AR')}.
              </p>
            </div>
            <button type="button" onClick={() => navigate('/pagos')}>Informar pago</button>
          </section>
        )}

        {showCourseInput && (
          <section style={sectionCardStyles}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="course-form-grid course-form-grid-main" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 0.8fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 8px', color: '#d7dcff', fontSize: '0.9rem', fontWeight: 600 }}>
                    Nombre del curso
                  </p>
                  <input
                    type="text"
                    placeholder="Nombre del curso"
                    value={courseName}
                    onChange={(event) => setCourseName(event.target.value)}
                    style={{ ...inputStyles, maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <p style={{ margin: '0 0 8px', color: '#d7dcff', fontSize: '0.9rem', fontWeight: 600 }}>
                    Escuela
                  </p>
                  <input
                    type="text"
                    placeholder="Escuela"
                    value={escuela}
                    onChange={(event) => setEscuela(event.target.value)}
                    style={{ ...inputStyles, maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <p style={{ margin: '0 0 8px', color: '#d7dcff', fontSize: '0.9rem', fontWeight: 600 }}>
                    Año
                  </p>
                  <input
                    type="text"
                    placeholder="Año"
                    value={anio}
                    onChange={(event) => setAnio(event.target.value)}
                    style={{ ...inputStyles, maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div className="course-form-grid course-form-grid-details" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <p style={{ margin: '0 0 8px', color: '#d7dcff', fontSize: '0.9rem', fontWeight: 600 }}>
                    Descripción (opcional)
                  </p>
                  <textarea
                    placeholder="Breve descripción del curso..."
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.target.value)}
                    style={{
                      ...inputStyles,
                      minHeight: '110px',
                      resize: 'vertical',
                      maxWidth: '100%',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <p style={{ margin: '0 0 12px', color: '#d7dcff', fontSize: '0.9rem', fontWeight: 600 }}>
                    Días de clase
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'].map((dia) => (
                      <button
                        key={dia}
                        type="button"
                        onClick={() =>
                          setDiasClase((prev) =>
                            prev.includes(dia)
                              ? prev.filter((item) => item !== dia)
                              : [...prev, dia]
                          )
                        }
                        style={{
                          padding: '10px 14px',
                          borderRadius: '14px',
                          border: diasClase.includes(dia)
                            ? '2px solid #8d6bff'
                            : '1px solid rgba(255,255,255,0.12)',
                          background: diasClase.includes(dia)
                            ? 'rgba(141, 107, 255, 0.25)'
                            : 'rgba(255,255,255,0.05)',
                          color: diasClase.includes(dia) ? '#eef0ff' : '#9da3bf',
                          fontWeight: diasClase.includes(dia) ? 700 : 500,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {dia}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  style={{
                    ...actionButtonStyles,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#d7dcff',
                    boxShadow: 'none',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  type="button"
                  onClick={() => setShowCourseInput(false)}
                >
                  Cancelar
                </button>

                <button className="busy-button" style={actionButtonStyles} type="button" onClick={saveCourse} disabled={Boolean(busyAction)}>
                  {busyAction === 'create' && <span className="button-spinner" aria-hidden="true" />}{busyAction === 'create' ? 'Guardando...' : 'Guardar curso'}
                </button>
              </div>
            </div>
          </section>
        )}

        <section style={sectionCardStyles}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#eef0ff' }}>
                Mis cursos
              </h2>
              <p style={{ margin: '8px 0 0', color: '#8f97bd', fontSize: '0.92rem' }}>
                Accede rápidamente a tus cursos activos.
              </p>
            </div>

            <span style={{ color: '#d7dcff', fontSize: '0.95rem', minWidth: 'fit-content' }}>
              {ownCoursesCount} de {MAX_COURSES} cursos propios utilizados
            </span>
          </div>

          <div style={{ marginTop: '20px' }}>
            {loadingCourses ? (
              <p style={subtitleStyles}>Cargando cursos...</p>
            ) : activeCourses.length === 0 ? (
              <p style={{ color: '#d7dcff' }}>No hay cursos aún.</p>
            ) : (
              <ul style={listStyles}>
                {activeCourses.map((course) => (
                  <li key={course.id} className="dashboard-course-item" style={itemStyles}>
                    <span style={itemTitleStyles}>{course.nombre}</span>

                    <div style={controlsStyles}>
                      <button style={actionButtonStyles} type="button" onClick={() => navigate(`/curso/${course.id}`)}>
                        Entrar
                      </button>

                      <button className="busy-button" style={actionButtonStyles} type="button" disabled={Boolean(busyAction)} onClick={() => handleArchiveCourse(course)}>
                        {busyAction === `archive:${course.id}` && <span className="button-spinner" aria-hidden="true" />}{busyAction === `archive:${course.id}` ? 'Archivando...' : 'Archivar'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section style={sectionCardStyles}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#eef0ff' }}>Cursos archivados</h2>
            <p style={{ margin: '8px 0 0', color: '#8f97bd', fontSize: '0.92rem' }}>
              No ocupan cupo y conservan alumnos y asistencias.
            </p>
          </div>
          <div style={{ marginTop: '20px' }}>
            {archivedCourses.length === 0 ? (
              <p style={{ color: '#d7dcff' }}>No hay cursos archivados.</p>
            ) : (
              <ul style={listStyles}>
                {archivedCourses.map((course) => (
                  <li key={course.id} style={{ ...itemStyles, opacity: 0.82 }}>
                    <span style={itemTitleStyles}>{course.nombre}</span>
                    <div style={controlsStyles}>
                      <button className="busy-button" style={actionButtonStyles} type="button" disabled={Boolean(busyAction)} onClick={() => handleRestoreCourse(course)}>
                        {busyAction === `restore:${course.id}` && <span className="button-spinner" aria-hidden="true" />}{busyAction === `restore:${course.id}` ? 'Restaurando...' : 'Restaurar'}
                      </button>
                      {isAdmin && (
                        <button className="busy-button" style={{ ...actionButtonStyles, background: '#8b1e3f' }} type="button" disabled={Boolean(busyAction)} onClick={() => handlePermanentDelete(course)}>
                          {busyAction === `delete:${course.id}` && <span className="button-spinner" aria-hidden="true" />}{busyAction === `delete:${course.id}` ? 'Eliminando...' : 'Eliminar definitivamente'}
                        </button>
                      )}
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
