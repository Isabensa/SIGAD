/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((event) => {
  const maxCoursesPerTeacher = 10
  const auth = event.auth

  if (!auth || !auth.getBool("activo")) {
    throw new ForbiddenError("Tu cuenta no está habilitada para crear cursos.")
  }

  const role = auth.getString("administrador")
  if (role !== "admin" && role !== "docente") {
    throw new ForbiddenError("Tu cuenta no tiene un rol válido para crear cursos.")
  }

  const subscriptionStatus = auth.getString("suscripcionEstado")
  const subscriptionUntil = auth.getString("suscripcionHasta")
  const hasCommercialAccess = subscriptionStatus === "exento" || (
    subscriptionStatus === "activo" &&
    subscriptionUntil &&
    new Date(subscriptionUntil).getTime() >= Date.now()
  )

  if (!hasCommercialAccess) {
    throw new ForbiddenError("Tu espacio no tiene una suscripción vigente.")
  }

  const ownerId = auth.id
  event.record.set("docenteId", ownerId)

  const existingCourses = event.app.findRecordsByFilter(
    "cursos",
    "docenteId = {:docenteId} && archivado = false",
    "",
    maxCoursesPerTeacher,
    0,
    { docenteId: ownerId }
  )

  if (existingCourses.length >= maxCoursesPerTeacher) {
    throw new BadRequestError("Alcanzaste el límite de 10 cursos de tu espacio.")
  }

  event.next()
}, "cursos")

onRecordUpdateRequest((event) => {
  const wasArchived = event.record.original().getBool("archivado")
  const willBeArchived = event.record.getBool("archivado")

  if (wasArchived && willBeArchived && event.auth?.getString("administrador") !== "admin") {
    throw new ForbiddenError("Restaura el curso antes de modificarlo.")
  }

  if (!wasArchived || willBeArchived) {
    event.next()
    return
  }

  const ownerId = event.record.getString("docenteId")
  const activeCourses = event.app.findRecordsByFilter(
    "cursos",
    "docenteId = {:docenteId} && archivado = false && id != {:courseId}",
    "",
    10,
    0,
    { docenteId: ownerId, courseId: event.record.id }
  )

  if (activeCourses.length >= 10) {
    throw new BadRequestError("El docente ya tiene 10 cursos activos.")
  }

  event.next()
}, "cursos")

routerAdd("DELETE", "/api/sigad/courses/{id}/permanent", (event) => {
  const auth = event.auth
  if (!auth || auth.getString("administrador") !== "admin" || !auth.getBool("activo")) {
    throw new ForbiddenError("Solo la administración puede eliminar cursos definitivamente.")
  }

  const courseId = event.request.pathValue("id")
  const course = event.app.findRecordById("cursos", courseId)
  if (!course.getBool("archivado")) {
    throw new BadRequestError("El curso debe estar archivado antes de eliminarlo.")
  }

  event.app.runInTransaction((transaction) => {
    const attendances = transaction.findRecordsByFilter(
      "asistencias", "cursoId = {:courseId}", "", 0, 0, { courseId }
    )
    for (const attendance of attendances) transaction.delete(attendance)

    const students = transaction.findRecordsByFilter(
      "alumnos", "cursoId = {:courseId}", "", 0, 0, { courseId }
    )
    for (const student of students) transaction.delete(student)

    const transactionCourse = transaction.findRecordById("cursos", courseId)
    transaction.delete(transactionCourse)
  })

  return event.json(200, { deleted: true })
}, $apis.requireAuth("users"))

