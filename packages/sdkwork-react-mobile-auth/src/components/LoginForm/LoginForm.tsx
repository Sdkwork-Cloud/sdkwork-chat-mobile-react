import React, { useState } from 'react';
import { Button, Input } from '@sdkwork/react-mobile-commons';
import { useAuth } from '../../hooks';
import type { LoginCredentials } from '../../types';
import './LoginForm.css';

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectUrl?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const success = await login(credentials.username.trim(), credentials.password);
      if (success) {
        onSuccess?.();
        return;
      }
      onError?.(new Error('Login failed'));
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
    if (error) clearError();
  };

  return (
    <form className="auth-login-form" onSubmit={handleSubmit}>
      <div className="auth-login-form__header">
        <h2 className="auth-login-form__title">Welcome Back</h2>
        <p className="auth-login-form__subtitle">Sign in to your account</p>
      </div>

      <div className="auth-login-form__fields">
        <Input
          type="text"
          label="Username"
          placeholder="Enter your username"
          value={credentials.username}
          onChange={handleChange('username')}
          fullWidth
          required
          autoComplete="username"
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter your password"
          value={credentials.password}
          onChange={handleChange('password')}
          fullWidth
          required
          autoComplete="current-password"
          rightIcon={
            <button
              type="button"
              className="auth-login-form__toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          }
        />
      </div>

      {error && (
        <div className="auth-login-form__error">
          {error}
        </div>
      )}

      <div className="auth-login-form__actions">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
        >
          Sign In
        </Button>
      </div>

      <div className="auth-login-form__footer">
        <a href="/forgot-password" className="auth-login-form__link">
          Forgot password?
        </a>
        <span className="auth-login-form__separator">|</span>
        <a href="/register" className="auth-login-form__link">
          Create account
        </a>
      </div>
    </form>
  );
};
