import React, { Component, ErrorInfo, ReactNode } from 'react';
import { appUiStateService } from '../../services/AppUiStateService';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  // Explicitly declare props to avoid TS error "Property 'props' does not exist on type 'ErrorBoundary'"
  public readonly props!: Readonly<Props>;

  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleHardReset = () => {
      if (window.confirm('这将清空所有本地缓存数据并恢复初始状态，确定吗？')) {
          appUiStateService.clearAllBrowserStorage();
          window.location.reload();
      }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--bg-body)',
          color: 'var(--text-primary)',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>😵</div>
          <h2 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: 600 }}>应用遇到严重错误</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '280px', lineHeight: '1.6' }}>
             错误信息: {this.state.error?.message || '未知异常'}
             <br/>
             <span style={{ fontSize: '12px', opacity: 0.7 }}>可能是数据版本不兼容或网络问题导致</span>
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '240px' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '14px',
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(41, 121, 255, 0.3)'
                }}
              >
                尝试重新加载
              </button>

              <button 
                onClick={this.handleHardReset}
                style={{
                  padding: '14px',
                  background: 'var(--bg-card)',
                  color: '#fa5151',
                  border: '1px solid rgba(250, 81, 81, 0.2)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                修复数据并重启
              </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
