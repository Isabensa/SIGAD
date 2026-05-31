import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

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
  maxWidth: '1100px',
  padding: '32px',
  borderRadius: '28px',
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const topActionsWrapperStyles = {
  width: '100%',
  maxWidth: '1100px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '18px'
};

const headerStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
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

const rowActionsStyles = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  justifyContent: 'flex-start'
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

  const ITEMS_PER_PAGE = 7;
  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };
  const loadAlumnos = async () => {
    try {
      if (!pb?.authStore?.isValid) {
        return;
      }

      const alumnosList = await pb.collection('alumnos').getFullList({
        filter: `cursoId = "${id}"`,
        requestKey: null
      });

      setAlumnos(alumnosList);
    } catch (error) {
      console.log('error al cargar alumnos', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadCourse = async () => {
      try {
        if (!pb?.authStore?.isValid) {
          console.log('CourseDetail: auth not valid, skipping fetch');
          if (mounted) setLoading(false);
          return;
        }

        // include requestKey:null to avoid auto-cancellation by SDK
        const courseData = await pb.collection('cursos').getOne(id, { expand: '', requestKey: null });
        if (!mounted) return;
        setCourse(courseData);
        setName(courseData?.nombre || '');
        setDescription(courseData?.descripcion || '');
      } catch (error) {
        console.log('error al cargar curso', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (id) {
      loadCourse();
      loadAlumnos();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const createAlumno = async () => {
    if (!alumnoNombre.trim() || !alumnoDni.trim()) {
      console.log('Por favor complete nombre y dni del alumno');
      return;
    }

    try {
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
    } catch (error) {
      console.log('error al crear alumno', error);
    }
  };

  const deleteAlumno = async (alumnoId) => {
    try {
      await pb.collection('alumnos').delete(alumnoId, { requestKey: null });
      await loadAlumnos();
    } catch (error) {
      console.log('error al eliminar alumno', error);
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
    if (!editFormData.nombre.trim() || !editFormData.dni.trim()) {
      console.log('Por favor complete nombre y dni');
      return;
    }

    try {
      await pb.collection('alumnos').update(editingAlumnoId, {
        nombre: editFormData.nombre.trim(),
        dni: editFormData.dni.trim(),
        email: editFormData.email.trim()
      }, { requestKey: null });

      cancelEditAlumno();
      await loadAlumnos();
    } catch (error) {
      console.log('error al editar alumno', error);
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
      <main style={pageStyles}>
        <div style={cardStyles}>
          <h1 style={titleStyles}>Detalle del curso</h1>
          <p style={infoTextStyles}>Cargando...</p>
        </div>
      </main>
    );
  }

  const handleSave = async () => {
    try {
      const updatedCourse = await pb.collection('cursos').update(id, {
        nombre: name,
        descripcion: description
      }, { requestKey: null });
      setCourse(updatedCourse);
      setEditMode(false);
    } catch (error) {
      console.log('error al guardar cambios', error);
    }
  };

  return (
    <main style={pageStyles}>
      <div style={topActionsWrapperStyles}>
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
              <header style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
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
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ padding: '20px 22px', borderRadius: '18px', background: 'rgba(255, 182, 193, 0.08)', border: '1px solid rgba(255, 182, 193, 0.18)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: '0 0 10px', color: '#d7dcff', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.82rem', fontWeight: 700 }}>Nombre del curso</p>
                      <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#eef0ff', lineHeight: 1.2 }}>{course.nombre}</p>
                    </div>
                  </div>
                  <div style={{ padding: '20px 22px', borderRadius: '18px', background: 'rgba(255, 182, 193, 0.06)', border: '1px solid rgba(255, 182, 193, 0.12)' }}>
                    <p style={{ margin: '0 0 10px', color: '#d7dcff', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.82rem', fontWeight: 700 }}>Descripción del curso</p>
                    <p style={{ margin: 0, color: '#e8ebff', fontSize: '1rem', lineHeight: 1.7 }}>{course.descripcion || 'Sin descripción'}</p>
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
                  <button style={buttonStyles} type="button" onClick={handleSave}>
                    Guardar cambios
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
                  onClick={() => console.log('Ver asistencia del curso', id)}
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
                  <button style={buttonStyles} type="button" onClick={createAlumno}>
                    Guardar alumno
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
                    <button style={buttonStyles} type="button" onClick={saveEditAlumno}>
                      Guardar edición
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
                              >
                                Eliminar
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
