import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { createSubmissionGuard } from '../utils/submitGuard';

export default function SendEmail() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const submitGuard = useRef(createSubmissionGuard()).current;
  const alertRef = useRef(null);

  const validateForm = () => {
    if (!subject.trim()) {
      setMessage({ type: 'error', text: 'Subject is required.' });
      return false;
    }
    if (!body.trim()) {
      setMessage({ type: 'error', text: 'Email body is required.' });
      return false;
    }
    if (!recipients.trim()) {
      setMessage({ type: 'error', text: 'At least one recipient is required.' });
      return false;
    }

    const emailList = recipients.split(/[,;\n]+/).map((e) => e.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = emailList.filter((e) => !emailRegex.test(e));

    if (invalid.length > 0) {
      setMessage({
        type: 'error',
        text: `Invalid email(s): ${invalid.join(', ')}`,
      });
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (message && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) return;
    if (!submitGuard.begin()) return;

    setLoading(true);

    try {
      const result = await api.sendEmail({ subject, body, recipients });
      const feedbackType = result?.demoMode ? 'warning' : 'success';
      const feedbackTitle = result?.demoMode ? 'Demo delivery only' : 'Campaign launched';
      const feedbackDetail = result?.demoMode
        ? 'SMTP delivery is not configured right now, so this send was recorded as simulated rather than delivered.'
        : 'Your message is on its way.';

      setMessage({
        type: feedbackType,
        title: feedbackTitle,
        text: result?.message || 'Your message was processed successfully.',
        detail: feedbackDetail,
      });
      setSubject('');
      setBody('');
      setRecipients('');
    } catch (err) {
      setMessage({
        type: 'error',
        title: 'Send failed',
        text: err.message || 'Unable to process your request.',
        detail: err.details || 'Please verify your SMTP settings and try again.',
      });
    } finally {
      submitGuard.end();
      setLoading(false);
    }
  };

  const recipientCount = recipients
    .split(/[,;\n]+/)
    .map((e) => e.trim())
    .filter(Boolean).length;

  return (
    <div className="page">
      <div className="page-hero">
        <div className="page-hero-text">
          <span className="page-eyebrow">Compose</span>
          <h2>Send Bulk Email</h2>
          <p>Craft your message and reach multiple recipients in one click.</p>
        </div>
        <div className="stat-pills">
          <div className="stat-pill">
            <span className="stat-pill-value">{recipientCount || '—'}</span>
            <span className="stat-pill-label">Recipients</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-value">{body.length}</span>
            <span className="stat-pill-label">Characters</span>
          </div>
        </div>
      </div>

      {message && (
        <div ref={alertRef} className={`alert alert-${message.type}`}>
          <div className="alert-icon" aria-hidden="true">
            {message.type === 'success' ? '✓' : message.type === 'error' ? '!' : 'i'}
          </div>
          <div className="alert-copy">
            <strong>{message.title || (message.type === 'success' ? 'Success' : 'Notice')}</strong>
            <div>{message.text}</div>
            {message.detail && <div className="alert-detail">{message.detail}</div>}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="composer card">
        <div className="composer-section">
          <div className="section-label">
            <span className="section-num">01</span>
            Subject
          </div>
          <input
            id="subject"
            type="text"
            className="composer-input composer-input-lg"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's this email about?"
            maxLength={200}
          />
        </div>

        <div className="composer-section">
          <div className="section-label">
            <span className="section-num">02</span>
            Recipients
            {recipientCount > 0 && (
              <span className="badge badge-glow">{recipientCount} added</span>
            )}
          </div>
          <textarea
            id="recipients"
            className="composer-textarea"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="user1@example.com, user2@example.com"
            rows={3}
          />
        </div>

        <div className="composer-section">
          <div className="section-label">
            <span className="section-num">03</span>
            Message
          </div>
          <textarea
            id="body"
            className="composer-textarea composer-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here..."
            rows={12}
          />
        </div>

        <div className="composer-footer">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSubject('');
              setBody('');
              setRecipients('');
              setMessage(null);
            }}
            disabled={loading}
          >
            Discard
          </button>
          <button type="submit" className="btn btn-primary btn-send" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Sending...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send Mail
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
