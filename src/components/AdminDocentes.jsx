import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const pageStyles = {
  minHeight: '100vh', padding: '24px', background: '#07070e', color: '#eef0ff'
};

const panelStyles = {
  width: '100%', maxWidth: '1180px', margin: '0 auto', padding: '30px',
  borderRadius: '28px', background: 'rgba(15, 18, 33, 0.96)',
  border: '1px solid rgba(255,255,255,0.08)', boxSizing: 'border-box'
};

const buttonStyles = {
  border: 'none', borderRadius: '16px', padding: '11px 18px', color: '#fff',
  fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #8d6bff, #ff3d9b)'
};

const secondaryButtonStyles = {
  border: '1px solid rgba(255,255,255,0.14)', borderRadius: '13px', padding: '8px 12px',
  background: 'rgba(255,255,255,0.05)', color: '#d7dcff', fontWeight: 600, cursor: 'pointer'
};

const inputStyles = {
  width: '100%', padding: '11px 13px', borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)',
  color: '#eef0ff', boxSizing: 'border-box'
};

const thStyles = {
  padding: '12px', textAlign: 'left', color: '#d7dcff', background: 'rgba(255,255,255,0.05)'
};

const tdStyles = {
  padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(18,24,51,0.55)', verticalAlign: 'middle'
};

const emptyForm = {
  name: '', email: '', dni: '', telefono: '', password: '', suscripcionHasta: ''
};

