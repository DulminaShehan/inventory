import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, sales: 0, lowStock: 0, revenue: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

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

  const cards = [
    { label: 'Total Products', value: stats.products,             color: '#3b82f6', icon: '📦' },
    { label: 'Total Sales',    value: stats.sales,                color: '#10b981', icon: '🧾' },
    { label: 'Low Stock Items',value: stats.lowStock,             color: '#ef4444', icon: '⚠️' },
    { label: 'Total Revenue',  value: `Rs. ${stats.revenue.toFixed(2)}`, color: '#f97316', icon: '💰' },
  ];

  return (
    <div style={styles.page}>
      <h2 style={styles.greeting}>Welcome, {user?.username}! 👋</h2>

      {/* Stat Cards */}
      <div style={styles.cards}>
        {cards.map(c => (
          <div key={c.label} style={{ ...styles.card, borderTop: `4px solid ${c.color}` }}>
            <div style={styles.cardIcon}>{c.icon}</div>
            <div style={styles.cardValue}>{c.value}</div>
            <div style={styles.cardLabel}>{c.label}</div>
          </div>
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
              <tr>{['Product','Category','Stock','Unit'].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {lowStockItems.map(p => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={{ ...styles.td, color:'#ef4444', fontWeight:700 }}>{p.quantity}</td>
                  <td style={styles.td}>{p.unit}</td>
                </tr>
              ))}
              {lowStockItems.length === 0 && <tr><td colSpan={4} style={{ ...styles.td, textAlign:'center', color:'#10b981' }}>All products are well stocked ✓</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:        { padding:24, maxWidth:1100, margin:'0 auto' },
  greeting:    { color:'#1e293b', marginBottom:24 },
  cards:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 },
  card:        { background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.08)', textAlign:'center' },
  cardIcon:    { fontSize:28, marginBottom:8 },
  cardValue:   { fontSize:26, fontWeight:800, color:'#1e293b' },
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
