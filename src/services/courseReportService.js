import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDayList } from '../utils/dayNames';

const sanitizeFileName = (value) => value.replace(/[\\/:*?"<>|]/g, '-');

export async function exportCourseReport(pb, course) {
  const [students, attendances] = await Promise.all([
    pb.collection('alumnos').getFullList({
      filter: `cursoId = "${course.id}"`, sort: 'nombre', requestKey: null
    }),
    pb.collection('asistencias').getFullList({
      filter: `cursoId = "${course.id}"`, sort: 'fecha', requestKey: null
    })
  ]);

  let teacherName = 'Sin docente asignado';
  if (course.docenteId) {
    try {
      const teacher = await pb.collection('users').getOne(course.docenteId, { requestKey: null });
      teacherName = teacher.name || teacher.email || course.docenteId;
    } catch {
      teacherName = course.docenteId;
    }
  }

  const attendanceByStudent = new Map();
  attendances.forEach((attendance) => {
    const current = attendanceByStudent.get(attendance.alumnoId) || [];
    current.push(attendance);
    attendanceByStudent.set(attendance.alumnoId, current);
  });

  const doc = new jsPDF('landscape');
  doc.setFontSize(18);
  doc.text('SIGAD - Informe histórico del curso', 14, 16);
  doc.setFontSize(10);
  doc.text(`Curso: ${course.nombre}`, 14, 25);
  doc.text(`Escuela: ${course.escuela || '-'}`, 14, 31);
  doc.text(`Año: ${course.anio || '-'}`, 14, 37);
  doc.text(`Docente: ${teacherName}`, 14, 43);
  doc.text(`Días de clase: ${formatDayList(course.diasClase || []) || '-'}`, 14, 49);
  doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 14, 55);

  const summaryRows = students.map((student, index) => {
    const records = attendanceByStudent.get(student.id) || [];
    const present = records.filter((item) => item.estado === 'Presente').length;
    const absent = records.filter((item) => item.estado === 'Ausente').length;
    const late = records.filter((item) => item.estado === 'Tardanza').length;
    const percentage = records.length ? (((present + late * 0.5) / records.length) * 100).toFixed(1) : '0.0';
    return [index + 1, student.nombre, student.dni || '-', student.email || '-', present, absent, late, records.length, `${percentage}%`];
  });

  autoTable(doc, {
    startY: 62,
    head: [['N°', 'Alumno', 'DNI', 'Email', 'Presentes', 'Ausentes', 'Tardanzas', 'Registros', '% asistencia']],
    body: summaryRows.length ? summaryRows : [['-', 'Sin alumnos registrados', '-', '-', 0, 0, 0, 0, '0%']]
  });

  const detailRows = attendances.map((attendance) => {
    const student = students.find((item) => item.id === attendance.alumnoId);
    return [student?.nombre || attendance.alumnoId, attendance.fecha?.slice(0, 10) || '-', attendance.estado];
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 12,
    head: [['Alumno', 'Fecha', 'Estado']],
    body: detailRows.length ? detailRows : [['Sin asistencias registradas', '-', '-']]
  });

  const fileName = sanitizeFileName(`SIGAD_${course.nombre}_informe_completo.pdf`);
  doc.save(fileName);
  return { students: students.length, attendances: attendances.length, fileName };
}
