type ToastType = 'info' | 'success' | 'error' | 'loading';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
}

class ToastManager {
  private container: HTMLDivElement | null = null;

  private getContainer(): HTMLDivElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private show(message: string, type: ToastType, options: ToastOptions = {}) {
    const container = this.getContainer();
    const toast = document.createElement('div');
    
    const bgColors = {
      info: 'rgba(0, 0, 0, 0.8)',
      success: 'rgba(34, 197, 94, 0.9)',
      error: 'rgba(239, 68, 68, 0.9)',
      loading: 'rgba(0, 0, 0, 0.8)',
    };

    toast.style.cssText = `
      background: ${bgColors[type]};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 10px;
      animation: toastIn 0.3s ease;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      white-space: nowrap;
    `;
    
    toast.textContent = message;
    container.appendChild(toast);

    // Add animation styles if not exists
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }

    const duration = type === 'loading' ? 0 : (options.duration || 2000);
    
    if (duration > 0) {
      setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, duration);
    }

    return {
      close: () => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
      }
    };
  }

  info(message: string, options?: ToastOptions) {
    return this.show(message, 'info', options);
  }

  success(message: string, options?: ToastOptions) {
    return this.show(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    return this.show(message, 'error', options);
  }

  loading(message: string, options?: ToastOptions) {
    return this.show(message, 'loading', { ...options, duration: 0 });
  }
}

export const Toast = new ToastManager();
