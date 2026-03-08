import { Toast } from '../components/Toast';

interface RequestConfig extends RequestInit {
  timeout?: number;
  params?: Record<string, string | number | boolean>;
  skipErrorHandle?: boolean;
}

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

class HttpClient {
  private async blocked<T>(url: string, config: RequestConfig | undefined, method: string): Promise<ApiResponse<T>> {
    const { skipErrorHandle } = config || {};
    const message =
      `[SDK compliance] Http.${method.toLowerCase()} is disabled for backend calls (${url}). ` +
      'Use service-layer SDK domain methods: client.<domain>.<method>.';

    if (!skipErrorHandle) {
      Toast.error('Request helper is disabled. Use SDK service.');
    }

    console.error('[Net] Disabled HTTP helper invoked', {
      method,
      url,
    });

    return Promise.reject(new Error(message));
  }

  public get<T>(url: string, params?: Record<string, any>, config?: RequestConfig) {
    return this.blocked<T>(url, { ...config, params }, 'GET');
  }

  public post<T>(url: string, data?: any, config?: RequestConfig) {
    return this.blocked<T>(url, { ...config, body: data }, 'POST');
  }

  public put<T>(url: string, data?: any, config?: RequestConfig) {
    return this.blocked<T>(url, { ...config, body: data }, 'PUT');
  }

  public delete<T>(url: string, config?: RequestConfig) {
    return this.blocked<T>(url, config, 'DELETE');
  }

  public upload<T>(url: string, file: File, fieldName = 'file', config?: RequestConfig) {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.blocked<T>(url, { ...config, body: formData }, 'POST');
  }
}

export const Http = new HttpClient();
