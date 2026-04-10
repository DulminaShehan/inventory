import { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name:'', category:'', price:'', quantity:'', unit:'pcs' };
const UNITS = ['pcs','kg','meter','liter','box','roll'];

const Products = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [products, setProducts]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null); // null = create
  const [form, setForm]           = useState(emptyForm);
  const [loading, setLoading]     = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await API.get(`/products?search=${search}&page=${page}&limit=10`);
      setProducts(data.products);
      setTotal(data.total);
    } catch { toast.error('Failed to load products'); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit   = (p)  => { setEditing(p); setForm({ name:p.name, category:p.category, price:p.price, quantity:p.quantity, unit:p.unit }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await API.put(`/products/${editing.id}`, form);
        toast.success('Product updated');
      } else {
        await API.post('/products', form);
        toast.success('Product created');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Products <span style={styles.count}>{total}</span></h2>
        <div style={styles.actions}>
          <input
            style={styles.search}
            placeholder="Search name or category..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {isAdmin && <button style={styles.addBtn} onClick={openCreate}>+ Add Product</button>}
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>{['ID','Name','Category','Price','Stock','Unit', isAdmin ? 'Actions':''].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>#{p.id}</td>
                <td style={styles.td}><strong>{p.name}</strong></td>
                <td style={styles.td}><span style={styles.badge}>{p.category}</span></td>
                <td style={styles.td}>Rs. {parseFloat(p.price).toFixed(2)}</td>
                <td style={{ ...styles.td, color: p.quantity < 10 ? '#ef4444':'#10b981', fontWeight:700 }}>{p.quantity}</td>
                <td style={styles.td}>{p.unit}</td>
                {isAdmin && (
                  <td style={styles.td}>
                    <button style={styles.editBtn}   onClick={() => openEdit(p)}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <button style={styles.pageBtn} disabled={page===1}           onClick={()=>setPage(p=>p-1)}>← Prev</button>
        <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
        <button style={styles.pageBtn} disabled={page===totalPages}  onClick={()=>setPage(p=>p+1)}>Next →</button>
      </div>

      {/* Modal */}
      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>{editing ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>
              {[['Name','name','text'],['Category','category','text'],['Price','price','number'],['Quantity','quantity','number']].map(([label,key,type])=>(
                <div key={key} style={styles.field}>
                  <label style={styles.label}>{label}</label>
                  <input style={styles.input} type={type} value={form[key]}
                    onChange={e=>setForm({...form,[key]:e.target.value})} required min={type==='number'?0:undefined} step={key==='price'?'0.01':undefined} />
                </div>
              ))}
              <div style={styles.field}>
                <label style={styles.label}>Unit</label>
                <select style={styles.input} value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>
                  {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" style={styles.saveBtn} disabled={loading}>{loading?'Saving...':'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page:        { padding:24, maxWidth:1100, margin:'0 auto' },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  title:       { margin:0, color:'#1e293b', fontSize:22, display:'flex', alignItems:'center', gap:10 },
  count:       { background:'#f1f5f9', color:'#64748b', borderRadius:20, padding:'2px 10px', fontSize:14, fontWeight:600 },
  actions:     { display:'flex', gap:10 },
  search:      { padding:'9px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, width:220, outline:'none' },
  addBtn:      { background:'#f97316', color:'#fff', border:'none', borderRadius:8, padding:'9px 18px', fontWeight:700, cursor:'pointer', fontSize:14 },
  tableWrap:   { background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,.08)', overflow:'hidden' },
  table:       { width:'100%', borderCollapse:'collapse' },
  th:          { textAlign:'left', padding:'12px 16px', fontSize:12, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  td:          { padding:'12px 16px', fontSize:13, color:'#374151', borderBottom:'1px solid #f8fafc' },
  tr:          {},
  badge:       { background:'#eff6ff', color:'#3b82f6', borderRadius:6, padding:'3px 8px', fontSize:12, fontWeight:600 },
  editBtn:     { background:'#3b82f6', color:'#fff', border:'none', borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12, marginRight:6 },
  deleteBtn:   { background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12 },
  pagination:  { display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginTop:20 },
  pageBtn:     { background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'7px 16px', cursor:'pointer', fontSize:13, fontWeight:600 },
  pageInfo:    { color:'#64748b', fontSize:13 },
  overlay:     { position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 },
  modal:       { background:'#fff', borderRadius:16, padding:32, width:420, boxShadow:'0 20px 60px rgba(0,0,0,.3)' },
  modalTitle:  { margin:'0 0 24px', color:'#1e293b', fontSize:18 },
  field:       { marginBottom:16 },
  label:       { display:'block', marginBottom:6, fontSize:13, fontWeight:600, color:'#374151' },
  input:       { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, boxSizing:'border-box', outline:'none' },
  modalActions:{ display:'flex', gap:10, marginTop:24 },
  cancelBtn:   { flex:1, padding:'11px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 },
  saveBtn:     { flex:1, padding:'11px', background:'#f97316', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 },
};

export default Products;
