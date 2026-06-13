import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const page = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(circle at top left, rgba(91,45,255,.35), transparent 26%), #09090f', color: '#f7f7fb' };
const card = { width: '100%', maxWidth: '440px', padding: '34px', borderRadius: '26px', background: 'rgba(15,18,33,.96)', border: '1px solid rgba(255,255,255,.08)' };
const form = { display: 'grid', gap: '16px' };
const input = { width: '100%', boxSizing: 'border-box', marginTop: '7px', padding: '13px 15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.05)', color: '#eef0ff' };
const button = { border: 0, borderRadius: '16px', padding: '13px 18px', color: '#fff', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg,#8d6bff,#ff3d9b)' };
const link = { color: '#c9bcff', textAlign: 'center', textDecoration: 'none' };

const passwordError = (error) => {
  const data = error?.response?.data || {};
  if (data.oldPassword) return 'La contraseña actual no es correcta.';
  if (data.password || data.passwordConfirm) return 'La nueva contraseña no cumple los requisitos o no coincide.';
  return error?.response?.message || 'No se pudo actualizar la contraseña. Intenta nuevamente.';
};

export function ForgotPassword({ pb }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (!email.trim()) return Swal.fire('Correo requerido', 'Escribe el correo de tu cuenta.', 'warning');
    try {
      setSending(true);
      await pb.collection('users').requestPasswordReset(email.trim().toLowerCase());
      await Swal.fire('Solicitud enviada', 'Si el correo pertenece a una cuenta, recibirás un enlace para crear una nueva contraseña.', 'success');
    } catch (error) {
      await Swal.fire('No se pudo enviar', error?.response?.message || 'Revisa la conexión e intenta nuevamente.', 'error');
    } finally { setSending(false); }
  };
  return <main style={page}><section style={card}><h1>Recuperar contraseña</h1><p style={{ color: '#aeb4d1', lineHeight: 1.6 }}>Te enviaremos un enlace al correo registrado.</p><form style={form} onSubmit={submit}><label>Correo electrónico<input style={input} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><button style={button} disabled={sending}>{sending ? 'Enviando...' : 'Enviar enlace'}</button><Link style={link} to="/login">Volver al acceso</Link></form></section></main>;
}

export function ResetPassword({ pb }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const token = params.get('token') || '';
  const submit = async (event) => {
    event.preventDefault();
    if (!token) return Swal.fire('Enlace inválido', 'Solicita un nuevo enlace de recuperación.', 'error');
    if (password.length < 8) return Swal.fire('Contraseña muy corta', 'Utiliza al menos 8 caracteres.', 'warning');
    if (password !== confirm) return Swal.fire('Las contraseñas no coinciden', 'Revisa la confirmación.', 'warning');
    try {
      setSaving(true);
      await pb.collection('users').confirmPasswordReset(token, password, confirm);
      await Swal.fire('Contraseña actualizada', 'Ya puedes ingresar con tu nueva contraseña.', 'success');
      navigate('/login');
    } catch (error) {
      await Swal.fire('No se pudo restablecer', error?.response?.message || 'El enlace puede haber vencido. Solicita uno nuevo.', 'error');
    } finally { setSaving(false); }
  };
  return <main style={page}><section style={card}><h1>Nueva contraseña</h1><form style={form} onSubmit={submit}><label>Nueva contraseña<input style={input} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label>Repetir contraseña<input style={input} type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label><button style={button} disabled={saving}>{saving ? 'Guardando...' : 'Guardar contraseña'}</button><Link style={link} to="/login">Volver al acceso</Link></form></section></main>;
}

export function ChangePassword({ pb, logout }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ current: '', password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (!values.current || !values.password || !values.confirm) return Swal.fire('Datos incompletos', 'Completa los tres campos.', 'warning');
    if (values.password.length < 8) return Swal.fire('Contraseña muy corta', 'Utiliza al menos 8 caracteres.', 'warning');
    if (values.password !== values.confirm) return Swal.fire('Las contraseñas no coinciden', 'Revisa la confirmación.', 'warning');
    if (values.current === values.password) return Swal.fire('Elige otra contraseña', 'La nueva contraseña debe ser diferente de la actual.', 'warning');
    try {
      setSaving(true);
      await pb.collection('users').update(pb.authStore.model.id, { oldPassword: values.current, password: values.password, passwordConfirm: values.confirm });
      await Swal.fire('Contraseña actualizada', 'Por seguridad, vuelve a ingresar con tu nueva contraseña.', 'success');
      logout?.();
      navigate('/login');
    } catch (error) {
      await Swal.fire('No se pudo actualizar', passwordError(error), 'error');
    } finally { setSaving(false); }
  };
  return <main style={page}><section style={card}><h1>Seguridad de la cuenta</h1><p style={{ color: '#aeb4d1' }}>Cambia la contraseña temporal o actual.</p><form style={form} onSubmit={submit}><label>Contraseña actual<input style={input} type="password" autoComplete="current-password" value={values.current} onChange={(event) => setValues({ ...values, current: event.target.value })} /></label><label>Nueva contraseña<input style={input} type="password" autoComplete="new-password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} /></label><label>Repetir contraseña<input style={input} type="password" autoComplete="new-password" value={values.confirm} onChange={(event) => setValues({ ...values, confirm: event.target.value })} /></label><button style={button} disabled={saving}>{saving ? 'Guardando...' : 'Cambiar contraseña'}</button><button style={{ ...button, background: 'rgba(255,255,255,.08)' }} type="button" onClick={() => navigate('/dashboard')}>Volver al panel</button></form></section></main>;
}
