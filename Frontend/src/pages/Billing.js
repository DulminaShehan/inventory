import { useEffect, useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Billing = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [items, setItems]       = useState([{ product_id:'', quantity:1 }]);
  const [loading, setLoading]   = useState(false);
  const [preview, setPreview]   = useState(null); // bill receipt preview

  useEffect(() => {
    API.get('/products?limit=100')
      .then(r => setProducts(r.data.products))
      .catch(() => toast.error('Failed to load products'));
  }, []);

  const addRow    = ()  => setItems([...items, { product_id:'', quantity:1 }]);
  const removeRow = (i) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i, field, val) => {
    const copy = [...items];
    copy[i][field] = field === 'quantity' ? parseInt(val) || 1 : val;
    setItems(copy);
  };

  const getProduct = (id) => products.find(p => p.id === parseInt(id));

  const calcTotal = () =>
    items.reduce((sum, item) => {
      const p = getProduct(item.product_id);
      return sum + (p ? parseFloat(p.price) * item.quantity : 0);
    }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some(i => !i.product_id)) {
      return toast.error('Select a product for each row');
    }
    setLoading(true);
    try {
      const { data } = await API.post('/sales', {
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: i.quantity })),
      });
      setPreview(data.sale);
      toast.success('Bill created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    } finally { setLoading(false); }
  };

  if (preview) return <Receipt sale={preview} onNew={() => { setPreview(null); setItems([{ product_id:'', quantity:1 }]); }} onView={() => navigate('/sales')} />;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>🧾 New Bill</h2>

      <div style={styles.layout}>
        <div style={styles.form}>
          <form onSubmit={handleSubmit}>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Product','Qty','Price','Subtotal',''].map(h => <th key={h} style={styles.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const prod = getProduct(item.product_id);
                    return (
                      <tr key={i}>
                        <td style={styles.td}>
                          <select style={styles.select} value={item.product_id}
                            onChange={e => updateItem(i, 'product_id', e.target.value)} required>
                            <option value="">-- Select Product --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                                {p.name} (Stock: {p.quantity} {p.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={styles.td}>
                          <input style={styles.qtyInput} type="number" min={1}
                            max={prod?.quantity || 999} value={item.quantity}
                            onChange={e => updateItem(i, 'quantity', e.target.value)} />
                        </td>
                        <td style={styles.td}>{prod ? `Rs. ${parseFloat(prod.price).toFixed(2)}` : '-'}</td>
                        <td style={styles.td}>
                          {prod ? <strong>Rs. {(parseFloat(prod.price) * item.quantity).toFixed(2)}</strong> : '-'}
                        </td>
                        <td style={styles.td}>
                          {items.length > 1 && (
                            <button type="button" style={styles.removeBtn} onClick={() => removeRow(i)}>✕</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={styles.bottomBar}>
              <button type="button" style={styles.addRowBtn} onClick={addRow}>+ Add Item</button>
              <div style={styles.totalBox}>
                <span style={styles.totalLabel}>Total:</span>
                <span style={styles.totalAmount}>Rs. {calcTotal().toFixed(2)}</span>
              </div>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Processing...' : '✓ Create Bill'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Receipt = ({ sale, onNew, onView }) => (
  <div style={rec.page}>
    <div style={rec.receipt}>
      <div style={rec.header}>
        <div style={rec.logo}>🔧</div>
        <h2 style={rec.storeName}>Hardware Store</h2>
        <p style={rec.sub}>Official Receipt</p>
      </div>
      <div style={rec.meta}>
        <span>Bill # {sale.id}</span>
        <span>{new Date(sale.created_at).toLocaleString()}</span>
      </div>
      <div style={rec.meta}><span>Cashier: {sale.created_by}</span></div>
      <hr style={rec.hr} />
      <table style={rec.table}>
        <thead><tr>{['Item','Qty','Price','Subtotal'].map(h=><th key={h} style={rec.th}>{h}</th>)}</tr></thead>
        <tbody>
          {sale.items?.map((item, i) => (
            <tr key={i}>
              <td style={rec.td}>{item.product_name}</td>
              <td style={rec.td}>{item.quantity} {item.unit}</td>
              <td style={rec.td}>Rs. {parseFloat(item.price).toFixed(2)}</td>
              <td style={rec.td}>Rs. {parseFloat(item.subtotal).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr style={rec.hr} />
      <div style={rec.total}>
        <span>TOTAL</span>
        <span>Rs. {parseFloat(sale.total).toFixed(2)}</span>
      </div>
      <p style={rec.thanks}>Thank you for your purchase!</p>
      <div style={rec.buttons}>
        <button style={rec.newBtn}  onClick={onNew}>+ New Bill</button>
        <button style={rec.viewBtn} onClick={onView}>View All Sales</button>
      </div>
    </div>
  </div>
);

const styles = {
  page:      { padding:24, maxWidth:1000, margin:'0 auto' },
  title:     { color:'#1e293b', marginBottom:24 },
  layout:    {},
  form:      { background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,.08)', padding:24 },
  tableWrap: { overflowX:'auto' },
  table:     { width:'100%', borderCollapse:'collapse' },
  th:        { textAlign:'left', padding:'10px 12px', fontSize:12, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  td:        { padding:'10px 12px', borderBottom:'1px solid #f1f5f9' },
  select:    { width:220, padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none' },
  qtyInput:  { width:70, padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, textAlign:'center', outline:'none' },
  removeBtn: { background:'#fef2f2', color:'#ef4444', border:'1px solid #fecaca', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:13 },
  bottomBar: { display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:20, flexWrap:'wrap', gap:12 },
  addRowBtn: { background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:8, padding:'9px 18px', cursor:'pointer', fontWeight:600, fontSize:14 },
  totalBox:  { display:'flex', alignItems:'center', gap:12 },
  totalLabel:{ color:'#64748b', fontSize:16, fontWeight:600 },
  totalAmount:{ color:'#1e293b', fontSize:24, fontWeight:800 },
  submitBtn: { background:'#f97316', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:15, cursor:'pointer' },
};

const rec = {
  page:      { minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 },
  receipt:   { background:'#fff', borderRadius:16, padding:32, width:440, boxShadow:'0 4px 20px rgba(0,0,0,.12)', textAlign:'center' },
  header:    { marginBottom:16 },
  logo:      { fontSize:36 },
  storeName: { margin:'4px 0 2px', color:'#1e293b' },
  sub:       { margin:0, color:'#94a3b8', fontSize:13 },
  meta:      { display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748b', margin:'6px 0' },
  hr:        { border:'none', borderTop:'1px dashed #e2e8f0', margin:'12px 0' },
  table:     { width:'100%', borderCollapse:'collapse', textAlign:'left' },
  th:        { fontSize:11, color:'#94a3b8', padding:'6px 4px', borderBottom:'1px solid #f1f5f9', textTransform:'uppercase' },
  td:        { fontSize:13, color:'#374151', padding:'8px 4px', borderBottom:'1px solid #f8fafc' },
  total:     { display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:800, color:'#1e293b', margin:'12px 0' },
  thanks:    { color:'#94a3b8', fontSize:13, margin:'12px 0 20px' },
  buttons:   { display:'flex', gap:10 },
  newBtn:    { flex:1, padding:'11px', background:'#f97316', color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer' },
  viewBtn:   { flex:1, padding:'11px', background:'#f1f5f9', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer' },
};

export default Billing;
