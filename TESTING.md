# Pruebas manuales de S.I.G.A.D.

Esta guía permite validar las funciones principales de S.I.G.A.D. antes de la entrega final.
Las pruebas deben realizarse con cuentas de prueba y datos ficticios, evitando utilizar información personal real.

El sistema puede probarse en dos entornos:

* Entorno local.
* Entorno publicado.

---

## Preparación

### Entorno local

* [ ] Iniciar PocketBase local en `http://127.0.0.1:8090`, si se desea probar con backend local.
* [ ] Iniciar el frontend con `npm run dev`.
* [ ] Confirmar que la variable `VITE_POCKETBASE_URL` apunte al backend que se desea probar.
* [ ] Confirmar que existe una cuenta administradora activa.
* [ ] Confirmar que existe una cuenta docente activa y otra inactiva.
* [ ] Disponer de un curso y alumnos de prueba.

### Entorno publicado

* [ ] Abrir la aplicación publicada en `https://sigad.vercel.app`.
* [ ] Confirmar que el backend publicado corresponde a `https://sigad-demo.pockethost.io`.
* [ ] Ingresar con una cuenta administradora de prueba.
* [ ] Ingresar con una cuenta docente de prueba.
* [ ] Crear datos ficticios para validar cursos, alumnos, asistencias, estadísticas y PDF.
* [ ] Evitar utilizar datos personales reales durante las pruebas.

---

## 1. Inicio de sesión del administrador

* [ ] Ingresar con credenciales administrativas válidas.
* [ ] Verificar que se abre el panel principal.
* [ ] Confirmar que aparecen las opciones de administración de docentes.
* [ ] Confirmar que aparece la opción de revisión de pagos.
* [ ] Confirmar que el administrador puede acceder a su perfil.
* [ ] Cerrar sesión y comprobar el regreso a la pantalla de acceso.

---

## 2. Inicio de sesión del docente

* [ ] Ingresar con una cuenta docente activa.
* [ ] Confirmar que solo aparecen sus cursos.
* [ ] Confirmar que no aparecen botones de administración de docentes.
* [ ] Confirmar que no aparece la opción de revisión general de pagos.
* [ ] Abrir el perfil y verificar que sus datos puedan consultarse o actualizarse.
* [ ] Cerrar sesión y comprobar el regreso a la pantalla de acceso.

---

## 3. Usuario inactivo o sin acceso vigente

* [ ] Intentar ingresar con una cuenta docente inactiva.
* [ ] Verificar que el acceso sea rechazado con un mensaje comprensible.
* [ ] Confirmar que no se muestre información privada ni el panel.
* [ ] Intentar ingresar con un usuario docente sin suscripción vigente, si existe uno de prueba.
* [ ] Confirmar que el sistema bloquee o redirija según corresponda.

---

## 4. Administración de docentes

* [ ] Desde una cuenta administradora, abrir la administración de docentes.
* [ ] Verificar que se muestra el listado de docentes.
* [ ] Crear un docente de prueba con DNI y correo no utilizados, si la función está disponible.
* [ ] Editar los datos permitidos.
* [ ] Activar y desactivar una cuenta docente de prueba.
* [ ] Confirmar que los cambios se reflejan en el listado.
* [ ] Confirmar que el usuario administrador principal no pueda desactivarse accidentalmente.
* [ ] Confirmar que un docente común no pueda acceder a esta pantalla.

---

## 5. Cursos

* [ ] Crear un curso de prueba y comprobar el mensaje de confirmación.
* [ ] Confirmar que el curso aparece en el dashboard del docente correspondiente.
* [ ] Editar los datos del curso y volver a abrirlo.
* [ ] Confirmar que un docente no pueda ver cursos ajenos.
* [ ] Verificar el contador de cursos activos utilizados.
* [ ] Verificar el límite de 10 cursos activos para una cuenta docente.
* [ ] Archivar un curso de prueba, si corresponde.
* [ ] Confirmar que el curso archivado se muestre en la sección correspondiente.
* [ ] Al eliminar un curso de prueba, confirmar que primero se genere el informe correspondiente.

