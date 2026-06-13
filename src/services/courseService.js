export async function getCourses(pb) {
  try {
    // use requestKey: null to avoid PocketBase SDK auto-cancellation when multiple calls are made
    return await pb.collection('cursos').getFullList({ requestKey: null });
  } catch (error) {
    console.log('error al obtener cursos', error);
    throw error;
  }
}

export async function createCourse(pb, data) {
  try {
    return await pb.collection('cursos').create(data, { requestKey: null });
  } catch (error) {
    console.log('error al guardar curso', error);
    throw error;
  }
}

export async function archiveCourse(pb, id) {
  try {
    return await pb.collection('cursos').update(id, {
      archivado: true,
      archivadoEn: new Date().toISOString()
    }, { requestKey: null });
  } catch (error) {
    console.log('error al archivar curso', error);
    throw error;
  }
}

export async function restoreCourse(pb, id) {
  return await pb.collection('cursos').update(id, {
    archivado: false,
    archivadoEn: ''
  }, { requestKey: null });
}

export async function permanentlyDeleteCourse(pb, id) {
  return await pb.send(`/api/sigad/courses/${id}/permanent`, {
    method: 'DELETE',
    requestKey: null
  });
}
