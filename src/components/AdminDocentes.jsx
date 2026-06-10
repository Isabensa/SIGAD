import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const pageStyles = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'radial-gradient(circle at top left, rgba(91, 45, 255, 0.32), transparent 28%), radial-gradient(circle at bottom right, rgba(255, 66, 164, 0.22), transparent 26%), #07070e',
  color: '#eef0ff'
};

const panelStyles = {
  width: '100%',
  maxWidth: '960px',
  padding: '32px',
  borderRadius: '28px',
  background: 'rgba(15, 18, 33, 0.96)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 30px 70px rgba(0, 0, 0, 0.35)',
  display: 'flex',
  flexDirection: 'column',
  gap: '28px'
};

const topActionsWrapperStyles = {
  width: '100%',
  maxWidth: '960px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '18px'
};

const actionButtonStyles = {
  border: 'none',
  borderRadius: '18px',
  padding: '12px 22px',
  background: 'linear-gradient(135deg, #8d6bff 0%, #ff3d9b 100%)',
  color: '#ffffff',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  boxShadow: '0 18px 32px rgba(143, 76, 255, 0.22)'
};

const secondaryButtonStyles = {
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '16px',
  padding: '10px 16px',
  background: 'rgba(255,255,255,0.05)',
  color: '#c7d0ff',
  fontWeight: 600,
  cursor: 'pointer'
};

const titleStyles = {
  margin: 0,
  fontSize: '2rem',
  letterSpacing: '0.06em'
};

const subtitleStyles = {
  margin: '10px 0 0',
  color: '#9da3bf',
  fontSize: '0.95rem'
};

const tableStyles = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  overflow: 'hidden',
  background: 'rgba(255,255,255,0.02)',
  marginTop: '20px'
};

const thStyles = {
  padding: '14px 16px',
  textAlign: 'left',
  color: '#d7dcff',
  fontWeight: 700,
  fontSize: '0.95rem',
  background: 'rgba(255, 255, 255, 0.05)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
};

const tdStyles = {
  padding: '14px 16px',
  color: '#eef0ff',
  fontSize: '0.95rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  background: 'rgba(18, 24, 51, 0.6)'
};

function AdminDocentes({ pb, logout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const adminValue = pb?.authStore?.model?.administrador || '';
  const normalizedAdminValue = adminValue.toString().trim().toLowerCase();

  const isAuthorized =
    normalizedAdminValue === 'admin' ||
    normalizedAdminValue === 'administración';

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      if (!isAuthorized) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const records = await pb.collection('users').getFullList({
          sort: 'email'
        });

        if (isMounted) {
          setUsers(records);
        }
      } catch (error) {
        console.error('Error al cargar docentes:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [pb, isAuthorized]);

  const reloadUsers = async () => {
    try {
      setLoading(true);

      const records = await pb.collection('users').getFullList({
        sort: 'email'
      });

      setUsers(records);
    } catch (error) {
      console.error('Error al recargar docentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (user) => {
    try {
      await pb.collection('users').update(user.id, {
        activo: !user.activo
      });

      await reloadUsers();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }

    navigate('/login');
  };

  if (!isAuthorized) {
    return (
      <main style={pageStyles}>
        <div style={panelStyles}>
          <h1 style={titleStyles}>Acceso no autorizado</h1>
          <p style={subtitleStyles}>No tienes los permisos necesarios para ver esta página.</p>

          <button style={{ ...actionButtonStyles, marginTop: '20px' }} type="button" onClick={() => navigate('/dashboard')}>
            Volver al dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyles}>
      <div style={topActionsWrapperStyles}>
        <button style={secondaryButtonStyles} type="button" onClick={() => navigate('/dashboard')}>
          Volver al dashboard
        </button>

        <button style={{ ...secondaryButtonStyles, color: '#ff6b9d' }} type="button" onClick={handleLogout}>
          Salir del sistema
        </button>
      </div>

      <div style={panelStyles}>
        <header>
          <h1 style={titleStyles}>Administración de docentes</h1>
          <p style={subtitleStyles}>Gestiona el acceso de los docentes al sistema.</p>
        </header>

        {loading ? (
          <p style={{ color: '#9da3bf' }}>Cargando docentes...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyles}>
              <thead>
                <tr>
                  <th style={thStyles}>Email</th>
                  <th style={thStyles}>Nombre</th>
                  <th style={thStyles}>Activo</th>
                  <th style={thStyles}>Rol</th>
                  <th style={thStyles}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={tdStyles}>{user.email}</td>
                    <td style={tdStyles}>{user.name || 'Sin nombre'}</td>
                    <td style={tdStyles}>
                      <span
                        style={{
                          color: user.activo ? '#4caf50' : '#f44336',
                          fontWeight: 700
                        }}
                      >
                        {user.activo ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td style={tdStyles}>{user.administrador || 'Docente'}</td>
                    <td style={tdStyles}>
                      <button
                        style={{
                          ...secondaryButtonStyles,
                          fontSize: '0.85rem',
                          padding: '6px 12px',
                          borderColor: user.activo ? 'rgba(244, 67, 54, 0.4)' : 'rgba(76, 175, 80, 0.4)',
                          color: user.activo ? '#ff8a80' : '#b9f6ca'
                        }}
                        type="button"
                        onClick={() => handleToggleActivo(user)}
                      >
                        {user.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p style={{ color: '#9da3bf', marginTop: '18px' }}>
                No hay docentes cargados.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminDocentes;