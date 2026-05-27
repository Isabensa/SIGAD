import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

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
      <main className="login-page">
        <div className="login-form">
          <h1>Detalle del curso</h1>
          <p>Cargando...</p>
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
    <main className="login-page">
      <div className="login-form">
        <button type="button" onClick={() => navigate('/')}>Volver</button>
        <h1>Detalle del curso</h1>
        {course ? (
          <>
            {!editMode ? (
              <>
                <p>Nombre del curso: {course.nombre}</p>
                <p>Descripción del curso: {course.descripcion}</p>
                <button type="button" onClick={() => setEditMode(true)}>
                  Editar
                </button>
              </>
            ) : (
              <>
                <label>
                  Nombre del curso:
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label>
                  Descripción del curso:
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                  />
                </label>
                <button type="button" onClick={handleSave}>
                  Guardar cambios
                </button>
              </>
            )}
          </>
        ) : (
          <p>No se encontró el curso.</p>
        )}
      </div>
    </main>
  );
}

export default CourseDetail;
