import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const pageStyles = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'radial-gradient(circle at top left, rgba(91, 45, 255, 0.32), transparent 28%), radial-gradient(circle at bottom right, rgba(255, 66, 164, 0.22), transparent 26%), #07070e',
  color: '#eef0ff'
};

const cardStyles = {
  width: '100%',
  maxWidth: '620px',
  padding: '32px',
  borderRadius: '28px',
  background: 'rgba(15, 18, 33, 0.96)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 28px 62px rgba(0, 0, 0, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
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

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const courseData = await pb.collection('cursos').getOne(id);
        setCourse(courseData);
        setName(courseData?.nombre || '');
        setDescription(courseData?.descripcion || '');
      } catch (error) {
        console.log('error al cargar curso', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCourse();
    }
  }, [id]);

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
      });
      setCourse(updatedCourse);
      setEditMode(false);
    } catch (error) {
      console.log('error al guardar cambios', error);
    }
  };

  return (
    <main style={pageStyles}>
      <div style={cardStyles}>
        <div style={rowActionsStyles}>
          <button style={secondaryButtonStyles} type="button" onClick={() => navigate('/')}>
            Volver
          </button>
        </div>

        <header style={headerStyles}>
          <h1 style={titleStyles}>Detalle del curso</h1>
          <p style={subtitleStyles}>Revisa y edita los datos del curso con estilo consistente.</p>
        </header>

        {course ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {!editMode ? (
              <>
                <div>
                  <p style={{ ...labelStyles, marginBottom: '8px' }}>Nombre del curso</p>
                  <p style={infoTextStyles}>{course.nombre}</p>
                </div>
                <div>
                  <p style={{ ...labelStyles, marginBottom: '8px' }}>Descripción del curso</p>
                  <p style={infoTextStyles}>{course.descripcion || 'Sin descripción'}</p>
                </div>
                <button style={buttonStyles} type="button" onClick={() => setEditMode(true)}>
                  Editar
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        ) : (
          <p style={infoTextStyles}>No se encontró el curso.</p>
        )}
      </div>
    </main>
  );
}

export default CourseDetail;
