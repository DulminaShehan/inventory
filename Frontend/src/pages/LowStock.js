import { useEffect, useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const LowStock = () => {
  const [products,  setProducts]  = useState([]);
  const [threshold, setThreshold] = useState(10);

  const load = () => {
    API.get(`/products/low-stock?threshold=${threshold}`)
      .then(r => setProducts(r.data.products))
      .catch(() => toast.error('Failed to load low-stock products'));
  };

  useEffect(() => { load(); }, [threshold]); // eslint-disable-line

  const level = (qty) => {
    if (qty === 0)  return { label:'Out of Stock', color:'#ef4444', bg:'#fef2f2' };
    if (qty <= 3)   return { label:'Critical',     color:'#ef4444', bg:'#fef2f2' };
    if (qty <= 7)   return { label:'Very Low',     color:'#f97316', bg:'#fff7ed' };
    return              { label:'Low',           color:'#eab308', bg:'#fefce8' };
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>⚠ Low Stock Alert</h2>
          <p style={styles.sub}>{products.length} product(s) need restocking</p>
        </div>
        <div style={styles.thresholdBox}>
          <label style={styles.label}>Threshold</label>
          <input style={styles.thInput} type="number" min={1} max={100} value={threshold}
            onChange={e => setThreshold(parseInt(e.target.value) || 10)} />
        </div>
      </div>

      {products.length === 0 ? (
        <div style={styles.allGood}>
          <div style={styles.checkIcon}>✅</div>
          <h3>All products are well stocked!</h3>
          <p style={{ color:'#94a3b8' }}>No items below the threshold of {threshold}.</p>
          <Link to="/products" style={styles.link}>View All Products →</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map(p => {
            const { label, color, bg } = level(p.quantity);
            return (
              <div key={p.id} style={{ ...styles.card, borderLeft:`4px solid ${color}` }}>
                <div style={styles.cardTop}>
                  <div>
                    <div style={styles.productName}>{p.name}</div>
                    <div style={styles.category}>{p.category}</div>
                  </div>
                  <span style={{ ...styles.badge, background:bg, color }}>{label}</span>
                </div>
                <div style={styles.stockRow}>
                  <div style={styles.stockBox}>
                    <div style={{ ...styles.stockNum, color }}>{p.quantity}</div>
                    <div style={styles.stockLabel}>{p.unit} remaining</div>
                  </div>
                  <div style={styles.priceBox}>
                    <div style={styles.price}>Rs. {parseFloat(p.price).toFixed(2)}</div>
                    <div style={styles.stockLabel}>per {p.unit}</div>
                  </div>
                </div>
                <div style={styles.bar}>
                  <div style={{ ...styles.fill, width:`${Math.min((p.quantity/threshold)*100,100)}%`, background:color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page:        { padding:24, maxWidth:1000, margin:'0 auto' },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  title:       { margin:'0 0 4px', color:'#1e293b' },
  sub:         { margin:0, color:'#94a3b8', fontSize:13 },
  thresholdBox:{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 },
  label:       { fontSize:12, color:'#64748b', fontWeight:600 },
  thInput:     { width:80, padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, textAlign:'center', outline:'none' },
  allGood:     { background:'#fff', borderRadius:16, padding:48, textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,.08)' },
  checkIcon:   { fontSize:48, marginBottom:12 },
  link:        { color:'#f97316', fontWeight:600, textDecoration:'none', fontSize:14 },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 },
  card:        { background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.08)' },
  cardTop:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 },
  productName: { fontWeight:700, color:'#1e293b', fontSize:15, marginBottom:4 },
  category:    { fontSize:12, color:'#94a3b8' },
  badge:       { borderRadius:6, padding:'3px 10px', fontSize:12, fontWeight:700 },
  stockRow:    { display:'flex', justifyContent:'space-between', marginBottom:12 },
  stockBox:    {},
  stockNum:    { fontSize:28, fontWeight:800 },
  stockLabel:  { fontSize:12, color:'#94a3b8' },
  priceBox:    { textAlign:'right' },
  price:       { fontSize:16, fontWeight:700, color:'#1e293b' },
  bar:         { height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden' },
  fill:        { height:'100%', borderRadius:3, transition:'width .3s' },
};

export default LowStock;
