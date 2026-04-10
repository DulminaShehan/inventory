import { useEffect, useState, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [stats, setStats]             = useState({ products: 0, sales: 0, lowStock: 0, revenue: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Search bar state
  const [search, setSearch]           = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]     = useState(false);
  const [showDrop, setShowDrop]       = useState(false);
  const searchRef = useRef(null);
  const debounce  = useRef(null);

  useEffect(() => {
    const load = async () => {
      const [prodRes, salesRes, lowRes] = await Promise.all([
        API.get('/products?limit=1'),
        API.get('/sales'),
        API.get('/products/low-stock'),
      ]);
      const revenue = salesRes.data.sales.reduce((s, x) => s + parseFloat(x.total), 0);
      setStats({
        products: prodRes.data.total,
        sales:    salesRes.data.count,
        lowStock: lowRes.data.count,
        revenue,
      });
      setRecentSales(salesRes.data.sales.slice(0, 5));
      setLowStockItems(lowRes.data.products.slice(0, 5));
    };
    load();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  const handleSearch = (val) => {
    setSearch(val);
    setShowDrop(true);
    clearTimeout(debounce.current);
    if (!val.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    debounce.current = setTimeout(async () => {
      try {
        const { data } = await API.get(`/products?search=${encodeURIComponent(val)}&limit=8`);
        setSearchResults(data.products);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
  };

  const goToProducts = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`);
    setShowDrop(false);
  };

  const cards = [
    { label: 'Total Products',  value: stats.products,                    color: '#3b82f6', icon: '📦', to: '/products'  },
    { label: 'Total Sales',     value: stats.sales,                       color: '#10b981', icon: '🧾', to: '/sales'     },
    { label: 'Low Stock Items', value: stats.lowStock,                    color: '#ef4444', icon: '⚠️', to: '/low-stock' },
    { label: 'Total Revenue',   value: `Rs. ${stats.revenue.toFixed(2)}`, color: '#f97316', icon: '💰', to: '/sales'     },
  ];

  return (
    <div style={styles.page}>
      {/* Top bar: greeting + search */}
      <div style={styles.topBar}>
        <h2 style={styles.greeting}>Welcome, {user?.username}! 👋</h2>

        {/* Global Search Bar */}
        <div ref={searchRef} style={styles.searchWrap}>
          <form onSubmit={goToProducts} style={styles.searchForm}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search products by name, brand or category..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => search && setShowDrop(true)}
            />
            {search && (
              <button type="button" style={styles.clearBtn} onClick={() => { setSearch(''); setSearchResults([]); setShowDrop(false); }}>✕</button>
            )}
          </form>

          {/* Dropdown results */}
          {showDrop && (search.trim()) && (
            <div style={styles.dropdown}>
              {searching && <div style={styles.dropItem}>Searching...</div>}
              {!searching && searchResults.length === 0 && (
                <div style={styles.dropItem}>No products found for "{search}"</div>
              )}
              {!searching && searchResults.map(p => {
                const disc  = parseFloat(p.brand_discount) || 0;
                const final = parseFloat(p.discounted_price);
                return (
                  <div key={p.id} style={styles.dropRow} onClick={() => { navigate('/products'); setShowDrop(false); }}>
                    <div style={styles.dropLeft}>
                      <div style={styles.dropName}>{p.name}</div>
                      <div style={styles.dropMeta}>
                        {p.brand_name && <span style={styles.dropBrand}>{p.brand_name}</span>}
                        <span style={styles.dropCat}>{p.category}</span>
                        <span style={{ color: p.quantity < 10 ? '#ef4444':'#10b981', fontWeight:600 }}>Stock: {p.quantity} {p.unit}</span>
                      </div>
                    </div>
                    <div style={styles.dropRight}>
                      {disc > 0 && <div style={styles.dropOrig}>Rs. {parseFloat(p.price).toFixed(2)}</div>}
                      <div style={{ ...styles.dropPrice, color: disc > 0 ? '#10b981' : '#1e293b' }}>Rs. {final.toFixed(2)}</div>
                      {disc > 0 && <div style={styles.dropDisc}>{disc}% OFF</div>}
                    </div>
                  </div>
                );
              })}
              {!searching && searchResults.length > 0 && (
                <div style={styles.dropFooter} onClick={goToProducts}>
                  View all results for "{search}" →
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.cards}>
        {cards.map(c => (
          <Link key={c.label} to={c.to} style={{ textDecoration:'none' }}>
            <div style={{ ...styles.card, borderTop: `4px solid ${c.color}` }}>
              <div style={styles.cardIcon}>{c.icon}</div>
              <div style={styles.cardValue}>{c.value}</div>
              <div style={styles.cardLabel}>{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={styles.grid}>
        {/* Recent Sales */}
        <div style={styles.section}>
          <div style={styles.sectionHead}>
            <h3 style={styles.sectionTitle}>Recent Sales</h3>
            <Link to="/sales" style={styles.viewAll}>View All →</Link>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>{['Sale #','By','Total','Date'].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {recentSales.map(s => (
                <tr key={s.id} style={styles.tr}>
                  <td style={styles.td}>#{s.id}</td>
                  <td style={styles.td}>{s.created_by}</td>
                  <td style={styles.td}>Rs. {parseFloat(s.total).toFixed(2)}</td>
                  <td style={styles.td}>{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentSales.length === 0 && <tr><td colSpan={4} style={{ ...styles.td, textAlign:'center', color:'#94a3b8' }}>No sales yet</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Low Stock */}
        <div style={styles.section}>
          <div style={styles.sectionHead}>
            <h3 style={styles.sectionTitle}>⚠ Low Stock Alert</h3>
            <Link to="/low-stock" style={styles.viewAll}>View All →</Link>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>{['Product','Brand','Stock','Unit'].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {lowStockItems.map(p => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.brand_name || <span style={{color:'#cbd5e1'}}>—</span>}</td>
                  <td style={{ ...styles.td, color:'#ef4444', fontWeight:700 }}>{p.quantity}</td>
                  <td style={styles.td}>{p.unit}</td>
                </tr>
              ))}
              {lowStockItems.length === 0 && <tr><td colSpan={4} style={{ ...styles.td, textAlign:'center', color:'#10b981' }}>All products well stocked ✓</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:        { padding:24, maxWidth:1100, margin:'0 auto' },
  topBar:      { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, gap:20, flexWrap:'wrap' },
  greeting:    { color:'#1e293b', margin:0, fontSize:20, whiteSpace:'nowrap' },

  // Search
  searchWrap:  { position:'relative', flex:1, maxWidth:520 },
  searchForm:  { display:'flex', alignItems:'center', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12, padding:'0 12px', boxShadow:'0 1px 4px rgba(0,0,0,.06)', transition:'border .2s' },
  searchIcon:  { fontSize:16, marginRight:8, flexShrink:0 },
  searchInput: { flex:1, border:'none', outline:'none', padding:'12px 0', fontSize:14, background:'transparent', color:'#1e293b' },
  clearBtn:    { background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:14, padding:'4px', lineHeight:1 },
  dropdown:    { position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#fff', borderRadius:12, boxShadow:'0 8px 30px rgba(0,0,0,.15)', zIndex:300, overflow:'hidden', border:'1px solid #f1f5f9' },
  dropItem:    { padding:'14px 16px', color:'#94a3b8', fontSize:13, textAlign:'center' },
  dropRow:     { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', cursor:'pointer', borderBottom:'1px solid #f8fafc', transition:'background .15s' },
  dropLeft:    {},
  dropName:    { fontWeight:600, color:'#1e293b', fontSize:13 },
  dropMeta:    { display:'flex', gap:8, marginTop:3, flexWrap:'wrap' },
  dropBrand:   { background:'#f0fdf4', color:'#16a34a', borderRadius:4, padding:'1px 6px', fontSize:11, fontWeight:600 },
  dropCat:     { background:'#eff6ff', color:'#3b82f6', borderRadius:4, padding:'1px 6px', fontSize:11 },
  dropRight:   { textAlign:'right', flexShrink:0 },
  dropOrig:    { fontSize:11, color:'#94a3b8', textDecoration:'line-through' },
  dropPrice:   { fontSize:14, fontWeight:800 },
  dropDisc:    { fontSize:11, color:'#f97316', fontWeight:700 },
  dropFooter:  { padding:'10px 16px', textAlign:'center', fontSize:13, color:'#f97316', fontWeight:600, cursor:'pointer', background:'#fff7ed', borderTop:'1px solid #f1f5f9' },

  cards:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  card:        { background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.08)', textAlign:'center', cursor:'pointer', transition:'transform .15s, box-shadow .15s' },
  cardIcon:    { fontSize:28, marginBottom:8 },
  cardValue:   { fontSize:24, fontWeight:800, color:'#1e293b' },
  cardLabel:   { fontSize:13, color:'#64748b', marginTop:4 },
  grid:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 },
  section:     { background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.08)' },
  sectionHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  sectionTitle:{ margin:0, color:'#1e293b', fontSize:16 },
  viewAll:     { color:'#f97316', fontSize:13, textDecoration:'none', fontWeight:600 },
  table:       { width:'100%', borderCollapse:'collapse' },
  th:          { textAlign:'left', padding:'8px 10px', fontSize:12, color:'#64748b', borderBottom:'1px solid #f1f5f9', textTransform:'uppercase' },
  td:          { padding:'10px 10px', fontSize:13, color:'#374151', borderBottom:'1px solid #f8fafc' },
  tr:          { transition:'background .15s' },
};

export default Dashboard;