routerAdd("POST", "/api/sigad/courses/{id}/attendance/batch", (event) => {
  const auth = event.auth
  if (!auth || !auth.getBool("activo")) {
    throw new ForbiddenError("Tu cuenta no esta habilitada.")
  }

  const courseId = event.request.pathValue("id")
  const course = event.app.findRecordById("cursos", courseId)
  const role = auth.getString("administrador")
  const isAdmin = role === "admin" || role === "administración"
  const isOwner = course.getString("docenteId") === auth.id

  if (!isAdmin && !isOwner) {
    throw new ForbiddenError("No tienes acceso a este curso.")
  }

  const items = event.requestInfo().body.asistencias
  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError("No hay asistencias para guardar.")
  }
  if (items.length > 1000) {
    throw new BadRequestError("La cantidad de asistencias supera el limite permitido.")
  }

  const validStates = { Presente: true, Ausente: true, Tardanza: true }
  const normalized = []
  const receivedKeys = {}

  for (const item of items) {
    const studentId = String(item.alumnoId || "")
    const date = String(item.fecha || "").slice(0, 10)
    const state = String(item.estado || "")
    const key = studentId + "|" + date

    if (!studentId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestError("Hay una asistencia con datos incompletos.")
    }
    if (!validStates[state]) {
      throw new BadRequestError("Hay un estado de asistencia invalido.")
    }
    if (receivedKeys[key]) {
      throw new BadRequestError("La solicitud contiene asistencias duplicadas.")
    }

    receivedKeys[key] = true
    normalized.push({ studentId, date, state, key })
  }

  let result = null
  event.app.runInTransaction((transaction) => {
    const collection = transaction.findCollectionByNameOrId("asistencias")
    const students = transaction.findRecordsByFilter(
      "alumnos", "cursoId = {:courseId}", "", 0, 0, { courseId }
    )
    const studentIds = {}
    for (const student of students) studentIds[student.id] = true

    for (const item of normalized) {
      if (!studentIds[item.studentId]) {
        throw new BadRequestError("Uno de los alumnos no pertenece al curso.")
      }
    }

    const existingRecords = transaction.findRecordsByFilter(
      "asistencias", "cursoId = {:courseId}", "", 0, 0, { courseId }
    )
    const existingByKey = {}
    for (const record of existingRecords) {
      const date = record.getString("fecha").slice(0, 10)
      existingByKey[record.getString("alumnoId") + "|" + date] = record
    }

    let created = 0
    let updated = 0
    let unchanged = 0
    for (const item of normalized) {
      let record = existingByKey[item.key]
      if (record) {
        if (record.getString("estado") === item.state) {
          unchanged++
          continue
        }
        updated++
      } else {
        record = new Record(collection)
        record.set("cursoId", courseId)
        record.set("alumnoId", item.studentId)
        record.set("fecha", item.date + " 00:00:00.000Z")
        created++
      }

      record.set("estado", item.state)
      transaction.save(record)
    }

    result = { saved: normalized.length, created, updated, unchanged }
  })

  return event.json(200, result)
}, $apis.requireAuth("users"))

onRecordCreateRequest((event) => {
  const auth = event.auth
  if (!auth || !auth.getBool("activo") || auth.getString("administrador") !== "docente") {
    throw new ForbiddenError("Solo los docentes pueden informar pagos.")
  }

  const pending = event.app.findRecordsByFilter(
    "pagos",
    'docenteId = {:docenteId} && estado = "pendiente"',
    "",
    1,
    0,
    { docenteId: auth.id }
  )
  if (pending.length > 0) {
    throw new BadRequestError("Ya tienes un comprobante pendiente de revisiÃ³n.")
  }

  const planPrices = { "1": 10000, "4": 36000, "12": 96000 }
  const months = event.record.getString("meses")
  const expectedAmount = planPrices[months]
  if (!expectedAmount) {
    throw new BadRequestError("Selecciona un plan valido.")
  }

  event.record.set("importe", expectedAmount)
  event.record.set("docenteId", auth.id)
  event.record.set("estado", "pendiente")
  event.record.set("observacionAdmin", "")
  event.record.set("revisadoPor", "")
  event.record.set("revisadoEn", "")
  event.record.set("vigenciaDesde", "")
  event.record.set("vigenciaHasta", "")
  event.next()
}, "pagos")

function requirePaymentAdmin(event) {
  const auth = event.auth
  if (!auth || !auth.getBool("activo") || auth.getString("administrador") !== "admin") {
    throw new ForbiddenError("Solo la administraciÃ³n puede revisar pagos.")
  }
  return auth
}