---

## 6. Alumnos

* [ ] Agregar un alumno ficticio al curso de prueba.
* [ ] Confirmar que el alumno aparece en el listado del curso.
* [ ] Editar sus datos.
* [ ] Confirmar los mensajes de guardado y error.
* [ ] Eliminar un alumno de prueba.
* [ ] Verificar que desaparezca del listado.
* [ ] Confirmar que los alumnos queden asociados únicamente al curso correspondiente.

---

## 7. Asistencia P/A/T

* [ ] Abrir la planilla de asistencia de un curso con alumnos.
* [ ] Seleccionar un mes de prueba.
* [ ] Marcar `P` (Presente), `A` (Ausente) y `T` (Tardanza) en fechas de prueba.
* [ ] Guardar las asistencias.
* [ ] Comprobar que aparece una confirmación visible.
* [ ] Recargar la pantalla y verificar que los estados permanezcan guardados.
* [ ] Cambiar un estado existente y confirmar que se actualice sin duplicarse.
* [ ] Confirmar que el guardado por lote responda sin realizar una solicitud individual por cada celda.
* [ ] Intentar guardar una asistencia desde un docente ajeno y confirmar que sea rechazada.
* [ ] Confirmar que un lote con un alumno inválido no guarde registros parciales.
* [ ] Probar el guardado con varios alumnos y fechas para verificar un tiempo de respuesta razonable.
* [ ] Confirmar que la planilla siga siendo utilizable en pantalla pequeña.

---

## 8. Estadísticas

* [ ] Abrir la vista de estadísticas de asistencia.
* [ ] Comparar los totales de presentes, ausentes y tardanzas con la planilla.
* [ ] Verificar que los porcentajes se calculen correctamente.
* [ ] Verificar el comportamiento cuando un alumno no tiene registros.
* [ ] Confirmar que los datos estadísticos se actualicen luego de modificar asistencias.

---

## 9. Informe PDF

* [ ] Exportar el PDF de asistencia.
* [ ] Abrir el archivo generado.
* [ ] Revisar curso, alumnos, fechas y estados P/A/T.
* [ ] Confirmar que el contenido sea legible.
* [ ] Confirmar que no falten columnas importantes.
* [ ] Verificar que el archivo pueda utilizarse como informe de respaldo.

---

## 10. Pagos y solicitudes

* [ ] Desde la landing, enviar una solicitud pública con datos ficticios.
* [ ] Adjuntar un comprobante de prueba.
* [ ] Consultar el estado de la solicitud con los datos requeridos.
* [ ] Como administrador, abrir la pantalla de revisión de pagos o solicitudes.
* [ ] Confirmar que el comprobante pueda visualizarse.
* [ ] Aprobar o rechazar una solicitud de prueba.
* [ ] Como docente activo, cargar un pago de renovación si la función está disponible.
* [ ] Verificar la aprobación, el rechazo y la actualización del vencimiento.
* [ ] Confirmar que los comprobantes no sean visibles para otros docentes.

---

## 11. Vista adaptable / responsive

### Escritorio

* [ ] Revisar landing.
* [ ] Revisar login.
* [ ] Revisar dashboard administrador.
* [ ] Revisar dashboard docente.
* [ ] Revisar gestión de cursos.
* [ ] Revisar detalle de curso.
* [ ] Revisar planilla de asistencia.
* [ ] Revisar estadísticas.

### Celular o ancho reducido

* [ ] Repetir la revisión con un ancho aproximado de 375 px.
* [ ] Confirmar que no exista desplazamiento horizontal innecesario.
* [ ] Verificar que botones, formularios y tarjetas sean utilizables.
* [ ] Confirmar que los textos principales se lean correctamente.
* [ ] Confirmar que la planilla de asistencia siga siendo navegable.
* [ ] Confirmar que las alertas y confirmaciones se mantengan centradas y no desborden la pantalla.

### Interacción visual

