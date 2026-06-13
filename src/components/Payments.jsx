import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getPayments, openPaymentReceipt, submitPayment } from '../services/paymentService';

const page = { minHeight: '100vh', padding: '24px', background: '#07070e', color: '#eef0ff' };
const panel = { maxWidth: '980px', margin: '0 auto 18px', padding: '28px', borderRadius: '26px', background: 'rgba(15,18,33,.96)', border: '1px solid rgba(255,255,255,.08)' };
const input = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.05)', color: '#eef0ff', boxSizing: 'border-box' };
const button = { border: 0, borderRadius: '14px', padding: '11px 17px', color: '#fff', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg,#8d6bff,#ff3d9b)' };
const card = { padding: '18px', borderRadius: '18px', background: 'rgba(18,24,51,.65)', border: '1px solid rgba(255,255,255,.06)' };
const plans = {
  1: { name: 'Mensual', price: 10000, discount: 'Sin descuento' },
  4: { name: 'Cuatrimestral', price: 36000, discount: '10 % de descuento' },
  12: { name: 'Anual', price: 96000, discount: '20 % de descuento' }
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('es-AR') : '-';

function Payments({ pb, logout }) {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fechaPago: '', medioPago: 'transferencia', numeroOperacion: '', meses: '1', observacionDocente: '', comprobante: null });
  const pending = payments.some((payment) => payment.estado === 'pendiente');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setPayments(await getPayments(pb));
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      await Swal.fire('No se pudo cargar', 'Intenta nuevamente.', 'error');
    } finally {
      setLoading(false);
    }
  }, [pb]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.comprobante || !form.fechaPago || !form.numeroOperacion.trim()) {
      await Swal.fire('Datos incompletos', 'Completa los datos y adjunta el comprobante.', 'warning');
      return;
    }
    try {
      setSaving(true);
      const data = new FormData();
      data.append('docenteId', pb.authStore.model.id);
      data.append('importe', plans[form.meses].price);
      data.append('fechaPago', `${form.fechaPago} 12:00:00.000Z`);
      data.append('medioPago', form.medioPago);
      data.append('numeroOperacion', form.numeroOperacion.trim());
      data.append('meses', form.meses);
      data.append('observacionDocente', form.observacionDocente.trim());
      data.append('estado', 'pendiente');
      data.append('comprobante', form.comprobante);
      await submitPayment(pb, data);
      setForm({ fechaPago: '', medioPago: 'transferencia', numeroOperacion: '', meses: '1', observacionDocente: '', comprobante: null });
      await load();
      await Swal.fire('Comprobante enviado', 'La administración revisará el pago.', 'success');
    } catch (error) {
      console.error('Error al informar pago:', error);
      await Swal.fire('No se pudo enviar', error?.response?.message || 'Revisa el archivo y los datos.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return <main style={page} className="app-page payments-page">
    <div style={{ ...panel, display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button style={button} type="button" disabled={saving} onClick={() => navigate('/dashboard')}>Volver al panel</button>
        <button style={button} type="button" disabled={saving} onClick={() => navigate('/perfil')}>Mi perfil</button>
      </div>
      <button style={{ ...button, background: '#55233b' }} type="button" disabled={saving} onClick={() => { logout?.(); navigate('/login'); }}>Salir</button>
    </div>
    <section style={panel}>
      <h1 style={{ marginTop: 0 }}>Pagos y suscripción</h1>
      <p style={{ color: '#9da3bf' }}>Vencimiento actual: {formatDate(pb.authStore.model?.suscripcionHasta)}</p>
      {pending ? <p style={{ ...card, color: '#ffe082' }}>Tienes un comprobante pendiente de revisión.</p> : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '14px' }}>
          <div style={card}><strong>{plans[form.meses].name}: ${plans[form.meses].price.toLocaleString('es-AR')}</strong><p style={{ marginBottom: 0, color: '#b9f6ca' }}>{plans[form.meses].discount}</p></div>
          <label>Fecha del pago<input style={input} type="date" value={form.fechaPago} onChange={(e) => setForm({ ...form, fechaPago: e.target.value })} /></label>
          <label>Medio de pago<select style={input} value={form.medioPago} onChange={(e) => setForm({ ...form, medioPago: e.target.value })}><option value="transferencia">Transferencia</option><option value="deposito">Depósito</option><option value="otro">Otro</option></select></label>
          <label>Plan<select style={input} value={form.meses} onChange={(e) => setForm({ ...form, meses: e.target.value })}><option value="1">Mensual - $10.000</option><option value="4">Cuatrimestral - $36.000</option><option value="12">Anual - $96.000</option></select></label>
          <label>Número de operación<input style={input} value={form.numeroOperacion} onChange={(e) => setForm({ ...form, numeroOperacion: e.target.value })} /></label>
          <label>Comprobante<input style={input} type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setForm({ ...form, comprobante: e.target.files?.[0] || null })} /></label>
          <label style={{ gridColumn: '1 / -1' }}>Observación<textarea style={{ ...input, minHeight: '80px' }} value={form.observacionDocente} onChange={(e) => setForm({ ...form, observacionDocente: e.target.value })} /></label>
          <button style={button} type="submit" disabled={saving}>{saving ? 'Enviando...' : 'Enviar comprobante'}</button>
        </form>
      )}
    </section>
    <section style={panel}>
      <h2>Historial</h2>
      {loading ? <p>Cargando...</p> : payments.length === 0 ? <p>No hay pagos informados.</p> : <div style={{ display: 'grid', gap: '12px' }}>{payments.map((payment) => <article key={payment.id} style={card}>
        <strong>{plans[payment.meses]?.name || `${payment.meses} meses`} · ${Number(payment.importe).toLocaleString('es-AR')}</strong>
        <p>Estado: {payment.estado} · Pago: {formatDate(payment.fechaPago)}</p>
        {payment.observacionAdmin && <p>Respuesta: {payment.observacionAdmin}</p>}
        <button style={button} type="button" onClick={() => openPaymentReceipt(pb, payment)}>Ver comprobante</button>
      </article>)}</div>}
    </section>
  </main>;
}

export default Payments;
