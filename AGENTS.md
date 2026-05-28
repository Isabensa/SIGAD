# SIGAD - Reglas del proyecto

## Tecnologías
- React con Vite
- JavaScript
- PocketBase como backend

---

## Contexto del sistema

SIGAD es un Sistema Inteligente de Gestión de Asistencia Docente orientado a nivel secundario.

El sistema permite a los docentes:
- crear cursos
- gestionar alumnos
- registrar asistencia
- visualizar estadísticas automáticas

---

## Objetivo del sistema

Desarrollar una aplicación web que permita:

- autenticación de docentes
- creación y gestión de cursos
- registro de asistencia
- generación automática de planillas según días de clase
- cálculo de estadísticas de asistencia

---

## Estructura actual

- Login funcional
- Conexión a PocketBase
- Dashboard básico después del login
- Creación de cursos
- Listado de cursos

---

## Reglas importantes

- No modificar estilos existentes salvo que se solicite
- No agregar librerías innecesarias
- Mantener componentes simples
- Explicar los cambios realizados
- No romper la lógica de login existente
- No modificar la conexión a PocketBase
- Trabajar paso a paso
- Evitar cambios masivos

---

## Reglas de negocio

- Un curso pertenece a un único docente
- Un docente solo puede ver sus cursos
- Los cursos deben guardarse en PocketBase
- La asistencia se registra por alumno y por fecha única
- No se deben duplicar registros de asistencia
- Solo se deben mostrar fechas correspondientes a días de clase
- Los datos deben persistir correctamente

---

## Modelo de datos (referencia)

Curso:
- nombre
- escuela
- añoLectivo
- diasClase
- horario
- docenteId

Estudiante:
- nombre
- cursoId

Asistencia:
- estudianteId
- cursoId
- fecha
- estado (presente | ausente | tardanza)

---

## Funcionalidades del MVP

1. Autenticación
- login con email y contraseña
- mantener sesión
- cerrar sesión

2. Cursos
- crear curso
- listar cursos
- editar curso (pendiente)
- eliminar curso (pendiente)

3. Alumnos (pendiente)
- agregar alumnos
- listar alumnos

4. Asistencia (pendiente)
- registrar asistencia
- visualizar planilla dinámica

5. Estadísticas (pendiente)
- calcular porcentajes
- visualizar indicadores

---

## Convenciones

- Usar nombres claros en variables y funciones
- Mantener código legible
- Evitar lógica duplicada
- Priorizar simplicidad
- No sobrecomplicar soluciones

---

## Flujo del sistema

1. El usuario inicia sesión
2. Accede al dashboard
3. Crea cursos
4. Visualiza sus cursos
5. Gestiona alumnos
6. Registra asistencia
7. Consulta estadísticas

---

## Restricciones del MVP

No implementar:
- aplicación móvil
- notificaciones (WhatsApp o email)
- integración con sistemas externos
- exportaciones avanzadas

---

## Estado actual del desarrollo

- Login completo
- Dashboard implementado
- Creación de cursos funcional
- Listado de cursos funcional
- Próximo paso: eliminar curso (DELETE)

---

## Instrucciones para el agente

Cuando se soliciten cambios:

- modificar solo los archivos indicados
- respetar la estructura actual
- no romper funcionalidades existentes
- realizar cambios mínimos necesarios
- explicar qué se hizo y por quéquiero mejorar los mensajes de confirmación y éxito en Dashboard.jsx usando SweetAlert2

objetivo:
reemplazar window.confirm y alert por modales modernos

instrucciones:

1. importar Swal desde 'sweetalert2'

2. antes de eliminar un curso:
   - mostrar un modal de confirmación con:
     título: "¿Eliminar curso?"
     texto: "Esta acción no se puede deshacer"
     icono: "warning"
     botones: confirmar y cancelar

3. si el usuario confirma:
   - ejecutar handleDeleteCourse
   - luego mostrar un modal de éxito:
     "Curso eliminado correctamente"

4. no modificar estilos existentes
5. no modificar la lógica de eliminación, solo envolverla con SweetAlert
6. trabajar solo en Dashboard.jsx

entregar:
archivo Dashboard.jsx actualizado completo
