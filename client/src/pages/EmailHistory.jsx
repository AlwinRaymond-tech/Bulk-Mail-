import { useState, useEffect } from 'react';
import { api } from '../api';

function StatusBadge({ status }) {
  const config = {
    sent: { className: 'badge-success', label: 'Delivered' },
    failed: { className: 'badge-error', label: 'Needs attention' },
    partial: { className: 'badge-warning', label: 'Partly delivered' },
    simulated: { className: 'badge-warning', label: 'Simulated' },
  };

  const current = config[status] || { className: '', label: status || 'Unknown' };

  return (
    <span className={`badge badge-status ${current.className}`}>
      <span className="status-dot" />
      {current.label}
    </span>
  );
}

function EmailDetail({ email, onClose }) {
  if (!email) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{email.subject}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <StatusBadge status={email.status} />
          </div>
          <div className="detail-row">
            <span className="detail-label">Sent</span>
            <span>{email.sentCount} / {email.recipients.length}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span>{new Date(email.createdAt).toLocaleString()}</span>
          </div>
          <div className="detail-section">
            <span className="detail-label">Recipients</span>
            <div className="recipient-list">
              {email.recipients.map((r, i) => (
                <span key={i} className="recipient-tag">{r}</span>
              ))}
            </div>
          </div>
          <div className="detail-section">
            <span className="detail-label">Message</span>
            <div className="email-body-preview">{email.body}</div>
          </div>
          {email.sendErrors?.length > 0 && (
            <div className="detail-section">
              <span className="detail-label">Errors</span>
              <ul className="error-list">
                {email.sendErrors.map((err, i) => (
                  <li key={i}>
                    <strong>{err.recipient}:</strong> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmailHistory() {
  const [emails, setEmails] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHistory(page);
      setEmails(data.emails);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewDetails = async (id) => {
    try {
      const email = await api.getEmailById(id);
      setSelectedEmail(email);
    } catch (err) {
      setError(err.message);
    }
  };

  const successfulCount = emails.filter((email) => email.status === 'sent' || email.status === 'partial').length;
  const failedCount = emails.filter((email) => email.status === 'failed').length;
  const simulatedCount = emails.filter((email) => email.status === 'simulated').length;

  return (
    <div className="page">
      <div className="page-hero">
        <div className="page-hero-text">
          <span className="page-eyebrow">Analytics</span>
          <h2>Campaign History</h2>
          <p>Track every email you've sent and monitor delivery status.</p>
        </div>
        {!loading && emails.length > 0 && (
          <div className="stat-pills">
            <div className="stat-pill">
              <span className="stat-pill-value">{successfulCount}</span>
              <span className="stat-pill-label">Successful</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-value">{failedCount}</span>
              <span className="stat-pill-label">Failed</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-value">{simulatedCount}</span>
              <span className="stat-pill-label">Simulated</span>
            </div>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state card">
          <span className="spinner spinner-lg" />
          <p>Loading campaigns...</p>
        </div>
      ) : emails.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h3>No campaigns yet</h3>
          <p>Your sent emails will show up here once you launch your first campaign.</p>
        </div>
      ) : (
        <>
          <div className="history-grid">
            {emails.map((email) => (
              <div key={email._id} className="history-card card" onClick={() => handleViewDetails(email._id)}>
                <div className="history-card-top">
                  <StatusBadge status={email.status} />
                  <span className="history-date">{new Date(email.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <h3 className="history-subject">{email.subject}</h3>
                <div className="history-meta">
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {email.recipients.length} recipients
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {email.status === 'simulated'
                      ? 'Simulated delivery'
                      : email.status === 'failed'
                        ? 'Delivery failed'
                        : `${email.sentCount}/${email.recipients.length} delivered`}
                  </span>
                </div>
                <div className="history-card-action">
                  View details
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchHistory(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchHistory(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedEmail && (
        <EmailDetail email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </div>
  );
}
