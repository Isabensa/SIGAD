import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';
import Swal from 'sweetalert2';
import { formatDayList, formatDayName } from '../utils/dayNames';

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(pbUrl);

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

const cardStyles = {
  width: '100%',
  maxWidth: '1200px',
  padding: '24px',
  borderRadius: '22px',
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const topActionsWrapperStyles = {
  width: '100%',
  maxWidth: '1200px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '18px'
};

const titleStyles = {
  margin: 0,
  fontSize: '2rem',
  letterSpacing: '0.06em'
};

const subtitleStyles = {
  margin: 0,
  color: '#9da3bf',
  fontSize: '0.95rem'
};

const buttonStyles = {
  border: 'none',
  borderRadius: '18px',
  padding: '12px 20px',
  background: 'linear-gradient(135deg, #8d6bff 0%, #ff3d9b 100%)',
  color: '#ffffff',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 18px 32px rgba(143, 76, 255, 0.22)'
};

const secondaryButtonStyles = {
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '16px',
  padding: '10px 16px',
  background: 'rgba(255,255,255,0.05)',
  color: '#c7d0ff',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: 'none'
};

const inputStyles = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#eef0ff',
  fontSize: '0.96rem',
  outline: 'none',
  marginTop: '8px'
};

const labelStyles = {
  display: 'block',
  color: '#b3b8d3',
  fontSize: '0.95rem',
  marginTop: '18px'
};

const infoTextStyles = {
  margin: '0 0 0.6rem',
  color: '#d2d8ff',
  fontSize: '1rem',
  lineHeight: 1.75
};

const normalizeDiasClase = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((dia) => dia.trim()).filter(Boolean);
  }

  return [];
};