routerAdd("POST", "/api/sigad/payments/{id}/approve", (event) => {
  const auth = event.auth
  if (!auth || !auth.getBool("activo") || auth.getString("administrador") !== "admin") {
    throw new ForbiddenError("Solo la administracion puede revisar pagos.")
  }
  const paymentId = event.request.pathValue("id")
  let result = null

  event.app.runInTransaction((transaction) => {
    const payment = transaction.findRecordById("pagos", paymentId)
    if (payment.getString("estado") !== "pendiente") {
      throw new BadRequestError("Este pago ya fue revisado.")
    }

    const teacher = transaction.findRecordById("users", payment.getString("docenteId"))
    const now = new Date()
    const currentUntil = teacher.getString("suscripcionHasta")
    const currentDate = currentUntil ? new Date(currentUntil) : null
    const startsAt = currentDate && currentDate.getTime() > now.getTime() ? currentDate : now
    const endsAt = new Date(startsAt.getTime())
    endsAt.setMonth(endsAt.getMonth() + Number(payment.getString("meses")))

    teacher.set("activo", true)
    teacher.set("suscripcionEstado", "activo")
    teacher.set("suscripcionDesde", startsAt.toISOString())
    teacher.set("suscripcionHasta", endsAt.toISOString())
    transaction.save(teacher)

    payment.set("estado", "aprobado")
    payment.set("observacionAdmin", event.requestInfo().body.observacionAdmin || "")
    payment.set("revisadoPor", auth.id)
    payment.set("revisadoEn", now.toISOString())
    payment.set("vigenciaDesde", startsAt.toISOString())
    payment.set("vigenciaHasta", endsAt.toISOString())
    transaction.save(payment)
    result = { approved: true, subscriptionUntil: endsAt.toISOString() }
  })

  return event.json(200, result)
}, $apis.requireAuth("users"))

routerAdd("POST", "/api/sigad/payments/{id}/reject", (event) => {
  const auth = event.auth
  if (!auth || !auth.getBool("activo") || auth.getString("administrador") !== "admin") {
    throw new ForbiddenError("Solo la administracion puede revisar pagos.")
  }
  const paymentId = event.request.pathValue("id")
  const observation = event.requestInfo().body.observacionAdmin || ""
  if (!observation.trim()) {
    throw new BadRequestError("Indica el motivo del rechazo.")
  }

  const payment = event.app.findRecordById("pagos", paymentId)
  if (payment.getString("estado") !== "pendiente") {
    throw new BadRequestError("Este pago ya fue revisado.")
  }
  payment.set("estado", "rechazado")
  payment.set("observacionAdmin", observation.trim())
  payment.set("revisadoPor", auth.id)
  payment.set("revisadoEn", new Date().toISOString())
  event.app.save(payment)
  return event.json(200, { rejected: true })
}, $apis.requireAuth("users"))

onRecordCreateRequest((event) => {
  const email = event.record.getString("email").trim().toLowerCase()
  const dni = event.record.getString("dni").trim()
  const operation = event.record.getString("numeroOperacion").trim()
  const duplicates = event.app.findRecordsByFilter(
    "solicitudes",
    '(email = {:email} || dni = {:dni} || numeroOperacion = {:operation}) && (estado = "pendiente" || estado = "aprobado")',
    "",
    1,
    0,
    { email, dni, operation }
  )
  if (duplicates.length > 0) throw new BadRequestError("Ya existe una solicitud con esos datos.")

  event.record.set("email", email)
  event.record.set("dni", dni)
  event.record.set("numeroOperacion", operation)
  event.record.set("estado", "pendiente")
  event.record.set("observacionAdmin", "")
  event.record.set("revisadoPor", "")
  event.record.set("revisadoEn", "")
  event.record.set("docenteCreado", "")
  event.next()
}, "solicitudes")

