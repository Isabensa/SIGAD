const DAY_LABELS = {
  domingo: 'domingo',
  lunes: 'lunes',
  martes: 'martes',
  miercoles: 'miércoles',
  jueves: 'jueves',
  viernes: 'viernes',
  sabado: 'sábado'
};

export const formatDayName = (day) => DAY_LABELS[day] || day;

export const formatDayList = (days = []) => days.map(formatDayName).join(', ');
