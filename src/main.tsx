import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { StorageService } from './services/storageService';

// Initialize clean data defaults on startup
try {
  StorageService.initializeDefaults();
} catch (error) {
  console.error('[jopi] Startup storage initialization failed:', error);
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled React Render Error:', error, errorInfo);
  }

  handleReset = () => {
    StorageService.resetToDemoData();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#ffffff',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Cairo, sans-serif'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>✨</div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
            جاري تهيئة بيانات تطبيق jopi
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '380px', marginBottom: '24px' }}>
            اضغط على الزر أدناه لإعادة ضبط البيانات التجريبية وتشغيل التطبيق فوراً.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 28px',
              borderRadius: '16px',
              background: 'linear-gradient(to right, #7c3aed, #e11d48)',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4)'
            }}
          >
            إعادة الضبط وتشغيل التطبيق الآن 🚀
          </button>
          {this.state.error && (
            <pre style={{
              marginTop: '20px',
              padding: '12px',
              background: '#1e293b',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#f87171',
              maxWidth: '90%',
              overflow: 'auto',
              textAlign: 'left'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
