import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/',            label: 'Dashboard'   },
    { to: '/products',    label: 'Products'    },
    { to: '/brands',      label: 'Brands'      },
    { to: '/sales',       label: 'Sales'       },
    { to: '/billing',     label: 'New Bill'    },
    { to: '/low-stock',   label: '⚠ Low Stock' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>🔧 HardwareStore</div>
      <div style={styles.links}>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            style={{ ...styles.link, ...(pathname === l.to ? styles.active : {}) }}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div style={styles.user}>
        <span style={styles.role}>{user?.role?.toUpperCase()}</span>
        <span style={styles.username}>{user?.username}</span>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav:       { display:'flex', alignItems:'center', justifyContent:'space-between', background:'#1e293b', padding:'0 24px', height:56, position:'sticky', top:0, zIndex:100 },
  brand:     { color:'#f97316', fontWeight:700, fontSize:18, letterSpacing:1 },
  links:     { display:'flex', gap:4 },
  link:      { color:'#94a3b8', textDecoration:'none', padding:'6px 14px', borderRadius:6, fontSize:14, transition:'all .2s' },
  active:    { color:'#fff', background:'#334155' },
  user:      { display:'flex', alignItems:'center', gap:10 },
  role:      { background:'#f97316', color:'#fff', borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:700 },
  username:  { color:'#cbd5e1', fontSize:14 },
  logoutBtn: { background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'5px 14px', cursor:'pointer', fontSize:13 },
};

export default Navbar;
