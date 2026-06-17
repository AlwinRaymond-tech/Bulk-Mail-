export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-bg">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-grid" />
        </div>
        <div className="auth-visual-content">
          <div className="auth-visual-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1>BulkMail</h1>
          <p>The modern way to send bulk emails. Fast, simple, and beautiful.</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-icon">⚡</span>
              Send to hundreds at once
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">📊</span>
              Track delivery status
            </div>
            <div className="auth-feature">
              <span className="auth-feature-icon">🔒</span>
              Secure & private
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}
