/**
 * Error Boundary Component
 * Catches and displays React errors gracefully
 */
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '3rem 2rem',
              maxWidth: '500px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#2d3748',
                margin: '0 0 1rem 0',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: '1rem',
                color: '#718096',
                lineHeight: '1.6',
                margin: '0 0 1.5rem 0',
              }}
            >
              We encountered an unexpected error. Please try refreshing the page or returning to
              the dashboard.
            </p>
            {this.state.error && (
              <details
                style={{
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                  padding: '1rem',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: '#4a5568',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                  Error details
                </summary>
                <pre
                  style={{
                    marginTop: '0.5rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
