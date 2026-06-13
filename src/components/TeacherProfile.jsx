import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const page = { minHeight: '100vh', padding: '24px', background: 'radial-gradient(circle at top left, rgba(91,45,255,.32), transparent 28%), #07070e', color: '#eef0ff' };
const panel = { width: '100%', maxWidth: '760px', margin: '0 auto', padding: '30px', boxSizing: 'border-box', borderRadius: '26px', background: 'rgba(15,18,33,.96)', border: '1px solid rgba(255,255,255,.08)' };
const input = { width: '100%', boxSizing: 'border-box', marginTop: '7px', padding: '13px 15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.05)', color: '#eef0ff' };
const button = { border: 0, borderRadius: '15px', padding: '12px 18px', color: '#fff', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg,#8d6bff,#ff3d9b)' };
const formatDate = (value) => value ? new Date(value).toLocaleDateString('es-AR') : 'Sin vencimiento';

function TeacherProfile({ pb }) {
  const navigate = useNavigate();
  const user = pb.authStore.model;
  const [form, setForm] = useState({ name: user?.name || '', dni: user?.dni || '', telefono: user?.telefono || '' });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.dni.trim() || !form.telefono.trim()) {
      await Swal.fire('Datos incompletos', 'Completa nombre, DNI y teléfono.', 'warning');
      return;
    }
    try {
      setSaving(true);
      const updated = await pb.collection('users').update(user.id, {
        name: form.name.trim(), dni: form.dni.trim(), telefono: form.telefono.trim()
      });
      pb.authStore.save(pb.authStore.token, updated);
      await Swal.fire('Perfil actualizado', 'Tus datos personales se guardaron correctamente.', 'success');
    } catch (error) {
      const data = error?.response?.data || {};
      const message = data.dni ? 'El DNI ingresado ya pertenece a otra cuenta.' : data.telefono ? 'El teléfono debe tener entre 8 y 20 caracteres.' : (error?.response?.message || 'Revisa los datos e intenta nuevamente.');
      await Swal.fire('No se pudo actualizar', message, 'error');
    } finally { setSaving(false); }
  };

  return <main style={page} className="app-page profile-page">
    <div style={{ ...panel, marginBottom: '18px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <button style={button} type="button" onClick={() => navigate('/dashboard')} disabled={saving}>Volver al panel</button>
      <button style={{ ...button, background: 'rgba(255,255,255,.08)' }} type="button" onClick={() => navigate('/seguridad')} disabled={saving}>Cambiar contraseña</button>
    </div>
    <section style={panel} className="app-shell app-form-panel">
      <h1 style={{ marginTop: 0 }}>Mi perfil</h1>
      <p style={{ color: '#9da3bf' }}>Actualiza tus datos de contacto. El correo y la suscripción son administrados por SIGAD.</p>
      <div className="profile-summary">
        <div><small>Correo</small><strong>{user?.email}</strong></div>
        <div><small>Estado</small><strong>{user?.suscripcionEstado || '-'}</strong></div>
        <div><small>Vencimiento</small><strong>{user?.suscripcionEstado === 'exento' ? 'Exento' : formatDate(user?.suscripcionHasta)}</strong></div>
      </div>
      <form onSubmit={submit} style={{ display: 'grid', gap: '17px', marginTop: '24px' }}>
        <label>Nombre completo<input style={input} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} disabled={saving} /></label>
        <label>DNI<input style={input} value={form.dni} onChange={(event) => setForm({ ...form, dni: event.target.value })} disabled={saving} /></label>
        <label>Teléfono<input style={input} value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} disabled={saving} /></label>
        <button className="busy-button" style={button} disabled={saving}>{saving && <span className="button-spinner" aria-hidden="true" />}{saving ? 'Guardando...' : 'Guardar perfil'}</button>
      </form>
    </section>
  </main>;
}

export default TeacherProfile;
