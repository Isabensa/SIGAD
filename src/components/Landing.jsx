import { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getPublicApplicationStatus, submitApplication } from '../services/applicationService';

const plans = [
  { months: '1', name: 'Mensual', price: 10000, detail: 'Flexibilidad mes a mes', discount: 'Precio base' },
  { months: '4', name: 'Cuatrimestral', price: 36000, detail: 'Equivale a $9.000 por mes', discount: '10 % de descuento' },
  { months: '12', name: 'Anual', price: 96000, detail: 'Equivale a $8.000 por mes', discount: '20 % de descuento' }
];
const page = { minHeight: '100vh', padding: '22px', background: 'radial-gradient(circle at top left,rgba(91,45,255,.3),transparent 30%),radial-gradient(circle at bottom right,rgba(255,61,155,.2),transparent 28%),#07070e', color: '#eef0ff' };
const container = { maxWidth: '1120px', margin: '0 auto', display: 'grid', gap: '34px' };
const button = { border: 0, borderRadius: '15px', padding: '12px 18px', background: 'linear-gradient(135deg,#8d6bff,#ff3d9b)', color: '#fff', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' };
const input = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.05)', color: '#eef0ff', boxSizing: 'border-box' };

function Landing({ pb }) {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [activeModal, setActiveModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [form, setForm] = useState({ nombre: '', dni: '', email: '', telefono: '', fechaPago: '', medioPago: 'transferencia', numeroOperacion: '', comprobante: null, acepta: false });
  const [statusForm, setStatusForm] = useState({ email: '', dni: '', numeroOperacion: '' });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.comprobante || !form.acepta || !form.nombre.trim() || !form.dni.trim() || !form.email.trim() || !form.telefono.trim() || !form.fechaPago || !form.numeroOperacion.trim()) {
      await Swal.fire('Datos incompletos', 'Completa el formulario, adjunta el comprobante y acepta las condiciones.', 'warning'); return;
    }
    try {
      setSaving(true);
      const data = new FormData();
      Object.entries({ nombre: form.nombre.trim(), dni: form.dni.trim(), email: form.email.trim(), telefono: form.telefono.trim(), meses: selectedPlan.months, importe: selectedPlan.price, fechaPago: `${form.fechaPago} 12:00:00.000Z`, medioPago: form.medioPago, numeroOperacion: form.numeroOperacion.trim(), estado: 'pendiente' }).forEach(([key, value]) => data.append(key, value));
      data.append('comprobante', form.comprobante);
      await submitApplication(pb, data);
      setStatusForm({ email: form.email.trim(), dni: form.dni.trim(), numeroOperacion: form.numeroOperacion.trim() });
      setForm({ nombre: '', dni: '', email: '', telefono: '', fechaPago: '', medioPago: 'transferencia', numeroOperacion: '', comprobante: null, acepta: false });
      setActiveModal(null);
      await Swal.fire('Solicitud enviada', 'Puedes consultar el avance con tu correo, DNI y número de operación.', 'success');
    } catch (error) {
      console.error(error);
      await Swal.fire('No se pudo enviar', error?.response?.message || 'Revisa los datos e intenta nuevamente.', 'error');
    } finally { setSaving(false); }
  };

  const checkStatus = async (event) => {
    event.preventDefault();
    if (!statusForm.email.trim() || !statusForm.dni.trim() || !statusForm.numeroOperacion.trim()) {
      await Swal.fire('Datos incompletos', 'Completa los tres datos de la solicitud.', 'warning');
      return;
    }

    try {
      setCheckingStatus(true);
      setApplicationStatus(null);
      const result = await getPublicApplicationStatus(pb, {
        email: statusForm.email.trim(),
        dni: statusForm.dni.trim(),
        numeroOperacion: statusForm.numeroOperacion.trim()
      });
      setApplicationStatus(result);
    } catch (error) {
      await Swal.fire('Solicitud no encontrada', error?.response?.message || 'Verifica los datos e intenta nuevamente.', 'info');
    } finally {
      setCheckingStatus(false);
    }
  };

  const statusLabels = { pendiente: 'Pendiente de revisión', aprobado: 'Aprobada', rechazado: 'Rechazada' };
  const planLabels = { 1: 'Mensual', 4: 'Cuatrimestral', 12: 'Anual' };

  return <main style={page} className="landing-page"><div style={container} className="landing-container">
    <header className="landing-header"><strong className="landing-brand">SIGAD</strong><div className="landing-header-actions"><button type="button" className="landing-button landing-button-secondary" onClick={() => { setApplicationStatus(null); setActiveModal('status'); }}>Consultar solicitud</button><Link to="/login" className="landing-button landing-button-primary">Acceder</Link></div></header>
    <section className="landing-hero">
      <div className="landing-hero-copy"><p className="landing-eyebrow">Gestión docente simple y segura</p><h1>Tus cursos, alumnos y asistencias en un solo lugar.</h1><p className="landing-lead">Administra hasta 10 cursos desde cualquier dispositivo. Elige un plan, informa tu pago y solicita tu espacio.</p><button type="button" className="landing-button landing-button-primary" onClick={() => setActiveModal('request')}>Solicitar mi espacio</button></div>
      <div className="landing-surface landing-hero-image"><img src="/images/sigad-hero.png" alt="Sistema SIGAD en una computadora futurista" /></div>
    </section>
    <section className="landing-about" aria-labelledby="landing-about-title">
      <div><p className="landing-eyebrow">Qué es SIGAD</p><h2 id="landing-about-title">Una herramienta pensada para la tarea docente cotidiana.</h2><p>SIGAD centraliza la gestión académica para que cada docente pueda organizar cursos, registrar alumnos, tomar asistencia y consultar estadísticas desde un único espacio.</p></div>
      <div className="landing-feature-list"><span>Hasta 10 cursos activos</span><span>Asistencia y estadísticas</span><span>Acceso desde cualquier dispositivo</span></div>
    </section>
    <section className="landing-section"><div className="landing-section-heading"><p className="landing-eyebrow">Planes simples</p><h2>Elige el espacio que mejor se adapte a ti</h2><p>Todos los planes incluyen las mismas funciones. Solo cambia el período contratado.</p></div><div className="landing-plan-grid">{plans.map((plan) => <article key={plan.months} className={`landing-plan-card ${selectedPlan.months === plan.months ? 'is-selected' : ''}`}><p className="landing-plan-discount">{plan.discount}</p><h3>{plan.name}</h3><strong>${plan.price.toLocaleString('es-AR')}</strong><p>{plan.detail}</p><button type="button" className="landing-button landing-button-primary" onClick={() => { setSelectedPlan(plan); setActiveModal('request'); }}>Elegir plan</button></article>)}</div></section>
    <section className="commercial-info" aria-labelledby="commercial-info-title">
      <h2 id="commercial-info-title">Información útil</h2>
      <p className="commercial-info-intro">Todo lo importante sobre el servicio, disponible cuando lo necesites.</p>
      <div className="commercial-info-menu">
        <button type="button" onClick={() => setActiveModal('info-payment')}><span>Pagos</span><small>Medios y comprobantes</small></button>
        <button type="button" onClick={() => setActiveModal('info-terms')}><span>Condiciones</span><small>Uso y renovación</small></button>
        <button type="button" onClick={() => setActiveModal('info-privacy')}><span>Privacidad</span><small>Tratamiento de datos</small></button>
        <button type="button" onClick={() => setActiveModal('info-contact')}><span>Contacto</span><small>Consultas y soporte</small></button>
      </div>
    </section>
    <footer className="landing-footer"><div><strong>SIGAD</strong><span>Gestión académica para docentes</span></div><a href="mailto:bensadoncelia@gmail.com">bensadoncelia@gmail.com</a><span>© 2026 SIGAD</span></footer>
    {activeModal === 'request' && <div className="landing-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setActiveModal(null); }}>
      <section className="landing-modal" role="dialog" aria-modal="true" aria-labelledby="request-modal-title">
        <div className="landing-modal-header"><div><h2 id="request-modal-title">Solicitar mi espacio</h2><p>Plan seleccionado: <strong>{selectedPlan.name} por ${selectedPlan.price.toLocaleString('es-AR')}</strong></p></div><button type="button" className="landing-modal-close" aria-label="Cerrar solicitud" disabled={saving} onClick={() => setActiveModal(null)}>×</button></div>
        <form onSubmit={submit} className="landing-modal-form">
          <label>Nombre y apellido<input style={input} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} disabled={saving} /></label><label>DNI<input style={input} value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} disabled={saving} /></label><label>Correo electrónico<input style={input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={saving} /></label><label>Teléfono<input style={input} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} disabled={saving} /></label><label>Fecha del pago<input style={input} type="date" value={form.fechaPago} onChange={(e) => setForm({ ...form, fechaPago: e.target.value })} disabled={saving} /></label><label>Medio de pago<select style={input} value={form.medioPago} onChange={(e) => setForm({ ...form, medioPago: e.target.value })} disabled={saving}><option value="transferencia">Transferencia</option><option value="deposito">Depósito</option><option value="otro">Otro</option></select></label><label>Número de operación<input style={input} value={form.numeroOperacion} onChange={(e) => setForm({ ...form, numeroOperacion: e.target.value })} disabled={saving} /></label><label>Comprobante<input style={input} type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setForm({ ...form, comprobante: e.target.files?.[0] || null })} disabled={saving} /></label>
          <label className="landing-modal-consent"><input type="checkbox" checked={form.acepta} onChange={(e) => setForm({ ...form, acepta: e.target.checked })} disabled={saving} /> Declaro que los datos y el comprobante son correctos, y acepto las condiciones del servicio y el tratamiento de datos.</label>
          <button className="busy-button" style={button} disabled={saving}>{saving && <span className="button-spinner" aria-hidden="true" />}{saving ? 'Enviando...' : 'Enviar solicitud'}</button>
        </form>
      </section>
    </div>}
    {activeModal === 'status' && <div className="landing-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !checkingStatus) setActiveModal(null); }}>
      <section className="landing-modal landing-modal-small" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
        <div className="landing-modal-header"><div><h2 id="status-modal-title">Consultar mi solicitud</h2><p>Ingresa los mismos datos utilizados al solicitar tu espacio.</p></div><button type="button" className="landing-modal-close" aria-label="Cerrar consulta" disabled={checkingStatus} onClick={() => setActiveModal(null)}>×</button></div>
        <form onSubmit={checkStatus} className="landing-modal-form landing-status-form">
          <label>Correo electrónico<input style={input} type="email" value={statusForm.email} onChange={(e) => setStatusForm({ ...statusForm, email: e.target.value })} disabled={checkingStatus} /></label>
          <label>DNI<input style={input} value={statusForm.dni} onChange={(e) => setStatusForm({ ...statusForm, dni: e.target.value })} disabled={checkingStatus} /></label>
          <label>Número de operación<input style={input} value={statusForm.numeroOperacion} onChange={(e) => setStatusForm({ ...statusForm, numeroOperacion: e.target.value })} disabled={checkingStatus} /></label>
          <button className="busy-button" style={button} disabled={checkingStatus}>{checkingStatus && <span className="button-spinner" aria-hidden="true" />}{checkingStatus ? 'Consultando...' : 'Consultar estado'}</button>
        </form>
        {applicationStatus && <article className={`public-application-status status-${applicationStatus.estado}`} role="status"><div><small>Estado</small><strong>{statusLabels[applicationStatus.estado] || applicationStatus.estado}</strong></div><div><small>Plan solicitado</small><strong>{planLabels[applicationStatus.meses] || `${applicationStatus.meses} meses`}</strong></div><div><small>Solicitud enviada</small><strong>{new Date(applicationStatus.creadaEn).toLocaleDateString('es-AR')}</strong></div>{applicationStatus.observacionAdmin && <p><strong>Respuesta de administración:</strong> {applicationStatus.observacionAdmin}</p>}</article>}
      </section>
    </div>}
    {activeModal?.startsWith('info-') && <div className="landing-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveModal(null); }}>
      <section className="landing-modal landing-modal-small commercial-modal" role="dialog" aria-modal="true" aria-labelledby="commercial-modal-title">
        <div className="landing-modal-header">
          <div>
            <p className="commercial-modal-eyebrow">Información de SIGAD</p>
            <h2 id="commercial-modal-title">{{
              'info-payment': 'Medios y datos de pago',
              'info-terms': 'Condiciones del servicio',
              'info-privacy': 'Privacidad y tratamiento de datos',
              'info-contact': 'Contacto'
            }[activeModal]}</h2>
          </div>
          <button type="button" className="landing-modal-close" aria-label="Cerrar información" onClick={() => setActiveModal(null)}>×</button>
        </div>
        <div className="commercial-modal-content">
          {activeModal === 'info-payment' && <><p>Se aceptan transferencias y depósitos. Si utilizas otro medio, debes coordinarlo previamente con la administración.</p><p>Los datos de la cuenta de destino se solicitan por correo a <a href="mailto:bensadoncelia@gmail.com">bensadoncelia@gmail.com</a>.</p><p>Para validar el pago deberás informar la fecha, el número de operación y adjuntar un comprobante legible.</p></>}
          {activeModal === 'info-terms' && <><p>Cada espacio docente permite gestionar hasta 10 cursos activos. La habilitación comienza cuando la administración aprueba el pago.</p><p>La duración corresponde al plan contratado. No hay renovación automática: para continuar, el docente debe informar un nuevo pago.</p><p>Al vencer la suscripción se restringe el acceso a los cursos hasta que la renovación sea aprobada.</p></>}
          {activeModal === 'info-privacy' && <><p>SIGAD solicita nombre, DNI, correo, teléfono y datos del pago para verificar la solicitud, crear la cuenta y prestar soporte.</p><p>Los comprobantes y datos personales son accesibles únicamente para la administración y no se publican en la consulta de estado.</p><p>Puedes solicitar la actualización o eliminación de tus datos escribiendo al correo de contacto, sujeto a las obligaciones administrativas aplicables.</p></>}
          {activeModal === 'info-contact' && <><p>Para consultas comerciales, datos de pago, soporte o solicitudes relacionadas con datos personales, escribe a:</p><a className="commercial-contact-link" href="mailto:bensadoncelia@gmail.com">bensadoncelia@gmail.com</a><p>Indica tu nombre y, si ya realizaste un pago, el número de operación.</p></>}
        </div>
      </section>
    </div>}
  </div></main>;
}
export default Landing;
