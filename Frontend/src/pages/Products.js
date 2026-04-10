import { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const UNITS = ['pcs', 'kg', 'meter', 'liter', 'box', 'roll'];
const emptyForm = { name:'', category:'', brand_id:'', price:'', discount:'0', quantity:'', unit:'pcs' };

const Products = () => {
  const { user }  = useAuth();
  const isAdmin   = user?.role === 'admin';

  const [products, setProducts] = useState([]);
  const [brands, setBrands]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const { data } = await API.get(`/products?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
      setProducts(data.products);
      setTotal(data.total);
    } catch { toast.error('Failed to load products'); }
  }, [search, page]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    API.get('/brands').then(r => setBrands(r.data.brands)).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name:     p.name,
      category: p.category,
      brand_id: p.brand_id || '',
      price:    p.price,
      discount: p.discount ?? 0,
      quantity: p.quantity,
      unit:     p.unit,
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        brand_id: form.brand_id || null,
        discount: parseFloat(form.discount) || 0,
      };
      if (editing) {
        await API.put(`/products/${editing.id}`, payload);
        toast.success('Product updated');
      } else {
        await API.post('/products', payload);
        toast.success('Product added');
      }
      setModal(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Deleted');
      loadProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot delete'); }
  };

  // Live discount preview inside the modal
  const previewPrice = () => {
    const p = parseFloat(form.price) || 0;
    const d = parseFloat(form.discount) || 0;
    return (p * (1 - d / 100)).toFixed(2);
  };

  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <h2 style={s.title}>Products <span style={s.count}>{total}</span></h2>
        <div style={s.actions}>
          <input
            style={s.search}
            placeholder="Search name, brand or category..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {isAdmin && <button style={s.addBtn} onClick={openCreate}>+ Add Product</button>}
        </div>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['#','Name','Brand','Category','Price','Discount','Final Price','Stock','Unit', isAdmin ? 'Actions' : ''].map(h =>
                <th key={h} style={s.th}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const disc  = parseFloat(p.discount) || 0;
              const final = parseFloat(p.discounted_price);
              const hasD  = disc > 0;
              return (
                <tr key={p.id} style={s.tr}>
                  <td style={s.td}>#{p.id}</td>
                  <td style={s.td}><strong>{p.name}</strong></td>

                  {/* Brand */}
                  <td style={s.td}>
                    {p.brand_name
                      ? <span style={s.brandBadge}>{p.brand_name}</span>
                      : <span style={s.dash}>—</span>}
                  </td>

                  <td style={s.td}><span style={s.catBadge}>{p.category}</span></td>

                  {/* Original price — strikethrough when discounted */}
                  <td style={{ ...s.td, textDecoration: hasD ? 'line-through' : 'none', color: hasD ? '#94a3b8' : '#374151' }}>
                    Rs. {parseFloat(p.price).toFixed(2)}
                  </td>

                  {/* Discount % */}
                  <td style={s.td}>
                    {hasD
                      ? <span style={s.discBadge}>{disc}% OFF</span>
                      : <span style={s.dash}>—</span>}
                  </td>

                  {/* Final price */}
                  <td style={{ ...s.td, fontWeight: 700, color: hasD ? '#10b981' : '#374151' }}>
                    Rs. {final.toFixed(2)}
                  </td>

                  <td style={{ ...s.td, color: p.quantity < 10 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                    {p.quantity}
                  </td>
                  <td style={s.td}>{p.unit}</td>

                  {isAdmin && (
                    <td style={s.td}>
                      <button style={s.editBtn}   onClick={() => openEdit(p)}>Edit</button>
                      <button style={s.deleteBtn} onClick={() => handleDelete(p.id, p.name)}>Del</button>
                    </td>
                  )}
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr><td colSpan={10} style={s.emptyRow}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={s.pagination}>
        <button style={s.pageBtn} disabled={page === 1}          onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span style={s.pageInfo}>Page {page} of {totalPages}</span>
        <button style={s.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>{editing ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>

              {/* Name */}
              <div style={s.field}>
                <label style={s.label}>Product Name</label>
                <input style={s.input} placeholder="e.g. Wall Paint 4L"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>

              {/* Category */}
              <div style={s.field}>
                <label style={s.label}>Category</label>
                <input style={s.input} placeholder="e.g. Paint, Tools, Plumbing"
                  value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
              </div>

              {/* Brand dropdown */}
              <div style={s.field}>
                <label style={s.label}>Brand</label>
                <select style={s.input} value={form.brand_id}
                  onChange={e => setForm({ ...form, brand_id: e.target.value })}>
                  <option value="">— No Brand —</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <span style={s.hint}>
                  Missing brand? Add it from the{' '}
                  <a href="/brands" style={{ color:'#f97316' }}>Brands page</a>
                </span>
              </div>

              {/* Price + Discount side by side */}
              <div style={s.row2}>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Price (Rs.)</label>
                  <input style={s.input} type="number" min={0} step="0.01" placeholder="0.00"
                    value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Discount %</label>
                  <div style={s.discRow}>
                    <input style={{ ...s.input, flex: 1 }} type="number" min={0} max={100} step="0.5"
                      value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
                    <span style={s.pctLabel}>%</span>
                  </div>
                </div>
              </div>

              {/* Live discount preview */}
              {parseFloat(form.price) > 0 && (
                <div style={s.preview}>
                  {parseFloat(form.discount) > 0
                    ? <>Original: <s>Rs. {parseFloat(form.price).toFixed(2)}</s> → Customer pays: <strong style={{ color:'#10b981' }}>Rs. {previewPrice()}</strong> ({form.discount}% OFF)</>
                    : <>Customer pays: <strong>Rs. {parseFloat(form.price).toFixed(2)}</strong> (no discount)</>
                  }
                </div>
              )}

              {/* Quantity + Unit */}
              <div style={s.row2}>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Quantity</label>
                  <input style={s.input} type="number" min={0}
                    value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                </div>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Unit</label>
                  <select style={s.input} value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setModal(false)}>Cancel</button>
                <button type="submit"  style={s.saveBtn}  disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  page:        { padding:24, maxWidth:1200, margin:'0 auto' },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  title:       { margin:0, color:'#1e293b', fontSize:22, display:'flex', alignItems:'center', gap:10 },
  count:       { background:'#f1f5f9', color:'#64748b', borderRadius:20, padding:'2px 10px', fontSize:14, fontWeight:600 },
  actions:     { display:'flex', gap:10 },
  search:      { padding:'9px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, width:260, outline:'none' },
  addBtn:      { background:'#f97316', color:'#fff', border:'none', borderRadius:8, padding:'9px 18px', fontWeight:700, cursor:'pointer', fontSize:14, whiteSpace:'nowrap' },

  tableWrap:   { background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,.08)', overflowX:'auto' },
  table:       { width:'100%', borderCollapse:'collapse', minWidth:950 },
  th:          { textAlign:'left', padding:'11px 14px', fontSize:11, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase', whiteSpace:'nowrap' },
  td:          { padding:'11px 14px', fontSize:13, color:'#374151', borderBottom:'1px solid #f8fafc' },
  tr:          {},
  brandBadge:  { background:'#f0fdf4', color:'#16a34a', borderRadius:6, padding:'3px 9px', fontSize:12, fontWeight:700 },
  catBadge:    { background:'#eff6ff', color:'#3b82f6', borderRadius:6, padding:'3px 9px', fontSize:12, fontWeight:600 },
  discBadge:   { background:'#fff7ed', color:'#f97316', borderRadius:6, padding:'3px 9px', fontSize:12, fontWeight:700 },
  dash:        { color:'#cbd5e1' },
  editBtn:     { background:'#3b82f6', color:'#fff', border:'none', borderRadius:6, padding:'5px 10px', cursor:'pointer', fontSize:12, marginRight:4 },
  deleteBtn:   { background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'5px 10px', cursor:'pointer', fontSize:12 },
  emptyRow:    { padding:36, textAlign:'center', color:'#94a3b8' },

  pagination:  { display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginTop:20 },
  pageBtn:     { background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'7px 16px', cursor:'pointer', fontSize:13, fontWeight:600 },
  pageInfo:    { color:'#64748b', fontSize:13 },

  overlay:     { position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 },
  modal:       { background:'#fff', borderRadius:16, padding:32, width:480, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,.3)' },
  modalTitle:  { margin:'0 0 20px', color:'#1e293b', fontSize:18, fontWeight:700 },
  field:       { marginBottom:14 },
  label:       { display:'block', marginBottom:5, fontSize:13, fontWeight:600, color:'#374151' },
  input:       { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, boxSizing:'border-box', outline:'none' },
  hint:        { fontSize:11, color:'#94a3b8', marginTop:4, display:'block' },
  row2:        { display:'flex', gap:12 },
  discRow:     { display:'flex', alignItems:'center', gap:6 },
  pctLabel:    { fontWeight:700, color:'#64748b', flexShrink:0 },
  preview:     { background:'#f8fafc', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#374151', marginBottom:14, borderLeft:'3px solid #f97316' },
  modalActions:{ display:'flex', gap:10, marginTop:20 },
  cancelBtn:   { flex:1, padding:'11px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 },
  saveBtn:     { flex:1, padding:'11px', background:'#f97316', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 },
};

export default Products;
