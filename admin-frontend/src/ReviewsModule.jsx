import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={`text-base ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
    ))}
  </div>
);

const statusConfig = {
  pending:  { label: 'Pending',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200' },
};

const ReviewsModule = ({ adminToken }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState(null); // review id for rejection note
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchReviews(); }, [statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews?status=${statusFilter}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const moderate = async (id, status, note = '') => {
    setActionLoading(true);
    try {
      await fetch(`${API_URL}/api/reviews/${id}/moderate`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status, adminNote: note }),
      });
      setReviews(prev => prev.filter(r => r._id !== id));
      setRejectModal(null);
      setAdminNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await fetch(`${API_URL}/api/reviews/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-5 animate-fade-in-up font-sans">

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-dark">Review Moderation</h2>
          <p className="text-sm text-gray-400 mt-0.5">All customer reviews require your approval before going live.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border capitalize transition-all ${statusFilter === s ? statusConfig[s].cls + ' border-current' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              {statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 font-bold">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <p className="text-4xl mb-3">✨</p>
          <p className="font-bold">No {statusFilter} reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review._id} className={`bg-white rounded-2xl border shadow-sm p-5 ${review.status === 'pending' ? 'border-amber-200' : review.status === 'approved' ? 'border-green-100' : 'border-red-100'}`}>
              <div className="flex items-start gap-4">

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary font-black flex items-center justify-center text-sm shrink-0">
                  {(review.user?.name || review.guestName || 'A')[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-bold text-dark text-sm">{review.user?.name || review.guestName || 'Anonymous'}</span>
                      {review.user?.email && <span className="text-gray-400 text-[11px] ml-2">{review.user.email}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusConfig[review.status]?.cls}`}>
                        {review.status}
                      </span>
                      <span className="text-[11px] text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="flex items-center gap-2 mt-1.5 mb-2">
                    {review.product?.images?.[0] && <img src={review.product.images[0]} className="w-8 h-8 rounded-lg object-cover" />}
                    <span className="text-[12px] font-semibold text-primary truncate">{review.product?.name}</span>
                  </div>

                  {/* Stars + title */}
                  <div className="flex items-center gap-2 mb-1">
                    <StarDisplay rating={review.rating} />
                    {review.title && <span className="font-bold text-dark text-sm">{review.title}</span>}
                  </div>

                  {/* Comment */}
                  <p className="text-[14px] text-gray-600 leading-relaxed">{review.comment}</p>

                  {/* Admin note if rejected */}
                  {review.status === 'rejected' && review.adminNote && (
                    <p className="mt-2 text-[11px] text-red-500 bg-red-50 px-3 py-1.5 rounded-lg"><strong>Rejection note:</strong> {review.adminNote}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => moderate(review._id, 'approved')}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        Approve
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => { setRejectModal(review._id); setAdminNote(''); }}
                        className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(review._id)}
                      className="text-xs font-bold text-gray-400 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-dark text-lg mb-1">Reject Review</h3>
            <p className="text-sm text-gray-500 mb-4">Optionally add a reason (not shown to customer).</p>
            <textarea
              rows={3}
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="e.g. Spam, offensive language, irrelevant..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-300 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => moderate(rejectModal, 'rejected', adminNote)} disabled={actionLoading} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-600 disabled:opacity-50">
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsModule;
