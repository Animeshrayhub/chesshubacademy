import { useState, useEffect } from 'react';
import { getEbookOrders, updateEbookOrderStatus } from '../../api/ebookApi';

export default function AdminEbookOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  async function load() {
    setLoading(true);
    setOrders(await getEbookOrders());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleStatus(id, status) {
    await updateEbookOrderStatus(id, status);
    load();
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>📦 Ebook Orders</h2>
        <div className="filter-group">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <p>Loading...</p> : filtered.length === 0 ? (
        <p className="empty">No orders found.</p>
      ) : (
        <div className="orders-list">
          {filtered.map(order => (
            <div key={order.id} className="order-card glass-card">
              <div className="order-info">
                <h4>{order.ebooks?.title || 'Unknown Ebook'}</h4>
                <p><strong>Name:</strong> {order.name}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
              {order.payment_screenshot && (
                <div className="screenshot">
                  <a href={order.payment_screenshot} target="_blank" rel="noopener noreferrer">
                    <img src={order.payment_screenshot} alt="Payment" />
                  </a>
                </div>
              )}
              {order.status === 'pending' && (
                <div className="order-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleStatus(order.id, 'approved')}>
                    ✅ Approve
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleStatus(order.id, 'rejected')}>
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem; }
        .filter-group { display: flex; gap: 0.25rem; }
        .btn-sm { padding: 0.3rem 0.75rem; font-size: 0.85rem; }
        .empty { color: #aaa; }
        .orders-list { display: flex; flex-direction: column; gap: 1rem; }
        .order-card { padding: 1.2rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start; }
        .order-info { flex: 1; min-width: 200px; }
        .order-info h4 { margin: 0 0 0.5rem; }
        .order-info p { margin: 0.2rem 0; font-size: 0.9rem; color: #ccc; }
        .status-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
        .status-pending { background: #854d0e; color: #fef3c7; }
        .status-approved { background: #166534; color: #dcfce7; }
        .status-rejected { background: #991b1b; color: #fee2e2; }
        .screenshot { width: 120px; }
        .screenshot img { width: 100%; border-radius: 8px; cursor: pointer; }
        .order-actions { display: flex; gap: 0.5rem; align-self: center; }
        .btn-danger { background: #dc2626; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
      `}</style>
    </div>
  );
}