routerAdd("POST", "/api/sigad/applications/status", (event) => {
  const body = event.requestInfo().body
  const email = (body.email || "").trim().toLowerCase()
  const dni = (body.dni || "").trim()
  const operation = (body.numeroOperacion || "").trim()

  if (!email || !dni || !operation) {
    throw new BadRequestError("Completa el correo, DNI y numero de operacion.")
  }

  const applications = event.app.findRecordsByFilter(
    "solicitudes",
    "email = {:email} && dni = {:dni} && numeroOperacion = {:operation}",
    "-created",
    1,
    0,
    { email, dni, operation }
  )

  if (applications.length === 0) {
    return event.json(404, { message: "No encontramos una solicitud con esos datos." })
  }

  const application = applications[0]
  return event.json(200, {
    estado: application.getString("estado"),
    meses: application.getString("meses"),
    observacionAdmin: application.getString("observacionAdmin"),
    creadaEn: application.getString("created"),
    revisadaEn: application.getString("revisadoEn")
  })
})

routerAdd("POST", "/api/sigad/applications/{id}/approve", (event) => {
  const auth = event.auth
  if (!auth || !auth.getBool("activo") || auth.getString("administrador") !== "admin") throw new ForbiddenError("Solo la administracion puede aprobar solicitudes.")
  const applicationId = event.request.pathValue("id")
  const temporaryPassword = "Sigad-" + $security.randomString(12)
  let response = null

  event.app.runInTransaction((transaction) => {
    const application = transaction.findRecordById("solicitudes", applicationId)
    if (application.getString("estado") !== "pendiente") throw new BadRequestError("Esta solicitud ya fue revisada.")

    const existingUsers = transaction.findRecordsByFilter(
      "users",
      "email = {:email}",
      "",
      1,
      0,
      { email: application.getString("email") }
    )
    if (existingUsers.length > 0) throw new BadRequestError("Ya existe un usuario con este correo.")

    const users = transaction.findCollectionByNameOrId("users")
    const teacher = new Record(users)
    teacher.set("name", application.getString("nombre"))
    teacher.set("email", application.getString("email"))
    teacher.set("emailVisibility", true)
    teacher.setPassword(temporaryPassword)
    teacher.set("dni", application.getString("dni"))
    teacher.set("telefono", application.getString("telefono"))
    teacher.set("administrador", "docente")
    teacher.set("activo", true)
    teacher.set("suscripcionEstado", "activo")
    const startsAt = new Date()
    const endsAt = new Date(startsAt.getTime())
    endsAt.setMonth(endsAt.getMonth() + Number(application.getString("meses")))
    teacher.set("suscripcionDesde", startsAt.toISOString())
    teacher.set("suscripcionHasta", endsAt.toISOString())
    transaction.save(teacher)

    application.set("estado", "aprobado")
    application.set("observacionAdmin", event.requestInfo().body.observacionAdmin || "")
    application.set("revisadoPor", auth.id)
    application.set("revisadoEn", startsAt.toISOString())
    application.set("docenteCreado", teacher.id)
    transaction.save(application)
    response = { approved: true, email: teacher.email(), temporaryPassword, subscriptionUntil: endsAt.toISOString() }
  })
  return event.json(200, response)
}, $apis.requireAuth("users"))

routerAdd("POST", "/api/sigad/applications/{id}/reject", (event) => {
  const auth = event.auth
  if (!auth || !auth.getBool("activo") || auth.getString("administrador") !== "admin") throw new ForbiddenError("Solo la administracion puede rechazar solicitudes.")
  const observation = (event.requestInfo().body.observacionAdmin || "").trim()
  if (!observation) throw new BadRequestError("Indica el motivo del rechazo.")
  const application = event.app.findRecordById("solicitudes", event.request.pathValue("id"))
  if (application.getString("estado") !== "pendiente") throw new BadRequestError("Esta solicitud ya fue revisada.")
  application.set("estado", "rechazado")
  application.set("observacionAdmin", observation)
  application.set("revisadoPor", auth.id)
  application.set("revisadoEn", new Date().toISOString())
  event.app.save(application)
  return event.json(200, { rejected: true })
}, $apis.requireAuth("users"))
