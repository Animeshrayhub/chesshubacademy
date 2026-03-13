import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-secondary, #1a1a2e)',
          borderRadius: '12px',
          margin: '1rem',
          color: 'var(--text-primary, #fff)'
        }}>
          <h2>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary, #aaa)', marginTop: '0.5rem' }}>
            {this.props.fallbackMessage || 'This section encountered an error. Please try refreshing the page.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.5rem',
              background: 'var(--primary, #8b5cf6)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
