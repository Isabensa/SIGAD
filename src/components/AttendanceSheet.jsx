import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PocketBase from 'pocketbase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

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
  maxWidth: '1100px',
  padding: '32px',
  borderRadius: '28px',
  background: 'rgba(15, 18, 33, 0.96)',
  border: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const topActionsWrapperStyles = {
  width: '100%',
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

const infoBoxStyles = {
  padding: '20px 22px',
  borderRadius: '18px',
  background: 'rgba(255, 182, 193, 0.08)',
  border: '1px solid rgba(255, 182, 193, 0.18)',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)'
};

const infoLabelStyles = {
  margin: '0 0 10px',
  color: '#d7dcff',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '0.82rem',
  fontWeight: 700
};

const infoValueStyles = {
  margin: 0,
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#eef0ff',
  lineHeight: 1.4
};

const placeholderTextStyles = {
  margin: 0,
  color: '#9da3bf',
  fontSize: '1rem',
  lineHeight: 1.7,
  fontStyle: 'italic'
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

const actionButtonStyles = {
  border: 'none',
  borderRadius: '20px',
  padding: '14px 28px',
  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)',
  color: '#ffffff',
  fontWeight: 600,
  cursor: 'pointer',
  boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
  fontSize: '0.95rem',
  transition: 'all 0.3s ease'
};

const summaryStyles = {
  display: 'flex',
  gap: '24px',
  flexWrap: 'wrap',
  padding: '16px 20px',
  borderRadius: '16px',
  background: 'rgba(255, 182, 193, 0.06)',
  border: '1px solid rgba(255, 182, 193, 0.12)'
};

const summaryItemStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const summaryLabelStyles = {
  fontSize: '0.8rem',
  color: '#9da3bf',
  textTransform: 'uppercase',
  letterSpacing: '0.06em'
};

const summaryValueStyles = {
  fontSize: '1.2rem',
  fontWeight: 700,
  color: '#eef0ff'
};

const tableContainerStyles = {
  overflowX: 'auto',
  borderRadius: '16px',
  border: '1px solid rgba(255, 182, 193, 0.15)'
};

const tableStyles = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: '600px'
};

const thStyles = {
  padding: '14px 12px',
  textAlign: 'center',
  color: '#d7dcff',
  fontWeight: 700,
  fontSize: '0.85rem',
  background: 'rgba(255, 182, 193, 0.12)',
  borderBottom: '1px solid rgba(255, 182, 193, 0.15)',
  whiteSpace: 'nowrap'
};

const tdStyles = {
  padding: '12px 10px',
  textAlign: 'center',
  color: '#eef0ff',
  fontSize: '0.9rem',
  borderBottom: '1px solid rgba(255, 182, 193, 0.08)',
  background: 'rgba(18, 24, 51, 0.4)'
};

const monthSelectStyles = {
  padding: '14px 20px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.05)',
  color: '#eef0ff',
  fontSize: '1rem',
  outline: 'none',
  cursor: 'pointer'
};

// Convierte día de la semana en string a número de JavaScript
const diaAnumero = (dia) => {
  const mapeo = {
    'domingo': 0,
    'lunes': 1,
    'martes': 2,
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sabado': 6
  };
  return mapeo[dia.toLowerCase()] ?? -1;
};

// Normaliza diasClase: convierte string a array si es necesario
const normalizeDiasClase = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((dia) => dia.trim()).filter(Boolean);
  }

  return [];
};

