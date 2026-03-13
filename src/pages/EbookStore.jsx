import { useState, useEffect } from 'react';
import { getEbooks, createEbookOrder, getApprovedOrder } from '../api/ebookApi';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';

export default function EbookStore() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEbook, setSelectedEbook] = useState(null);
  const [previewEbook, setPreviewEbook] = useState(null);
  const [orderForm, setOrderForm] = useState({ name: '', email: '', phone: '' });
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [downloadEmail, setDownloadEmail] = useState('');
  const [downloadAccess, setDownloadAccess] = useState(null);

  async function loadEbooks() {
    setLoading(true);
    const data = await getEbooks();
    setEbooks(data);
    setLoading(false);
  }

  useEffect(() => {
    loadEbooks();
  }, []);

  async function handleOrder(e) {
    e.preventDefault();
    if (!selectedEbook) return;
    setSubmitting(true);

    let screenshotUrl = null;
    if (screenshot && supabase) {
      const fileName = `payment_${Date.now()}_${screenshot.name}`;
      const { data: uploadData } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, screenshot);
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('payment-screenshots')
          .getPublicUrl(fileName);
        screenshotUrl = urlData?.publicUrl;
      }
    }

    const order = await createEbookOrder({
      ebook_id: selectedEbook.id,
      name: orderForm.name,
      email: orderForm.email,
      phone: orderForm.phone,
      payment_screenshot: screenshotUrl,
      status: 'pending',
    });

    setSubmitting(false);
    if (order) {
      setOrderStatus('success');
      setSelectedEbook(null);
      setOrderForm({ name: '', email: '', phone: '' });
      setScreenshot(null);
    } else {
      setOrderStatus('error');
    }
    setTimeout(() => setOrderStatus(null), 4000);
  }

  async function checkDownload(ebook) {
    if (!downloadEmail) return;
    const approved = await getApprovedOrder(ebook.id, downloadEmail);
    if (approved) {
      setDownloadAccess(ebook);
    } else {
      setDownloadAccess('denied');
      setTimeout(() => setDownloadAccess(null), 3000);
    }
  }

  return (
    <div className="ebook-store-page">
      <nav className="page-nav">
        <div className="page-nav-inner">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h2>📚 ChessHub Ebook Store</h2>
        </div>
      </nav>

      {orderStatus === 'success' && (
        <div className="toast toast-success">Order placed! You'll receive access after admin approval.</div>
      )}
      {orderStatus === 'error' && (
        <div className="toast toast-error">Failed to place order. Please try again.</div>
      )}

      {loading ? (
        <div className="page-loading">Loading ebooks...</div>
      ) : ebooks.length === 0 ? (
        <div className="page-empty">No ebooks available yet. Check back soon!</div>
      ) : (
        <div className="ebook-grid">
          {ebooks.map((ebook) => (
            <div key={ebook.id} className="ebook-card glass-card">
              {ebook.cover_image && (
                <img src={ebook.cover_image} alt={ebook.title} className="ebook-cover" />
              )}
              <div className="ebook-info">
                <h3>{ebook.title}</h3>
                <p className="ebook-desc">{ebook.description}</p>
                <div className="ebook-price">
                  {ebook.is_free || ebook.price === 0 ? (
                    <span className="price-free">FREE</span>
                  ) : (
                    <span className="price-amount">₹{ebook.price}</span>
                  )}
                </div>

                {ebook.preview_images?.length > 0 && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setPreviewEbook(ebook)}>
                    Preview
                  </button>
                )}

                {ebook.is_free || ebook.price === 0 ? (
                  <a href={ebook.drive_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    Download Free
                  </a>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => setSelectedEbook(ebook)}>
                    Buy Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewEbook && (
        <div className="modal-overlay" onClick={() => setPreviewEbook(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewEbook(null)}>×</button>
            <h3>{previewEbook.title} — Preview</h3>
            <div className="preview-images">
              {previewEbook.preview_images.map((img, i) => (
                <img key={i} src={img} alt={`Preview ${i + 1}`} className="preview-img" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {selectedEbook && (
        <div className="modal-overlay" onClick={() => setSelectedEbook(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEbook(null)}>×</button>
            <h3>Buy: {selectedEbook.title}</h3>
            <p className="modal-price">Price: ₹{selectedEbook.price}</p>

            <div className="payment-instructions">
              <h4>💳 Payment Instructions</h4>
              <p>Send ₹{selectedEbook.price} via UPI to:</p>
              <div className="upi-details">
                <p className="upi-id"><strong>UPI ID:</strong> clubchess259@okaxis</p>
              </div>
              <p className="payment-note">After payment, fill the form below and upload your payment screenshot.</p>
            </div>

            <form onSubmit={handleOrder} className="order-form">
              <input
                type="text" placeholder="Your Name" required
                value={orderForm.name}
                onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
              />
              <input
                type="email" placeholder="Your Email" required
                value={orderForm.email}
                onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
              />
              <input
                type="tel" placeholder="Your Phone" required
                value={orderForm.phone}
                onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
              />
              <label className="file-label">
                Payment Screenshot *
                <input
                  type="file" accept="image/*" required
                  onChange={(e) => setScreenshot(e.target.files[0])}
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Download Access Check */}
      <div className="download-check-section">
        <h3>📥 Already Purchased?</h3>
        <p>Enter your email to access your approved downloads.</p>
        <div className="download-check-form">
          <input
            type="email" placeholder="Your email"
            value={downloadEmail}
            onChange={(e) => setDownloadEmail(e.target.value)}
          />
          {ebooks.filter(e => !e.is_free && e.price > 0).map((ebook) => (
            <button key={ebook.id} className="btn btn-secondary btn-sm" onClick={() => checkDownload(ebook)}>
              Check: {ebook.title}
            </button>
          ))}
        </div>
        {downloadAccess && downloadAccess !== 'denied' && (
          <div className="download-approved">
            <p>✅ Access approved for: {downloadAccess.title}</p>
            <a href={downloadAccess.drive_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Download Now
            </a>
          </div>
        )}
        {downloadAccess === 'denied' && (
          <p className="download-denied">❌ No approved order found for this email.</p>
        )}
      </div>

      <style>{`
        .ebook-store-page { min-height: 100vh; background: var(--bg-primary, #0a0a1a); color: #fff; padding-bottom: 3rem; }
        .page-nav { background: rgba(20,20,40,0.95); border-bottom: 1px solid #333; padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }
        .page-nav-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 2rem; }
        .back-link { color: var(--primary, #8b5cf6); text-decoration: none; font-weight: 600; }
        .back-link:hover { text-decoration: underline; }
        .page-loading, .page-empty { text-align: center; padding: 4rem 2rem; color: #aaa; font-size: 1.2rem; }
        .ebook-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
        .ebook-card { border-radius: 12px; overflow: hidden; background: rgba(30,30,60,0.6); border: 1px solid #333; }
        .ebook-cover { width: 100%; height: 200px; object-fit: cover; }
        .ebook-info { padding: 1.2rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .ebook-info h3 { margin: 0; font-size: 1.1rem; }
        .ebook-desc { color: #aaa; font-size: 0.9rem; line-height: 1.4; }
        .ebook-price { font-size: 1.2rem; font-weight: 700; }
        .price-free { color: #22c55e; }
        .price-amount { color: #f59e0b; }
        .btn-sm { padding: 0.4rem 1rem; font-size: 0.85rem; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
        .modal-content { background: #1a1a2e; border-radius: 12px; padding: 2rem; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; }
        .modal-close { position: absolute; top: 0.5rem; right: 1rem; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; }
        .modal-price { color: #f59e0b; font-size: 1.3rem; font-weight: 700; }
        .payment-instructions { background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .payment-instructions h4 { margin: 0 0 0.5rem; }
        .upi-id { font-size: 1.1rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: 4px; text-align: center; }
        .payment-note { font-size: 0.85rem; color: #aaa; margin-top: 0.5rem; }
        .order-form { display: flex; flex-direction: column; gap: 0.75rem; }
        .order-form input[type="text"], .order-form input[type="email"], .order-form input[type="tel"] {
          padding: 0.6rem; border-radius: 6px; border: 1px solid #444; background: #111; color: #fff; }
        .file-label { font-size: 0.9rem; color: #aaa; }
        .file-label input { margin-top: 0.3rem; }
        .preview-images { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
        .preview-img { width: 100%; border-radius: 8px; }
        .download-check-section { max-width: 1200px; margin: 3rem auto; padding: 2rem; background: rgba(30,30,60,0.4); border-radius: 12px; }
        .download-check-section h3 { margin: 0 0 0.5rem; }
        .download-check-form { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-top: 1rem; }
        .download-check-form input { padding: 0.5rem; border-radius: 6px; border: 1px solid #444; background: #111; color: #fff; min-width: 200px; }
        .download-approved { margin-top: 1rem; padding: 1rem; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; }
        .download-denied { color: #ef4444; margin-top: 0.5rem; }
        .toast { position: fixed; top: 80px; right: 1rem; padding: 1rem 1.5rem; border-radius: 8px; z-index: 1100; font-weight: 600; }
        .toast-success { background: #166534; color: #fff; }
        .toast-error { background: #991b1b; color: #fff; }
      `}</style>
    </div>
  );
}
