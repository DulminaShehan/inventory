import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-toastify';

const ROLES = ['staff', 'admin'];

const Register = () => {
  const { login } = useAuth();
  const [form, setForm]     = useState({ username: '', password: '', confirm: '', role: 'staff' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.username.trim())       e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'At least 3 characters';

    if (!form.password)              e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';

    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await API.post('/users/register', {
        username: form.username.trim(),
        password: form.password,
        role:     form.role,
      });
      toast.success(`Account created! Welcome, ${data.user.username}!`);
      login(data.user, data.token);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value:    form[key],
    onChange: (e) => {
      setForm({ ...form, [key]: e.target.value });
      if (errors[key]) setErrors({ ...errors, [key]: '' });
    },
  });

  // Password strength indicator
  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6)                        return { label: 'Weak',   color: '#ef4444', width: '30%' };
    if (p.length < 10)                       return { label: 'Fair',   color: '#f97316', width: '60%' };
    if (/[A-Z]/.test(p) && /\d/.test(p))    return { label: 'Strong', color: '#10b981', width: '100%' };
    return                                          { label: 'Good',   color: '#3b82f6', width: '80%' };
  })();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.logo}>🔧</div>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.sub}>Hardware Store — Inventory & Billing</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={{ ...styles.input, ...(errors.username ? styles.inputError : {}) }}
              placeholder="Enter username (min 3 chars)"
              autoComplete="username"
              {...field('username')}
              required
            />
            {errors.username && <span style={styles.error}>{errors.username}</span>}
          </div>

          {/* Role */}
          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <div style={styles.roleRow}>
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  style={{ ...styles.roleBtn, ...(form.role === r ? styles.roleBtnActive : {}) }}
                  onClick={() => setForm({ ...form, role: r })}
                >
                  {r === 'admin' ? '👑 Admin' : '👤 Staff'}
                </button>
              ))}
            </div>
            <span style={styles.roleHint}>
              {form.role === 'admin'
                ? 'Full access: manage products, view all sales'
                : 'Can create bills and view products'}
            </span>
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
              type="password"
              placeholder="Min 6 characters"
              autoComplete="new-password"
              {...field('password')}
              required
            />
            {/* Strength bar */}
            {strength && (
              <div style={styles.strengthWrap}>
                <div style={styles.strengthBar}>
                  <div style={{ ...styles.strengthFill, width: strength.width, background: strength.color }} />
                </div>
                <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</span>
              </div>
            )}
            {errors.password && <span style={styles.error}>{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={{ ...styles.input, ...(errors.confirm ? styles.inputError : {}) }}
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              {...field('confirm')}
              required
            />
            {errors.confirm && <span style={styles.error}>{errors.confirm}</span>}
          </div>

          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page:          { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0f172a,#1e293b)', padding:16 },
  card:          { background:'#fff', borderRadius:16, padding:'36px 32px', width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,.4)', textAlign:'center' },
  logo:          { fontSize:44, marginBottom:6 },
  title:         { margin:'0 0 4px', color:'#1e293b', fontSize:22, fontWeight:700 },
  sub:           { margin:'0 0 24px', color:'#94a3b8', fontSize:13 },
  field:         { textAlign:'left', marginBottom:16 },
  label:         { display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:'#374151' },
  input:         { width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, boxSizing:'border-box', outline:'none', transition:'border .2s' },
  inputError:    { borderColor:'#ef4444', background:'#fef2f2' },
  error:         { display:'block', marginTop:5, fontSize:12, color:'#ef4444' },
  roleRow:       { display:'flex', gap:8, marginBottom:6 },
  roleBtn:       { flex:1, padding:'9px', border:'1.5px solid #e2e8f0', borderRadius:8, background:'#f8fafc', cursor:'pointer', fontSize:13, fontWeight:600, color:'#64748b', transition:'all .2s' },
  roleBtnActive: { border:'1.5px solid #f97316', background:'#fff7ed', color:'#ea580c' },
  roleHint:      { fontSize:11, color:'#94a3b8' },
  strengthWrap:  { display:'flex', alignItems:'center', gap:8, marginTop:6 },
  strengthBar:   { flex:1, height:4, background:'#f1f5f9', borderRadius:2, overflow:'hidden' },
  strengthFill:  { height:'100%', borderRadius:2, transition:'width .3s, background .3s' },
  strengthLabel: { fontSize:11, fontWeight:700, width:42, textAlign:'right' },
  btn:           { width:'100%', padding:'12px', background:'#f97316', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:700, cursor:'pointer', marginTop:4 },
  loginLink:     { marginTop:20, fontSize:13, color:'#94a3b8' },
  link:          { color:'#f97316', fontWeight:600 },
};

export default Register;