// Genera las fechas del mes que coinciden con los días de clase
const generarFechasDelMes = (mesStr, diasClase) => {
  const [anio, mes] = mesStr.split('-').map(Number);
  const diasSemana = diasClase.map(d => diaAnumero(d)).filter(n => n >= 0);
  const fechas = [];
  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  const diasEnMes = new Date(anio, mes, 0).getDate();
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const fecha = new Date(anio, mes - 1, dia);
    if (diasSemana.includes(fecha.getDay())) {
      fechas.push({
        fechaISO: `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
        etiqueta: `${nombresDias[fecha.getDay()]} ${String(dia).padStart(2, '0')}`
      });
    }
  }

  return fechas;
};

// Mapeo inverso: estados de PocketBase a estado local
const estadoDelPocketBase = {
  'Presente': 'presente',
  'Ausente': 'ausente',
  'Tardanza': 'tardanza'
};

// Calcula el rango de fechas del mes para filtrar
const getMonthDateRange = (mesStr) => {
  const [year, month] = mesStr.split('-').map(Number);
  const startDate = `${mesStr}-01`;
  const nextMonth = month === 12
    ? `${year + 1}-01`
    : `${year}-${String(month + 1).padStart(2, '0')}`;
  const endDate = `${nextMonth}-01`;
  return { startDate, endDate };
};

function AttendanceSheet({ logout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [asistencias, setAsistencias] = useState({});
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  
  // Obtener mes actual en formato YYYY-MM
  const hoy = new Date();
  const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
  };

  const marcarAsistencia = (alumnoId, fechaISO, estado) => {
    setAsistencias((prev) => ({
      ...prev,
      [`${alumnoId}_${fechaISO}`]: estado
    }));
  };

  const calcularTotalesAlumno = (alumnoId) => {
    let p = 0, a = 0, t = 0;
    fechasDelMes.forEach((fecha) => {
      const estado = asistencias[`${alumnoId}_${fecha.fechaISO}`];
      if (estado === 'presente') p++;
      else if (estado === 'ausente') a++;
      else if (estado === 'tardanza') t++;
    });
    return { p, a, t };
  };

  const calcularEstadisticas = (alumnoId) => {
    const { p, a, t } = calcularTotalesAlumno(alumnoId);
    const totalClases = fechasDelMes.length;
    const porcentaje = totalClases > 0 
      ? ((p + t * 0.5) / totalClases * 100).toFixed(1)
      : 0;
    return { p, a, t, porcentaje };
  };

  const exportarPDF = () => {
    try {
      const doc = new jsPDF('landscape');
      let yPosition = 15;

      doc.setFontSize(18);
      doc.text('SIGAD - Planilla de asistencia', 15, yPosition);
      yPosition += 12;

      doc.setFontSize(11);
      doc.text(`Curso: ${course.nombre}`, 15, yPosition);
      yPosition += 6;
      doc.text(`Mes: ${mesSeleccionado}`, 15, yPosition);
      yPosition += 6;
      doc.text(`Días de clase: ${diasClase.join(', ')}`, 15, yPosition);
      yPosition += 6;
      doc.text(`Total de clases del mes: ${fechasDelMes.length}`, 15, yPosition);
      yPosition += 10;

      const asistenciaData = alumnos.map((alumno, index) => {
        const row = [
          index + 1,
          alumno.nombre,
          alumno.dni || '-'
        ];

        fechasDelMes.forEach((fecha) => {
          const clave = `${alumno.id}_${fecha.fechaISO}`;
          const estado = asistencias[clave];
          if (estado === 'presente') row.push('P');
          else if (estado === 'ausente') row.push('A');
          else if (estado === 'tardanza') row.push('T');
          else row.push('-');
        });

        const totales = calcularTotalesAlumno(alumno.id);
        row.push(totales.p);
        row.push(totales.a);
        row.push(totales.t);

        return row;
      });

      const asistenciaHeaders = [
        'Nº',
        'Alumno',
        'DNI',
        ...fechasDelMes.map((fecha) => fecha.etiqueta),
        'P',
        'A',
        'T'
      ];

      autoTable(doc, {
        head: [asistenciaHeaders],
        body: asistenciaData,
        startY: yPosition,
        margin: { left: 15, right: 15 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('Estadísticas', 15, yPosition);
      yPosition += 8;

      const statsData = alumnos.map((alumno, index) => {
        const stats = calcularEstadisticas(alumno.id);
        return [
          index + 1,
          alumno.nombre,
          alumno.dni || '-',
          stats.p,
          stats.a,
          stats.t,
          fechasDelMes.length,
          `${stats.porcentaje}%`
        ];
      });

      const statsHeaders = ['Nº', 'Alumno', 'DNI', 'Presentes', 'Ausentes', 'Tardanzas', 'Total de clases', '% Asistencia'];

      autoTable(doc, {
        head: [statsHeaders],
        body: statsData,
        startY: yPosition,
        margin: { left: 15, right: 15 }
      });

      const fileName = `Planilla_${course.nombre}_${mesSeleccionado}.pdf`;
      doc.save(fileName);
    } catch (error) {
      Swal.fire('No se pudo generar el informe', error?.message || 'Intenta nuevamente.', 'error');
    }
  };

  const getNextDateISO = (fechaISO) => {
    const fecha = new Date(`${fechaISO}T00:00:00`);
    fecha.setDate(fecha.getDate() + 1);
    return fecha.toISOString().slice(0, 10);
  };

  const estadoParaPocketBase = {
    presente: 'Presente',
    ausente: 'Ausente',
    tardanza: 'Tardanza'
  };

  const handleSaveAsistencias = async () => {
    if (saving || loadingAttendance) return;
    // Recolectar asistencias marcadas
    const asistenciasAGuardar = [];
    
    alumnos.forEach((alumno) => {
      fechasDelMes.forEach((fecha) => {
        const clave = `${alumno.id}_${fecha.fechaISO}`;
        const estado = asistencias[clave];
        if (estado) {  // Solo si está marcado
          asistenciasAGuardar.push({
            alumnoId: alumno.id,
            fecha: fecha.fechaISO,
            estado
          });
        }
      });
    });

    // Validar que hay algo para guardar
    if (asistenciasAGuardar.length === 0) {
      await Swal.fire('Sin asistencias marcadas', 'Marca al menos una asistencia antes de guardar.', 'info');
      return;
    }

    try {
      setSaving(true);
      // Procesar cada asistencia (crear o actualizar)
      for (const asistencia of asistenciasAGuardar) {
        const estadoConvertido = estadoParaPocketBase[asistencia.estado];

        // Validar que el estado exista en PocketBase
        if (!estadoConvertido) {
          continue;
        }

        // Buscar si ya existe un registro para este alumno/fecha/curso
        // Usar rango de fecha para evitar problemas con hora interna
        const siguienteFecha = getNextDateISO(asistencia.fecha);
        const existentes = await pb.collection('asistencias').getFullList({
          filter: `cursoId = "${id}" && alumnoId = "${asistencia.alumnoId}" && fecha >= "${asistencia.fecha}" && fecha < "${siguienteFecha}"`,
          requestKey: null
        });

        if (existentes.length > 0) {
          // Actualizar registro existente
          await pb.collection('asistencias').update(existentes[0].id, {
            estado: estadoConvertido
          }, { requestKey: null });
        } else {
          // Crear registro nuevo
          await pb.collection('asistencias').create({
            cursoId: id,
            alumnoId: asistencia.alumnoId,
            fecha: asistencia.fecha,
            estado: estadoConvertido
          }, { requestKey: null });
        }
      }

      await Swal.fire('Asistencias guardadas', `Se guardaron ${asistenciasAGuardar.length} registros correctamente.`, 'success');
    } catch (error) {
      await Swal.fire('No se pudieron guardar las asistencias', error?.response?.message || 'Algunos registros pueden no haberse guardado. Revisa la conexión e intenta nuevamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingAttendance(true);
        const [courseData, alumnosList] = await Promise.all([
          pb.collection('cursos').getOne(id, { requestKey: null }),
          pb.collection('alumnos').getFullList({
            filter: `cursoId = "${id}"`,
            sort: 'nombre',
            requestKey: null
          })
        ]);
        setCourse(courseData);
        setAlumnos(alumnosList);
      } catch (error) {
        await Swal.fire('No se pudo cargar la planilla', error?.response?.message || 'El curso no está disponible o no tienes acceso.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // Cargar asistencias existentes cuando cambien id, alumnos o mes
  useEffect(() => {
    const loadExistingAsistencias = async () => {
      if (!id || !alumnos.length) return;

      try {
        const { startDate, endDate } = getMonthDateRange(mesSeleccionado);
        const existingAsistencias = await pb.collection('asistencias').getFullList({
          filter: `cursoId = "${id}" && fecha >= "${startDate}" && fecha < "${endDate}"`,
          requestKey: null
        });

        const nuevasAsistencias = {};
        existingAsistencias.forEach((asistencia) => {
          const fechaISO = asistencia.fecha?.slice(0, 10);
          const estado = estadoDelPocketBase[asistencia.estado];

          if (fechaISO && estado) {
            const clave = `${asistencia.alumnoId}_${fechaISO}`;
            nuevasAsistencias[clave] = estado;
          }
        });

        setAsistencias(nuevasAsistencias);
      } catch (error) {
        await Swal.fire('No se pudieron cargar las asistencias', error?.response?.message || 'Intenta nuevamente.', 'error');
      } finally {
        setLoadingAttendance(false);
      }
    };

    loadExistingAsistencias();
  }, [id, alumnos.length, mesSeleccionado]);

  // Normalizar diasClase para manejar tanto arrays como strings
  const diasClase = normalizeDiasClase(course?.diasClase);
  const fechasDelMes = generarFechasDelMes(mesSeleccionado, diasClase);
  const totalCeldas = alumnos.length * fechasDelMes.length;

  if (loading) {
    return (
      <main style={pageStyles} className="app-page">
        <div style={cardStyles}>
          <h1 style={titleStyles}>Planilla de asistencia</h1>
          <p style={placeholderTextStyles}>Cargando...</p>
        </div>
      </main>
    );
  }

  // Si el curso no tiene días de clase configurados
  if (!course || !diasClase.length) {
    return (
      <main style={pageStyles} className="app-page">
        <div style={topActionsWrapperStyles}>
          <button 
            style={secondaryButtonStyles}
            type="button" 
            onClick={() => navigate(`/curso/${id}`)}
          >
            Volver al curso
          </button>
          <button 
            style={secondaryButtonStyles}
            type="button" 
            onClick={handleLogout}
          >
            Salir del sistema
          </button>
        </div>
        <div style={cardStyles}>
          <header>
            <h1 style={titleStyles}>Planilla de asistencia</h1>
            <p style={subtitleStyles}>Gestión de asistencia del curso</p>
          </header>
          <div style={infoBoxStyles}>
            <p style={infoLabelStyles}>ID del curso</p>
            <p style={infoValueStyles}>{id}</p>
          </div>
          <div style={infoBoxStyles}>
            <p style={placeholderTextStyles}>
              Este curso no tiene días de clase configurados.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Si no hay alumnos
  if (!alumnos.length) {
    return (
      <main style={pageStyles} className="app-page">
        <div style={topActionsWrapperStyles}>
          <button 
            style={secondaryButtonStyles}
            type="button" 
            onClick={() => navigate(`/curso/${id}`)}
          >
            Volver al curso
          </button>
          <button 
            style={secondaryButtonStyles}
            type="button" 
            onClick={handleLogout}
          >
            Salir del sistema
          </button>
        </div>
        <div style={cardStyles}>
          <header>
            <h1 style={titleStyles}>Planilla de asistencia</h1>
            <p style={subtitleStyles}>Gestión de asistencia del curso</p>
          </header>
          <div style={infoBoxStyles}>
            <p style={infoLabelStyles}>Curso</p>
            <p style={infoValueStyles}>{course.nombre}</p>
          </div>
          <div style={infoBoxStyles}>
            <p style={placeholderTextStyles}>
              No hay alumnos cargados en este curso.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="attendance-page app-page" style={pageStyles}>
      <div style={topActionsWrapperStyles}>
        <button 
          style={secondaryButtonStyles}
          type="button" 
          onClick={() => navigate(`/curso/${id}`)}
        >
          Volver al curso
        </button>
        <button 
          style={secondaryButtonStyles}
          type="button" 
          onClick={handleLogout}
        >
          Salir del sistema
        </button>
      </div>

      <div className="attendance-panel" style={cardStyles}>
        <header>
          <h1 style={titleStyles}>Planilla de asistencia</h1>
          <p style={subtitleStyles}>Gestión de asistencia del curso</p>
        </header>

        <div className="attendance-course-info" style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={infoBoxStyles}>
              <p style={infoLabelStyles}>Curso</p>
              <p style={infoValueStyles}>{course.nombre}</p>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={infoBoxStyles}>
              <p style={infoLabelStyles}>Días de clase</p>
              <p style={infoValueStyles}>{diasClase.join(', ')}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginTop: '16px', width: '100%', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ color: '#d7dcff', fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Mes:
            </label>
            <input
              type="month"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              style={monthSelectStyles}
            />
          </div>

          <div style={{ display: 'flex', gap: '14px', marginLeft: 'auto' }}>
            <button
              style={actionButtonStyles}
              type="button"
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(236, 72, 153, 1) 100%)';
                e.target.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.5)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)';
                e.target.style.boxShadow = '0 4px 15px rgba(147, 51, 234, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
              onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
            >
              Ver estadísticas
            </button>
            <button
              style={actionButtonStyles}
              type="button"
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 1) 0%, rgba(236, 72, 153, 1) 100%)';
                e.target.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.5)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)';
                e.target.style.boxShadow = '0 4px 15px rgba(147, 51, 234, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
              onClick={exportarPDF}
            >
              Exportar PDF
            </button>
          </div>
        </div>

        <div style={{ ...summaryStyles, marginTop: '16px' }}>
          <div style={summaryItemStyles}>
            <span style={summaryLabelStyles}>Alumnos</span>
            <span style={summaryValueStyles}>{alumnos.length}</span>
          </div>
          <div style={summaryItemStyles}>
            <span style={summaryLabelStyles}>Clases del mes</span>
            <span style={summaryValueStyles}>{fechasDelMes.length}</span>
          </div>
          <div style={summaryItemStyles}>
            <span style={summaryLabelStyles}>Celdas totales</span>
            <span style={summaryValueStyles}>{totalCeldas}</span>
          </div>
        </div>

        {mostrarEstadisticas && (
          <div style={tableContainerStyles}>
            <table style={tableStyles}>
              <thead>
                <tr>
                  <th style={{ ...thStyles, textAlign: 'left' }}>Nº</th>
                  <th style={{ ...thStyles, textAlign: 'left' }}>Alumno</th>
                  <th style={thStyles}>DNI</th>
                  <th style={thStyles}>Presentes</th>
                  <th style={thStyles}>Ausentes</th>
                  <th style={thStyles}>Tardanzas</th>
                  <th style={thStyles}>Total de clases</th>
                  <th style={thStyles}>% Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno, index) => {
                  const stats = calcularEstadisticas(alumno.id);
                  return (
                    <tr key={alumno.id}>
                      <td style={{ ...tdStyles, textAlign: 'left' }}>{index + 1}</td>
                      <td style={{ ...tdStyles, textAlign: 'left' }}>{alumno.nombre}</td>
                      <td style={tdStyles}>{alumno.dni || '-'}</td>
                      <td style={{ ...tdStyles, color: '#4caf50', fontWeight: 600 }}>{stats.p}</td>
                      <td style={{ ...tdStyles, color: '#f44336', fontWeight: 600 }}>{stats.a}</td>
                      <td style={{ ...tdStyles, color: '#ff9800', fontWeight: 600 }}>{stats.t}</td>
                      <td style={{ ...tdStyles, color: '#9da3bf', fontWeight: 600 }}>{fechasDelMes.length}</td>
                      <td style={{ ...tdStyles, color: '#9da3bf', fontWeight: 600 }}>{stats.porcentaje}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {loadingAttendance && <div className="inline-loading"><span className="button-spinner" aria-hidden="true" />Cargando asistencias...</div>}

        <div className="attendance-desktop" style={tableContainerStyles}>
          <table style={tableStyles}>
            <thead>
              <tr>
                <th style={{ ...thStyles, textAlign: 'left' }}>Nº</th>
                <th style={{ ...thStyles, textAlign: 'left' }}>Alumno</th>
                <th style={thStyles}>DNI</th>
                {fechasDelMes.map((fecha) => (
                  <th key={fecha.fechaISO} style={thStyles}>
                    {fecha.etiqueta}
                  </th>
                ))}
                <th style={thStyles}>P</th>
                <th style={thStyles}>A</th>
                <th style={thStyles}>T</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((alumno, index) => (
                <tr key={alumno.id}>
                  <td style={{ ...tdStyles, textAlign: 'left' }}>{index + 1}</td>
                  <td style={{ ...tdStyles, textAlign: 'left' }}>{alumno.nombre}</td>
                  <td style={tdStyles}>{alumno.dni || '-'}</td>
                  {fechasDelMes.map((fecha) => (
                    <td key={fecha.fechaISO} style={tdStyles}>
                      {(() => {
                        const clave = `${alumno.id}_${fecha.fechaISO}`;
                        const estado = asistencias[clave];
                        return (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              disabled={saving || loadingAttendance}
                              onClick={() => marcarAsistencia(alumno.id, fecha.fechaISO, 'presente')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: estado === 'presente' ? 700 : 400,
                                cursor: 'pointer',
                                background: estado === 'presente' ? '#4caf50' : 'rgba(255,255,255,0.1)',
                                color: estado === 'presente' ? '#fff' : '#9da3bf'
                              }}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              disabled={saving || loadingAttendance}
                              onClick={() => marcarAsistencia(alumno.id, fecha.fechaISO, 'ausente')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: estado === 'ausente' ? 700 : 400,
                                cursor: 'pointer',
                                background: estado === 'ausente' ? '#f44336' : 'rgba(255,255,255,0.1)',
                                color: estado === 'ausente' ? '#fff' : '#9da3bf'
                              }}
                            >
                              A
                            </button>
                            <button
                              type="button"
                              disabled={saving || loadingAttendance}
                              onClick={() => marcarAsistencia(alumno.id, fecha.fechaISO, 'tardanza')}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: estado === 'tardanza' ? 700 : 400,
                                cursor: 'pointer',
                                background: estado === 'tardanza' ? '#ff9800' : 'rgba(255,255,255,0.1)',
                                color: estado === 'tardanza' ? '#fff' : '#9da3bf'
                              }}
                            >
                              T
                            </button>
                          </div>
                        );
                      })()}
                    </td>
                  ))}
                  {(() => {
                    const totales = calcularTotalesAlumno(alumno.id);
                    return (
                      <>
                        <td style={{ ...tdStyles, color: '#4caf50', fontWeight: 600 }}>{totales.p}</td>
                        <td style={{ ...tdStyles, color: '#f44336', fontWeight: 600 }}>{totales.a}</td>
                        <td style={{ ...tdStyles, color: '#ff9800', fontWeight: 600 }}>{totales.t}</td>
                      </>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="attendance-mobile">
          {alumnos.map((alumno) => {
            const totals = calcularTotalesAlumno(alumno.id);
            return <article className="attendance-student-card" key={alumno.id}>
              <header><div><strong>{alumno.nombre}</strong><small>DNI: {alumno.dni || '-'}</small></div><span>P {totals.p} · A {totals.a} · T {totals.t}</span></header>
              <div className="attendance-date-list">
                {fechasDelMes.map((fecha) => {
                  const key = `${alumno.id}_${fecha.fechaISO}`;
                  const status = asistencias[key];
                  return <div className="attendance-date-row" key={fecha.fechaISO}>
                    <span>{fecha.etiqueta}</span>
                    <div className="attendance-state-buttons">
                      <button type="button" disabled={saving || loadingAttendance} aria-label={`Presente, ${alumno.nombre}, ${fecha.etiqueta}`} className={status === 'presente' ? 'is-present' : ''} onClick={() => marcarAsistencia(alumno.id, fecha.fechaISO, 'presente')}>P</button>
                      <button type="button" disabled={saving || loadingAttendance} aria-label={`Ausente, ${alumno.nombre}, ${fecha.etiqueta}`} className={status === 'ausente' ? 'is-absent' : ''} onClick={() => marcarAsistencia(alumno.id, fecha.fechaISO, 'ausente')}>A</button>
                      <button type="button" disabled={saving || loadingAttendance} aria-label={`Tardanza, ${alumno.nombre}, ${fecha.etiqueta}`} className={status === 'tardanza' ? 'is-late' : ''} onClick={() => marcarAsistencia(alumno.id, fecha.fechaISO, 'tardanza')}>T</button>
                    </div>
                  </div>;
                })}
              </div>
            </article>;
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="busy-button"
            style={secondaryButtonStyles}
            type="button" 
            onClick={handleSaveAsistencias}
            disabled={saving || loadingAttendance}
          >
            {saving && <span className="button-spinner" aria-hidden="true" />}{saving ? 'Guardando...' : 'Guardar asistencia'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default AttendanceSheet;
