import { useEffect, useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Sales = () => {
  const [sales, setSales]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]     = useState(null);

  useEffect(() => {
    API.get('/sales')
      .then(r => setSales(r.data.sales))
      .catch(() => toast.error('Failed to load sales'));
  }, []);

  const viewDetail = async (id) => {
    if (selected === id) { setSelected(null); setDetail(null); return; }
    try {
      const { data } = await API.get(`/sales/${id}`);
      setSelected(id);
      setDetail(data.sale);
    } catch { toast.error('Failed to load sale details'); }
  };

  const totalRevenue = sales.reduce((s, x) => s + parseFloat(x.total), 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Sales History</h2>
        <div style={styles.revBox}>
          <span style={styles.revLabel}>Total Revenue</span>
          <span style={styles.revAmount}>Rs. {totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Sales List */}
        <div style={styles.list}>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>{['Sale #','By','Total','Date',''].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <>
                    <tr key={s.id} style={{ ...styles.tr, background: selected===s.id ? '#fff7ed':'' }}>
                      <td style={styles.td}><strong>#{s.id}</strong></td>
                      <td style={styles.td}>{s.created_by}</td>
                      <td style={styles.td}>Rs. {parseFloat(s.total).toFixed(2)}</td>
                      <td style={styles.td}>{new Date(s.created_at).toLocaleString()}</td>
                      <td style={styles.td}>
                        <button style={styles.viewBtn} onClick={() => viewDetail(s.id)}>
                          {selected===s.id ? 'Hide ▲' : 'View ▼'}
                        </button>
                      </td>
                    </tr>

                    {/* Inline detail panel */}
                    {selected === s.id && detail && (
                      <tr key={`${s.id}-detail`}>
                        <td colSpan={5} style={styles.detailCell}>
                          <table style={styles.innerTable}>
                            <thead>
                              <tr>{['Product','Qty','Unit Price','Subtotal'].map(h=><th key={h} style={styles.innerTh}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                              {detail.items.map((item, i) => (
                                <tr key={i}>
                                  <td style={styles.innerTd}>{item.product_name}</td>
                                  <td style={styles.innerTd}>{item.quantity} {item.unit}</td>
                                  <td style={styles.innerTd}>Rs. {parseFloat(item.price).toFixed(2)}</td>
                                  <td style={styles.innerTd}><strong>Rs. {parseFloat(item.subtotal).toFixed(2)}</strong></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={styles.detailTotal}>
                            Bill Total: <strong>Rs. {parseFloat(detail.total).toFixed(2)}</strong>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {sales.length === 0 && (
                  <tr><td colSpan={5} style={styles.empty}>No sales recorded yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page:       { padding:24, maxWidth:1000, margin:'0 auto' },
  header:     { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  title:      { margin:0, color:'#1e293b' },
  revBox:     { background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:10, padding:'10px 20px', textAlign:'right' },
  revLabel:   { display:'block', fontSize:12, color:'#c2410c', fontWeight:600 },
  revAmount:  { fontSize:20, fontWeight:800, color:'#ea580c' },
  layout:     {},
  list:       { background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,.08)', overflow:'hidden' },
  tableWrap:  { overflowX:'auto' },
  table:      { width:'100%', borderCollapse:'collapse' },
  th:         { textAlign:'left', padding:'12px 16px', fontSize:12, color:'#64748b', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  td:         { padding:'12px 16px', fontSize:13, color:'#374151', borderBottom:'1px solid #f8fafc' },
  tr:         { transition:'background .15s' },
  viewBtn:    { background:'#eff6ff', color:'#3b82f6', border:'1px solid #bfdbfe', borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:600 },
  detailCell: { padding:'0 0 0 32px', background:'#f8fafc' },
  innerTable: { width:'90%', borderCollapse:'collapse', margin:'12px 0' },
  innerTh:    { textAlign:'left', padding:'6px 12px', fontSize:11, color:'#64748b', borderBottom:'1px solid #e2e8f0', textTransform:'uppercase' },
  innerTd:    { padding:'8px 12px', fontSize:13, color:'#374151', borderBottom:'1px solid #f1f5f9' },
  detailTotal:{ fontSize:14, color:'#1e293b', padding:'8px 12px 12px', textAlign:'right' },
  empty:      { padding:32, textAlign:'center', color:'#94a3b8', fontSize:14 },
};

export default Sales;