function AdminDocentes({ pb, logout }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courseCounts, setCourseCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingUser, setProcessingUser] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const isAuthorized = pb?.authStore?.model?.administrador === 'admin';
  const isAdmin = (user) => user?.administrador === 'admin';

  const reloadData = useCallback(async () => {
    if (!isAuthorized) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [records, courses] = await Promise.all([
        pb.collection('users').getFullList({ sort: 'email', requestKey: null }),
        pb.collection('cursos').getFullList({ requestKey: null })
      ]);
      const counts = {};
      courses.forEach((course) => {
        if (course.docenteId && !course.archivado) {
          counts[course.docenteId] = (counts[course.docenteId] || 0) + 1;
        }
      });
      setUsers(records);
      setCourseCounts(counts);
    } catch (error) {
      console.error('Error al cargar docentes:', error);
      await Swal.fire('No se pudo cargar', 'Revisa la conexión con PocketBase.', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, pb]);

  useEffect(() => {
    const timer = window.setTimeout(reloadData, 0);
    return () => window.clearTimeout(timer);
  }, [reloadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    const values = Object.values(formData);
    if (values.some((value) => !value.trim())) {
      await Swal.fire('Datos incompletos', 'Completa todos los campos.', 'warning');
      return;
    }

    try {
      setSaving(true);
      await pb.collection('users').create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        emailVisibility: true,
        password: formData.password,
        passwordConfirm: formData.password,
        dni: formData.dni.trim(),
        telefono: formData.telefono.trim(),
        administrador: 'docente',
        activo: true,
        suscripcionEstado: 'activo',
        suscripcionDesde: new Date().toISOString(),
        suscripcionHasta: `${formData.suscripcionHasta} 23:59:59.000Z`
      });
      setFormData(emptyForm);
      setShowForm(false);
      await reloadData();
      await Swal.fire('Docente creado', 'El espacio comercial quedó habilitado.', 'success');
    } catch (error) {
      console.error('Error al crear docente:', error);
      await Swal.fire('No se pudo crear', 'Verifica email, DNI, teléfono y contraseña.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRenew = async (user) => {
    const { value } = await Swal.fire({
      title: 'Renovar espacio', input: 'date', inputLabel: 'Nueva fecha de vencimiento',
      inputValue: user.suscripcionHasta?.slice(0, 10) || '', showCancelButton: true,
      confirmButtonText: 'Renovar', cancelButtonText: 'Cancelar',
      inputValidator: (date) => !date && 'Selecciona una fecha.'
    });
    if (!value) return;

    try {
      setProcessingUser(user.id);
      await pb.collection('users').update(user.id, {
        activo: true,
        suscripcionEstado: 'activo',
        suscripcionHasta: `${value} 23:59:59.000Z`
      });
      await reloadData();
      await Swal.fire('Espacio renovado', 'La nueva vigencia quedó registrada.', 'success');
    } catch (error) {
      console.error('Error al renovar:', error);
      await Swal.fire('No se pudo renovar', 'Intenta nuevamente.', 'error');
    } finally {
      setProcessingUser('');
    }
  };

  const handleToggle = async (user) => {
    const activate = !user.activo;
    try {
      setProcessingUser(user.id);
      await pb.collection('users').update(user.id, {
        activo: activate,
        suscripcionEstado: activate ? 'activo' : 'suspendido'
      });
      await reloadData();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      await Swal.fire('No se pudo actualizar', 'Intenta nuevamente.', 'error');
    } finally {
      setProcessingUser('');
    }
  };

  const handleLogout = () => {
    logout?.();
    navigate('/login');
  };

  const formatDate = (value) => value
    ? new Date(value).toLocaleDateString('es-AR')
    : 'Sin vencimiento';

  if (!isAuthorized) {
    return (
      <main style={pageStyles} className="app-page">
        <div style={panelStyles}>
          <h1>Acceso no autorizado</h1>
          <button style={buttonStyles} type="button" onClick={() => navigate('/dashboard')}>Volver</button>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyles} className="app-page admin-teachers-page">
      <div style={{ ...panelStyles, marginBottom: '18px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <button style={secondaryButtonStyles} type="button" onClick={() => navigate('/dashboard')}>Volver</button>
        <button style={{ ...secondaryButtonStyles, color: '#ff8a80' }} type="button" onClick={handleLogout}>Salir</button>
      </div>

      <div style={panelStyles}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0 }}>Administración de docentes</h1>
            <p style={{ marginTop: '8px', color: '#9da3bf' }}>Gestiona espacios, vigencias y cupos comerciales.</p>
          </div>
          <button style={buttonStyles} type="button" onClick={() => setShowForm((value) => !value)}>
            {showForm ? 'Cancelar alta' : 'Nuevo docente'}
          </button>
        </header>

        {showForm && (
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginTop: '24px' }}>
            <input style={inputStyles} name="name" placeholder="Nombre completo" value={formData.name} onChange={handleChange} />
            <input style={inputStyles} name="email" type="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} />
            <input style={inputStyles} name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange} />
            <input style={inputStyles} name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} />
            <input style={inputStyles} name="password" type="password" placeholder="Contraseña inicial" value={formData.password} onChange={handleChange} />
            <label style={{ color: '#d7dcff', fontSize: '0.85rem' }}>
              Vencimiento
              <input style={{ ...inputStyles, marginTop: '6px' }} name="suscripcionHasta" type="date" value={formData.suscripcionHasta} onChange={handleChange} />
            </label>
            <button style={buttonStyles} type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear y habilitar'}</button>
          </form>
        )}

        {loading ? <p style={{ marginTop: '24px' }}>Cargando docentes...</p> : (
          <div style={{ overflowX: 'auto', marginTop: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead><tr>
                <th style={thStyles}>Docente</th><th style={thStyles}>Activo</th>
                <th style={thStyles}>Suscripción</th><th style={thStyles}>Vencimiento</th>
                <th style={thStyles}>Cursos</th><th style={thStyles}>Acciones</th>
              </tr></thead>
              <tbody>{users.map((user) => (
                <tr key={user.id}>
                  <td style={tdStyles}><strong>{user.name || 'Sin nombre'}</strong><br /><small>{user.email}</small></td>
                  <td style={tdStyles}>{user.activo ? 'Sí' : 'No'}</td>
                  <td style={tdStyles}>{user.suscripcionEstado || 'Sin definir'}</td>
                  <td style={tdStyles}>{isAdmin(user) ? 'Exento' : formatDate(user.suscripcionHasta)}</td>
                  <td style={tdStyles}>{courseCounts[user.id] || 0} / 10</td>
                  <td style={tdStyles}>{isAdmin(user) ? 'Administrador protegido' : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="busy-button" style={secondaryButtonStyles} type="button" disabled={Boolean(processingUser)} onClick={() => handleRenew(user)}>{processingUser === user.id && <span className="button-spinner" aria-hidden="true" />}{processingUser === user.id ? 'Procesando...' : 'Renovar'}</button>
                      <button style={{ ...secondaryButtonStyles, color: user.activo ? '#ff8a80' : '#b9f6ca' }} type="button" disabled={Boolean(processingUser)} onClick={() => handleToggle(user)}>
                        {processingUser === user.id ? 'Espera...' : user.activo ? 'Suspender' : 'Activar'}
                      </button>
                    </div>
                  )}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminDocentes;
