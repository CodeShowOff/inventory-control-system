import { useLocation, useNavigate } from 'react-router-dom';

export default function TopNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const token = localStorage.getItem('token');

  return (
    <div style={{ width: '100%', background: '#1976d2', color: '#fff', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ marginLeft: 24, fontWeight: 'bold', fontSize: 20, letterSpacing: 1 }}>
        Inventory Control System
      </div>
      <div style={{ marginRight: 24 }}>
        {isHome ? (
          token ? (
            <button
              style={{ background: '#fff', color: '#1976d2', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              style={{ background: '#fff', color: '#1976d2', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          )
        ) : (
          <button
            style={{ background: '#fff', color: '#1976d2', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => navigate('/')}
          >
            Home
          </button>
        )}
      </div>
    </div>
  );
}