function CourseDetail({ logout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [showAlumnoForm, setShowAlumnoForm] = useState(false);
  const [alumnoNombre, setAlumnoNombre] = useState('');
  const [alumnoDni, setAlumnoDni] = useState('');
  const [alumnoEmail, setAlumnoEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAlumnoId, setEditingAlumnoId] = useState(null);
  const [editFormData, setEditFormData] = useState({ nombre: '', dni: '', email: '' });
  const [diasClase, setDiasClase] = useState([]);
  const [busyAction, setBusyAction] = useState('');

  const ITEMS_PER_PAGE = 7;
  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };
  const fetchAlumnos = useCallback(async () => {
    if (!pb?.authStore?.isValid) {
      return [];
    }

    return await pb.collection('alumnos').getFullList({
      filter: `cursoId = "${id}"`,
      requestKey: null
    });
  }, [id]);

  const loadAlumnos = async () => {
    try {
      const alumnosList = await fetchAlumnos();
      setAlumnos(alumnosList);
    } catch (error) {
      await Swal.fire('No se pudieron cargar los alumnos', error?.response?.message || 'Intenta nuevamente.', 'error');
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        if (!pb?.authStore?.isValid) {
          if (mounted) {
            setLoading(false);
            await Swal.fire('La sesión venció', 'Vuelve a ingresar para continuar.', 'warning');
            navigate('/login');
          }
          return;
        }

        const [courseData, alumnosList] = await Promise.all([
          pb.collection('cursos').getOne(id, { expand: '', requestKey: null }),
          fetchAlumnos()
        ]);

        if (!mounted) return;

        setCourse(courseData);
        setName(courseData?.nombre || '');
        setDescription(courseData?.descripcion || '');
        setDiasClase(normalizeDiasClase(courseData?.diasClase));
        setAlumnos(alumnosList);
      } catch (error) {
        if (mounted) {
          await Swal.fire('No se pudo abrir el curso', error?.response?.message || 'El curso no está disponible o no tienes acceso.', 'error');
          navigate('/dashboard', { replace: true });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (id) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [id, fetchAlumnos, navigate]);

  const createAlumno = async () => {
    if (busyAction) return;
    if (!alumnoNombre.trim() || !alumnoDni.trim()) {
      await Swal.fire('Datos incompletos', 'Completa el nombre y el DNI del alumno.', 'warning');
      return;
    }

    try {
      setBusyAction('createStudent');
      await pb.collection('alumnos').create({
        nombre: alumnoNombre.trim(),
        dni: alumnoDni.trim(),
        email: alumnoEmail.trim(),
        cursoId: [id]
      }, { requestKey: null });

      setAlumnoNombre('');
      setAlumnoDni('');
      setAlumnoEmail('');
      setShowAlumnoForm(false);
      await loadAlumnos();
      await Swal.fire('Alumno agregado', 'El alumno quedó registrado en el curso.', 'success');
      setBusyAction('');
    } catch (error) {
      setBusyAction('');
      await Swal.fire('No se pudo agregar', error?.response?.data?.dni ? 'Ya existe un alumno con ese DNI en este curso.' : (error?.response?.message || 'Revisa los datos e intenta nuevamente.'), 'error');
    }
  };

  const deleteAlumno = async (alumnoId) => {
    if (busyAction) return;
    const confirmation = await Swal.fire({ title: '¿Eliminar alumno?', text: 'También se eliminarán sus asistencias asociadas.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar' });
    if (!confirmation.isConfirmed) return;
    try {
      setBusyAction(`deleteStudent:${alumnoId}`);
      await pb.collection('alumnos').delete(alumnoId, { requestKey: null });
      await loadAlumnos();
      await Swal.fire('Alumno eliminado', 'El registro fue eliminado correctamente.', 'success');
      setBusyAction('');
    } catch (error) {
      setBusyAction('');
      await Swal.fire('No se pudo eliminar', error?.response?.message || 'Intenta nuevamente.', 'error');
    }
  };

  const startEditAlumno = (alumno) => {
    setEditingAlumnoId(alumno.id);
    setEditFormData({
      nombre: alumno.nombre,
      dni: alumno.dni,
      email: alumno.email
    });
  };

  const cancelEditAlumno = () => {
    setEditingAlumnoId(null);
    setEditFormData({ nombre: '', dni: '', email: '' });
  };

  const saveEditAlumno = async () => {
    if (busyAction) return;
    if (!editFormData.nombre.trim() || !editFormData.dni.trim()) {
      await Swal.fire('Datos incompletos', 'Completa el nombre y el DNI del alumno.', 'warning');
      return;
    }

    try {
      setBusyAction('editStudent');
      await pb.collection('alumnos').update(editingAlumnoId, {
        nombre: editFormData.nombre.trim(),
        dni: editFormData.dni.trim(),
        email: editFormData.email.trim()
      }, { requestKey: null });

      cancelEditAlumno();
      await loadAlumnos();
      await Swal.fire('Alumno actualizado', 'Los cambios se guardaron correctamente.', 'success');
      setBusyAction('');
    } catch (error) {
      setBusyAction('');
      await Swal.fire('No se pudo actualizar', error?.response?.data?.dni ? 'Ya existe un alumno con ese DNI en el curso.' : (error?.response?.message || 'Revisa los datos.'), 'error');
    }
  };

  const getPaginatedAlumnos = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return alumnos.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(alumnos.length / ITEMS_PER_PAGE);
  };

  if (loading) {
    return (
      <main style={pageStyles} className="app-page">
        <div style={cardStyles}>
          <h1 style={titleStyles}>Detalle del curso</h1>
          <p style={infoTextStyles}>Cargando...</p>
        </div>
      </main>
    );
  }

  const handleSave = async () => {
    if (busyAction) return;
    if (!name.trim()) {
      await Swal.fire('Nombre requerido', 'El curso debe tener un nombre.', 'warning');
      return;
    }
    try {
      setBusyAction('course');
      const updatedCourse = await pb.collection('cursos').update(id, {
        nombre: name,
        descripcion: description,
        diasClase: diasClase
      }, { requestKey: null });
      setCourse(updatedCourse);
      setEditMode(false);
      await Swal.fire('Curso actualizado', 'Los cambios se guardaron correctamente.', 'success');
      setBusyAction('');
    } catch (error) {
      setBusyAction('');
      await Swal.fire('No se pudo actualizar el curso', error?.response?.message || 'Revisa los datos e intenta nuevamente.', 'error');
    }
  };

  const toggleDiaClase = (dia) => {
    setDiasClase((prev) =>
      prev.includes(dia)
        ? prev.filter((item) => item !== dia)
        : [...prev, dia]
    );
  };

  const diasDisponibles = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

  return (
    <main style={pageStyles} className="app-page course-page">
      <div className="mobile-page-nav" style={topActionsWrapperStyles}>
        <button className="topActionButton" type="button" onClick={() => navigate('/dashboard')}>
          Volver
        </button>
        <button className="topActionButton topActionButtonSecondary" type="button" onClick={handleLogout}>
          Salir del sistema
        </button>
      </div>
      <div style={cardStyles}>
        {course ? (
          <>
            <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(15, 18, 33, 0.96)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <header className="course-heading" style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ ...titleStyles, fontSize: '1.6rem', marginBottom: '8px' }}>Detalle del curso</h1>
                  <p style={subtitleStyles}>Revisa y edita los datos del curso.</p>
                </div>
                {!editMode && (
                  <button style={{ ...buttonStyles, padding: '10px 22px', fontSize: '0.95rem', whiteSpace: 'nowrap' }} type="button" onClick={() => setEditMode(true)}>
                    Editar curso
                  </button>
                )}
              </header>

              {!editMode ? (
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 760 ? '1fr' : 'repeat(3, 1fr)', gap: '16px', alignItems: 'start' }}>
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(141, 107, 255, 0.06)', border: '1px solid rgba(141, 107, 255, 0.12)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: '0 0 10px', color: '#d7dcff', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.78rem', fontWeight: 700 }}>Nombre del curso</p>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#eef0ff', lineHeight: 1.2 }}>{course.nombre}</p>
                    </div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(141, 107, 255, 0.04)', border: '1px solid rgba(141, 107, 255, 0.1)' }}>
                    <p style={{ margin: '0 0 10px', color: '#d7dcff', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.78rem', fontWeight: 700 }}>Descripción del curso</p>
                    <p style={{ margin: 0, color: '#e8ebff', fontSize: '0.95rem', lineHeight: 1.6 }}>{course.descripcion || 'Sin descripción'}</p>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(141, 107, 255, 0.04)', border: '1px solid rgba(141, 107, 255, 0.1)' }}>
                    <p style={{ margin: '0 0 10px', color: '#d7dcff', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.78rem', fontWeight: 700 }}>Días de clase</p>
                    <p style={{ margin: 0, color: '#e8ebff', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {normalizeDiasClase(course?.diasClase).length > 0
                        ? formatDayList(normalizeDiasClase(course?.diasClase))
                        : 'No configurados'}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={labelStyles}>
                    Nombre del curso
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      style={inputStyles}
                    />
                  </label>
                  <label style={labelStyles}>
                    Descripción del curso
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={4}
                      style={{
                        ...inputStyles,
                        minHeight: '120px',
                        resize: 'vertical'
                      }}
                    />
                  </label>
                  <div>
                    <p style={{ margin: '0 0 12px', color: '#d7dcff', fontSize: '0.95rem', fontWeight: 600 }}>Días de clase</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {diasDisponibles.map((dia) => (
                        <button
                          key={dia}
                          type="button"
                          onClick={() => toggleDiaClase(dia)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            border: diasClase.includes(dia)
                              ? '2px solid #8d6bff'
                              : '1px solid rgba(255,255,255,0.2)',
                            background: diasClase.includes(dia)
                              ? 'rgba(141, 107, 255, 0.25)'
                              : 'rgba(255,255,255,0.05)',
                            color: diasClase.includes(dia) ? '#eef0ff' : '#9da3bf',
                            fontWeight: diasClase.includes(dia) ? 600 : 400,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {formatDayName(dia)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="busy-button" style={buttonStyles} type="button" onClick={handleSave} disabled={Boolean(busyAction)}>
                    {busyAction === 'course' && <span className="button-spinner" aria-hidden="true" />}{busyAction === 'course' ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              )}
            </div>

            <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(15, 18, 33, 0.96)', border: '1px solid rgba(255, 182, 193, 0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#eef0ff', marginBottom: '8px' }}>Gestión de alumnos</h2>
                <p style={{ ...subtitleStyles, margin: 0 }}>Administra los alumnos registrados en el curso.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  style={buttonStyles}
                  type="button"
                  onClick={() => setShowAlumnoForm((prev) => !prev)}
                >
                  {showAlumnoForm ? 'Cerrar formulario' : 'Agregar alumno'}
                </button>
                <button
                  style={buttonStyles}
                  type="button"
                  onClick={() => navigate(`/curso/${id}/asistencia`)}
                >
                  Ver asistencia
                </button>
              </div>
            </div>

              {showAlumnoForm && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', marginBottom: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ margin: 0, color: '#d7dffa', fontWeight: 700 }}>Crear alumno</p>
                  <label style={labelStyles}>
                    Nombre
                    <input
                      type="text"
                      value={alumnoNombre}
                      onChange={(event) => setAlumnoNombre(event.target.value)}
                      style={inputStyles}
                    />
                  </label>
                  <label style={labelStyles}>
                    DNI
                    <input
                      type="text"
                      value={alumnoDni}
                      onChange={(event) => setAlumnoDni(event.target.value)}
                      style={inputStyles}
                    />
                  </label>
                  <label style={labelStyles}>
                    Email
                    <input
                      type="email"
                      value={alumnoEmail}
                      onChange={(event) => setAlumnoEmail(event.target.value)}
                      style={inputStyles}
                    />
                  </label>
                  <button className="busy-button" style={buttonStyles} type="button" onClick={createAlumno} disabled={Boolean(busyAction)}>
                    {busyAction === 'createStudent' && <span className="button-spinner" aria-hidden="true" />}{busyAction === 'createStudent' ? 'Guardando...' : 'Guardar alumno'}
                  </button>
                </div>
              )}

              {editingAlumnoId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', marginBottom: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ margin: 0, color: '#d7dffa', fontWeight: 700 }}>Editar alumno</p>
                  <label style={labelStyles}>
                    Nombre
                    <input
                      type="text"
                      value={editFormData.nombre}
                      onChange={(event) => setEditFormData({ ...editFormData, nombre: event.target.value })}
                      style={inputStyles}
                    />
                  </label>
                  <label style={labelStyles}>
                    DNI
                    <input
                      type="text"
                      value={editFormData.dni}
                      onChange={(event) => setEditFormData({ ...editFormData, dni: event.target.value })}
                      style={inputStyles}
                    />
                  </label>
                  <label style={labelStyles}>
                    Email
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(event) => setEditFormData({ ...editFormData, email: event.target.value })}
                      style={inputStyles}
                    />
                  </label>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button style={secondaryButtonStyles} type="button" onClick={cancelEditAlumno}>
                      Volver
                    </button>
                    <button className="busy-button" style={buttonStyles} type="button" onClick={saveEditAlumno} disabled={Boolean(busyAction)}>
                      {busyAction === 'editStudent' && <span className="button-spinner" aria-hidden="true" />}{busyAction === 'editStudent' ? 'Guardando...' : 'Guardar edición'}
                    </button>
                  </div>
                </div>
              ) : alumnos.length === 0 ? (
                <p style={infoTextStyles}>No hay alumnos registrados para este curso.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid rgba(255, 182, 193, 0.15)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.02)'
                  }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 182, 193, 0.12)', borderBottom: '1px solid rgba(255, 182, 193, 0.15)' }}>
                        <th style={{ padding: '14px 16px', textAlign: 'left', color: '#d7dcff', fontWeight: 700, fontSize: '0.95rem' }}>Nombre</th>
                        <th style={{ padding: '14px 16px', textAlign: 'left', color: '#d7dcff', fontWeight: 700, fontSize: '0.95rem' }}>DNI</th>
                        <th style={{ padding: '14px 16px', textAlign: 'left', color: '#d7dcff', fontWeight: 700, fontSize: '0.95rem' }}>Correo</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center', color: '#d7dcff', fontWeight: 700, fontSize: '0.95rem' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedAlumnos().map((alumno) => (
                        <tr key={alumno.id} style={{ borderBottom: '1px solid rgba(255, 182, 193, 0.1)', background: 'rgba(18, 24, 51, 0.6)' }}>
                          <td style={{ padding: '14px 16px', color: '#eef0ff', fontSize: '0.95rem' }}>{alumno.nombre}</td>
                          <td style={{ padding: '14px 16px', color: '#eef0ff', fontSize: '0.95rem' }}>{alumno.dni}</td>
                          <td style={{ padding: '14px 16px', color: '#d2d8ff', fontSize: '0.93rem' }}>{alumno.email || '-'}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                              <button
                                type="button"
                                style={{ ...secondaryButtonStyles, padding: '7px 12px', fontSize: '0.83rem' }}
                                onClick={() => startEditAlumno(alumno)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                style={{ ...secondaryButtonStyles, padding: '7px 12px', fontSize: '0.83rem', color: '#ff6b9d' }}
                                onClick={() => deleteAlumno(alumno.id)}
                                disabled={Boolean(busyAction)}
                              >
                                {busyAction === `deleteStudent:${alumno.id}` ? 'Eliminando...' : 'Eliminar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {getTotalPages() > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                      <button
                        type="button"
                        style={secondaryButtonStyles}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </button>
                      <span style={{ color: '#d7dcff', fontWeight: 600 }}>
                        Página {currentPage} de {getTotalPages()}
                      </span>
                      <button
                        type="button"
                        style={secondaryButtonStyles}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, getTotalPages()))}
                        disabled={currentPage === getTotalPages()}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(15, 18, 33, 0.96)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ ...infoTextStyles, marginTop: '16px' }}>No se encontró el curso.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default CourseDetail;