* [ ] Confirmar que los botones muestren hover, sombra suave y foco visible al usar mouse o teclado.
* [ ] Verificar el movimiento suave de la imagen principal de la landing.
* [ ] Confirmar que la interfaz siga siendo utilizable cuando el sistema operativo solicita reducir animaciones.

---

## 12. Pruebas de despliegue en Vercel y PocketHost

* [ ] Abrir `https://sigad.vercel.app`.
* [ ] Confirmar que la landing carga correctamente.
* [ ] Iniciar sesión como administrador.
* [ ] Iniciar sesión como docente.
* [ ] Crear un curso de prueba desde la app publicada.
* [ ] Agregar alumnos ficticios.
* [ ] Registrar asistencias.
* [ ] Cerrar sesión y volver a ingresar.
* [ ] Confirmar que los datos permanecen guardados.
* [ ] Recargar `/dashboard` con F5.
* [ ] Confirmar que no aparece error 404.
* [ ] Verificar que el frontend publicado se conecta correctamente con PocketHost.
* [ ] Confirmar que los datos creados desde Vercel aparecen en el panel online de PocketBase.

---

## 13. Rutas internas

* [ ] Abrir `https://sigad.vercel.app`.
* [ ] Iniciar sesión.
* [ ] Navegar al dashboard.
* [ ] Recargar la página con F5.
* [ ] Confirmar que la ruta interna no devuelve `404: NOT_FOUND`.
* [ ] Probar una ruta de curso, si existe un curso creado.
* [ ] Recargar esa ruta interna.
* [ ] Confirmar que la aplicación sigue funcionando correctamente.

---

## 14. Seguridad básica y privacidad

* [ ] Confirmar que `.env` no está subido al repositorio.
* [ ] Confirmar que `.env.example` no contiene credenciales privadas.
* [ ] Confirmar que los datos de prueba no incluyen información personal real.
* [ ] Confirmar que un docente no puede ver cursos de otro docente.
* [ ] Confirmar que un docente no puede acceder a pantallas administrativas.
* [ ] Confirmar que los comprobantes no queden expuestos públicamente para usuarios no autorizados.
* [ ] Confirmar que el repositorio no incluye bases de datos locales, backups privados ni archivos sensibles.

---

## 15. Compilación final

Desde la carpeta `SIGAD-frontend`, ejecutar:

```powershell
npm run lint
npm run build
```

* [ ] Confirmar que el análisis estático finalice sin errores.
* [ ] Confirmar que el comando finalice sin errores.
* [ ] Revisar que la carpeta `dist` se genere correctamente.
* [ ] Registrar cualquier advertencia que deba considerarse para producción.
* [ ] Confirmar que la advertencia por tamaño del paquete, si aparece, no impide la compilación.

---

## 16. Control de versiones

Desde la carpeta `SIGAD-frontend`, ejecutar:

```powershell
git status
```

* [ ] Confirmar que no queden cambios sin guardar.
* [ ] Si hay cambios finales, ejecutar:

```powershell
git add .
git commit -m "Actualiza pruebas finales"
git push
```

* [ ] Verificar nuevamente:

```powershell
git status
```

* [ ] Confirmar que el resultado sea:

```txt
nothing to commit, working tree clean
```

---

## Observaciones técnicas

El guardado de asistencias utiliza un endpoint batch de PocketBase. El lote se valida antes de guardar y se procesa dentro de una transacción, evitando registros parciales si alguno de los datos es inválido.

Para desplegar esta mejora deben publicarse en conjunto el frontend y el archivo `pocketbase/pb_hooks/main.pb.js`. Si se actualiza únicamente el frontend, el backend publicado no reconocerá el endpoint batch.

La compilación puede mostrar una advertencia por el tamaño de algunos paquetes JavaScript. Esta advertencia no impide generar la versión de producción y queda registrada como una optimización futura.

---

## Resultado

* Fecha de prueba: ____________________
* Responsable: _______________________
* Entorno probado: Local / Producción / Ambos
* Resultado general: Aprobado / Con observaciones / Rechazado

### Observaciones

---

---

---

### Conclusión de la prueba

---

---

---
