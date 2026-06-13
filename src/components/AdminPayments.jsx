import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { approvePayment, getPayments, openPaymentReceipt, rejectPayment } from '../services/paymentService';
import { approveApplication, getApplications, openApplicationReceipt, rejectApplication } from '../services/applicationService';

const page = { minHeight: '100vh', padding: '24px', background: '#07070e', color: '#eef0ff' };
const panel = { maxWidth: '1100px', margin: '0 auto 18px', padding: '28px', borderRadius: '26px', background: 'rgba(15,18,33,.96)', border: '1px solid rgba(255,255,255,.08)' };
const button = { border: 0, borderRadius: '14px', padding: '10px 15px', color: '#fff', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg,#8d6bff,#ff3d9b)' };
const card = { padding: '18px', borderRadius: '18px', background: 'rgba(18,24,51,.65)', border: '1px solid rgba(255,255,255,.06)' };
const planNames = { 1: 'Mensual', 4: 'Cuatrimestral', 12: 'Anual' };

function AdminPayments({ pb }) {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState('');
  const authorized = pb.authStore.model?.administrador === 'admin';
  const load = useCallback(async () => {
    if (!authorized) return;
    setLoading(true);
    try {
      const [paymentRecords, applicationRecords] = await Promise.all([getPayments(pb), getApplications(pb)]);
      setPayments(paymentRecords);
      setApplications(applicationRecords);
    } finally { setLoading(false); }
  }, [authorized, pb]);
  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, [load]);

  const approve = async (payment) => {
    const result = await Swal.fire({ title: '¿Aprobar pago?', text: `Se acreditará el plan ${planNames[payment.meses]}.`, input: 'text', inputLabel: 'Observación opcional', showCancelButton: true, confirmButtonText: 'Aprobar' });
    if (!result.isConfirmed) return;
    try { setProcessing(`payment:${payment.id}`); await approvePayment(pb, payment.id, result.value || ''); await load(); await Swal.fire('Pago aprobado', 'La suscripción fue renovada.', 'success'); } catch (error) { console.error(error); await Swal.fire('No se pudo aprobar', 'Intenta nuevamente.', 'error'); } finally { setProcessing(''); }
  };
  const reject = async (payment) => {
    const result = await Swal.fire({ title: 'Rechazar comprobante', input: 'textarea', inputLabel: 'Motivo', showCancelButton: true, inputValidator: (value) => !value?.trim() && 'Indica el motivo.' });
    if (!result.isConfirmed) return;
    try { setProcessing(`payment:${payment.id}`); await rejectPayment(pb, payment.id, result.value); await load(); } catch (error) { console.error(error); await Swal.fire('No se pudo rechazar', 'Intenta nuevamente.', 'error'); } finally { setProcessing(''); }
  };
  const approveNewAccount = async (application) => {
    const result = await Swal.fire({ title: '¿Crear cuenta docente?', text: `Se activará el plan ${planNames[application.meses]}.`, input: 'text', inputLabel: 'Observación opcional', showCancelButton: true, confirmButtonText: 'Crear y activar' });
    if (!result.isConfirmed) return;
    try {
      setProcessing(`application:${application.id}`);
      const account = await approveApplication(pb, application.id, result.value || '');
      await load();
      await Swal.fire({ title: 'Cuenta creada', html: `<p>Correo: <strong>${account.email}</strong></p><p>Contraseña temporal:</p><code style="font-size:1.1rem">${account.temporaryPassword}</code><p>Entrégala al docente. Solo se muestra ahora.</p>`, icon: 'success' });
    } catch (error) { console.error(error); await Swal.fire('No se pudo crear', error?.response?.message || 'Revisa los datos.', 'error'); } finally { setProcessing(''); }
  };
  const rejectNewAccount = async (application) => {
    const result = await Swal.fire({ title: 'Rechazar solicitud', input: 'textarea', inputLabel: 'Motivo', showCancelButton: true, inputValidator: (value) => !value?.trim() && 'Indica el motivo.' });
    if (!result.isConfirmed) return;
    try { setProcessing(`application:${application.id}`); await rejectApplication(pb, application.id, result.value); await load(); } catch (error) { console.error(error); await Swal.fire('No se pudo rechazar', 'Intenta nuevamente.', 'error'); } finally { setProcessing(''); }
  };

  if (!authorized) return <main style={page} className="app-page"><section style={panel}><h1>Acceso no autorizado</h1></section></main>;
  return <main style={page} className="app-page admin-payments-page">
    <section style={{ ...panel, display: 'flex', justifyContent: 'space-between' }}><button style={button} onClick={() => navigate('/dashboard')}>Volver</button><h1 style={{ margin: 0 }}>Revisión comercial</h1></section>
    <section style={panel}><h2>Solicitudes de nuevos docentes</h2>{loading ? <p>Cargando...</p> : applications.length === 0 ? <p>No hay solicitudes.</p> : <div style={{ display: 'grid', gap: '12px' }}>{applications.map((application) => <article key={application.id} style={card}>
      <strong>{application.nombre} · {application.email}</strong><p>DNI: {application.dni} · Teléfono: {application.telefono}</p><p>{planNames[application.meses]} · ${Number(application.importe).toLocaleString('es-AR')} · Estado: {application.estado}</p><p>Operación: {application.numeroOperacion}</p>{application.observacionAdmin && <p>Administración: {application.observacionAdmin}</p>}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}><button style={button} disabled={Boolean(processing)} onClick={() => openApplicationReceipt(pb, application)}>Ver comprobante</button>{application.estado === 'pendiente' && <><button className="busy-button" style={{ ...button, background: '#19764a' }} disabled={Boolean(processing)} onClick={() => approveNewAccount(application)}>{processing === `application:${application.id}` && <span className="button-spinner" aria-hidden="true" />}{processing === `application:${application.id}` ? 'Procesando...' : 'Crear cuenta'}</button><button style={{ ...button, background: '#8b1e3f' }} disabled={Boolean(processing)} onClick={() => rejectNewAccount(application)}>Rechazar</button></>}</div>
    </article>)}</div>}</section>
    <section style={panel}><h2>Renovaciones</h2>{loading ? <p>Cargando...</p> : payments.length === 0 ? <p>No hay comprobantes.</p> : <div style={{ display: 'grid', gap: '12px' }}>{payments.map((payment) => <article key={payment.id} style={card}>
      <strong>{payment.expand?.docenteId?.name || payment.expand?.docenteId?.email}</strong><p>{planNames[payment.meses]} · ${Number(payment.importe).toLocaleString('es-AR')} · Estado: {payment.estado}</p><p>Operación: {payment.numeroOperacion}</p>{payment.observacionAdmin && <p>Administración: {payment.observacionAdmin}</p>}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}><button style={button} disabled={Boolean(processing)} onClick={() => openPaymentReceipt(pb, payment)}>Ver comprobante</button>{payment.estado === 'pendiente' && <><button className="busy-button" style={{ ...button, background: '#19764a' }} disabled={Boolean(processing)} onClick={() => approve(payment)}>{processing === `payment:${payment.id}` && <span className="button-spinner" aria-hidden="true" />}{processing === `payment:${payment.id}` ? 'Procesando...' : 'Aprobar'}</button><button style={{ ...button, background: '#8b1e3f' }} disabled={Boolean(processing)} onClick={() => reject(payment)}>Rechazar</button></>}</div>
    </article>)}</div>}</section>
  </main>;
}
export default AdminPayments;
