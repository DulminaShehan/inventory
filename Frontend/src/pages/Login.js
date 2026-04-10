import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const [form, setForm]   = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/users/login', form);
      login(data.user, data.token);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🔧</div>
        <h2 style={styles.title}>Hardware Store</h2>
        <p style={styles.sub}>Inventory & Billing System</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="Enter username"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>
          <button style={styles.btn} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.registerLink}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0f172a,#1e293b)' },
  card:  { background:'#fff', borderRadius:16, padding:'40px 36px', width:360, boxShadow:'0 20px 60px rgba(0,0,0,.4)', textAlign:'center' },
  logo:  { fontSize:48, marginBottom:8 },
  title: { margin:'0 0 4px', color:'#1e293b', fontSize:22, fontWeight:700 },
  sub:   { margin:'0 0 28px', color:'#94a3b8', fontSize:13 },
  field: { textAlign:'left', marginBottom:16 },
  label: { display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:'#374151' },
  input: { width:'100%', padding:'10px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, boxSizing:'border-box', outline:'none' },
  btn:          { width:'100%', padding:'12px', background:'#f97316', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:700, cursor:'pointer', marginTop:8 },
  registerLink: { marginTop:20, fontSize:13, color:'#94a3b8' },
  link:         { color:'#f97316', fontWeight:600 },
};

export default Login;
