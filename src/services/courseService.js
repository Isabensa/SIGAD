export async function getCourses(pb) {
  try {
    return await pb.collection('cursos').getFullList();
  } catch (error) {
    console.log('error al obtener cursos', error);
    throw error;
  }
}

export async function createCourse(pb, data) {
  try {
    return await pb.collection('cursos').create(data);
  } catch (error) {
    console.log('error al guardar curso', error);
    throw error;
  }
}

export async function deleteCourse(pb, id) {
  try {
    return await pb.collection('cursos').delete(id);
  } catch (error) {
    console.log('error al eliminar curso', error);
    throw error;
  }
}
