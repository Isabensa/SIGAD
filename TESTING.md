# Pruebas manuales de S.I.G.A.D.

Esta guia permite validar las funciones principales antes de la entrega. Las pruebas deben realizarse con PocketBase y el frontend activos, utilizando cuentas de prueba sin datos personales reales.

## Preparacion

- [ ] Iniciar PocketBase en `http://127.0.0.1:8090`.
- [ ] Iniciar el frontend con `npm run dev`.
- [ ] Confirmar que existe una cuenta administradora activa.
- [ ] Confirmar que existe una cuenta docente activa y otra inactiva.
- [ ] Disponer de un curso y alumnos de prueba.

## 1. Inicio de sesion del administrador

- [ ] Ingresar con credenciales administrativas validas.
- [ ] Verificar que se abre el panel principal.
- [ ] Confirmar que se visualizan todos los cursos del sistema.
- [ ] Confirmar que aparecen las opciones de administracion de docentes y pagos.
- [ ] Cerrar sesion y comprobar el regreso al acceso.

## 2. Inicio de sesion del docente

- [ ] Ingresar con una cuenta docente activa.
- [ ] Confirmar que solo aparecen sus cursos.
- [ ] Confirmar que no aparecen botones ni rutas administrativas.
- [ ] Abrir el perfil y verificar que sus datos puedan actualizarse.

## 3. Usuario inactivo

- [ ] Intentar ingresar con una cuenta docente inactiva.
- [ ] Verificar que el acceso sea rechazado con un mensaje comprensible.
- [ ] Confirmar que no se muestre informacion privada ni el panel.

## 4. Administracion de docentes

- [ ] Desde una cuenta administradora, abrir la administracion de docentes.
- [ ] Crear un docente de prueba con DNI y correo no utilizados.
- [ ] Editar los datos permitidos.
- [ ] Activar y desactivar la cuenta.
- [ ] Confirmar que los cambios se reflejan en el listado.

## 5. Cursos

- [ ] Crear un curso y comprobar el mensaje de confirmacion.
- [ ] Editar sus datos y volver a abrirlo.
- [ ] Confirmar que un docente no pueda ver cursos ajenos.
- [ ] Verificar el limite de 10 cursos para una cuenta docente.
- [ ] Al eliminar un curso de prueba, confirmar que primero se genere el informe correspondiente.

## 6. Alumnos

- [ ] Agregar un alumno al curso de prueba.
- [ ] Editar sus datos.
- [ ] Confirmar los mensajes de guardado y error.
- [ ] Eliminar al alumno y verificar que desaparezca del listado.

## 7. Asistencia P/A/T

- [ ] Abrir la planilla de asistencia de un curso con alumnos.
- [ ] Marcar `P` (Presente), `A` (Ausente) y `T` (Tardanza) en fechas de prueba.
- [ ] Guardar y comprobar la confirmacion visible.
- [ ] Recargar la pantalla y verificar que los estados permanezcan guardados.
- [ ] Cambiar un estado existente y confirmar que se actualice sin duplicarse.

## 8. Estadisticas

- [ ] Abrir la vista de estadisticas de asistencia.
- [ ] Comparar los totales de presentes, ausentes y tardanzas con la planilla.
- [ ] Verificar el comportamiento cuando un alumno no tiene registros.

## 9. Informe PDF

- [ ] Exportar el PDF de asistencia.
- [ ] Abrir el archivo y revisar curso, alumnos, fechas y estados P/A/T.
- [ ] Confirmar que el contenido sea legible y que no falten columnas.

## 10. Pagos y solicitudes

- [ ] Desde la landing, enviar una solicitud publica con un comprobante de prueba.
- [ ] Consultar su estado con correo, DNI y numero de operacion.
- [ ] Como administrador, abrir el comprobante y aprobar o rechazar la solicitud.
- [ ] Como docente activo, cargar un pago de renovacion.
- [ ] Verificar la aprobacion, el rechazo y la actualizacion del vencimiento.
- [ ] Confirmar que los comprobantes no sean visibles para otros docentes.

## 11. Vista adaptable

- [ ] Revisar landing, acceso, panel, cursos y asistencia en escritorio.
- [ ] Repetir la revision con un ancho aproximado de 375 px.
- [ ] Confirmar que no exista desplazamiento horizontal innecesario.
- [ ] Verificar que botones, formularios y tarjetas sean utilizables en celular.

## 12. Compilacion final

Desde `SIGAD-frontend` ejecutar:

```powershell
npm run build
```

- [ ] Confirmar que el comando finalice sin errores.
- [ ] Revisar que la carpeta `dist` se genere correctamente.
- [ ] Registrar cualquier advertencia que deba considerarse para produccion.

## Resultado

- Fecha de prueba: ____________________
- Responsable: _______________________
- Resultado general: Aprobado / Con observaciones / Rechazado
- Observaciones: ____________________________________________________________
