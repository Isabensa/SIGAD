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

export async function deleteCourse(pb, id) {
  try {
    return await pb.collection('cursos').delete(id, { requestKey: null });
  } catch (error) {
    console.log('error al eliminar curso', error);
    throw error;
  }
}
