import { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Brand colour palette — cycles for visual variety
const COLORS = ['#f97316','#3b82f6','#10b981','#8b5cf6','#ef4444','#ec4899','#14b8a6','#f59e0b'];

const Brands = () => {
  const { user }  = useAuth();
  const isAdmin   = user?.role === 'admin';

  const [brands, setBrands]   = useState([]);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName]       = useState('');
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await API.get('/brands');
      setBrands(data.brands);
    } catch { toast.error('Failed to load brands'); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setName(''); setModal(true); };
  const openEdit   = (b)  => { setEditing(b); setName(b.name); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/brands/${editing.id}`, { name });
        toast.success('Brand updated');
      } else {
        await API.post('/brands', { name });
        toast.success('Brand added');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save brand');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, brandName) => {
    if (!window.confirm(`Delete brand "${brandName}"? Products linked to it will have no brand.`)) return;
    try {
      await API.delete(`/brands/${id}`);
      toast.success('Brand deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Brands <span style={s.count}>{brands.length}</span></h2>
          <p style={s.sub}>Brand names assigned to products. Discount is set per product.</p>
        </div>
        {isAdmin && <button style={s.addBtn} onClick={openCreate}>+ Add Brand</button>}
      </div>

      <div style={s.grid}>
        {brands.map((b, i) => {
          const color = COLORS[i % COLORS.length];
          return (
            <div key={b.id} style={s.card}>
              <div style={s.cardTop}>
                {/* Coloured initial circle */}
                <div style={{ ...s.avatar, background: color }}>
                  {b.name[0].toUpperCase()}
                </div>
                <div style={s.info}>
                  <div style={s.brandName}>{b.name}</div>
                  <div style={s.productCount}>
                    {b.product_count} product{b.product_count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div style={s.cardActions}>
                  <button style={s.editBtn}   onClick={() => openEdit(b)}>Edit Name</button>
                  <button style={s.deleteBtn} onClick={() => handleDelete(b.id, b.name)}>Delete</button>
                </div>
              )}
            </div>
          );
        })}

        {brands.length === 0 && (
          <div style={s.empty}>
            No brands yet.{isAdmin && <> Click <strong>+ Add Brand</strong> to create one.</>}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>{editing ? `Edit "${editing.name}"` : 'Add New Brand'}</h3>
            <p style={s.modalSub}>
              Examples: Dulux, Nippon, Asian Paints, Stanley, Bosch, 3M…
            </p>
            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>Brand Name</label>
                <input
                  style={s.input}
                  placeholder="Enter brand name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" style={s.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Brand' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  page:        { padding:24, maxWidth:1100, margin:'0 auto' },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  title:       { margin:'0 0 4px', color:'#1e293b', fontSize:22, fontWeight:700, display:'flex', alignItems:'center', gap:10 },
  count:       { background:'#f1f5f9', color:'#64748b', borderRadius:20, padding:'2px 10px', fontSize:14, fontWeight:600 },
  sub:         { margin:0, color:'#94a3b8', fontSize:13 },
  addBtn:      { background:'#f97316', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontSize:14, whiteSpace:'nowrap' },

  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 },
  card:        { background:'#fff', borderRadius:14, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.08)' },
  cardTop:     { display:'flex', alignItems:'center', gap:12, marginBottom:16 },
  avatar:      { width:48, height:48, borderRadius:14, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, flexShrink:0 },
  info:        {},
  brandName:   { fontWeight:700, color:'#1e293b', fontSize:16 },
  productCount:{ fontSize:12, color:'#94a3b8', marginTop:3 },
  cardActions: { display:'flex', gap:8, paddingTop:12, borderTop:'1px solid #f1f5f9' },
  editBtn:     { flex:1, background:'#eff6ff', color:'#3b82f6', border:'1px solid #bfdbfe', borderRadius:7, padding:'7px', cursor:'pointer', fontSize:13, fontWeight:600 },
  deleteBtn:   { flex:1, background:'#fef2f2', color:'#ef4444', border:'1px solid #fecaca', borderRadius:7, padding:'7px', cursor:'pointer', fontSize:13, fontWeight:600 },
  empty:       { gridColumn:'1/-1', textAlign:'center', color:'#94a3b8', padding:48, fontSize:15 },

  overlay:     { position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 },
  modal:       { background:'#fff', borderRadius:16, padding:32, width:380, boxShadow:'0 20px 60px rgba(0,0,0,.3)' },
  modalTitle:  { margin:'0 0 4px', color:'#1e293b', fontSize:18, fontWeight:700 },
  modalSub:    { margin:'0 0 20px', color:'#94a3b8', fontSize:13 },
  field:       { marginBottom:16 },
  label:       { display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:'#374151' },
  input:       { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, boxSizing:'border-box', outline:'none' },
  modalActions:{ display:'flex', gap:10, marginTop:20 },
  cancelBtn:   { flex:1, padding:'11px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 },
  saveBtn:     { flex:1, padding:'11px', background:'#f97316', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 },
};

export default Brands;
