import React, { useState } from 'react';
import { Button, Input } from '@sdkwork/react-mobile-commons/components';
import { useAuth } from '../../hooks';
import type { RegisterData } from '../../types';
import './RegisterForm.css';

export interface RegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
}) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.displayName) {
      errors.displayName = 'Display name is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    const { confirmPassword, ...registerData } = formData;

    try {
      await register(registerData);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (error) clearError();
  };

  return (
    <form className="auth-register-form" onSubmit={handleSubmit}>
      <div className="auth-register-form__header">
        <h2 className="auth-register-form__title">Create Account</h2>
        <p className="auth-register-form__subtitle">Join OpenChat today</p>
      </div>

      <div className="auth-register-form__fields">
        <Input
          type="text"
          label="Display Name"
          placeholder="Your full name"
          value={formData.displayName}
          onChange={handleChange('displayName')}
          error={validationErrors.displayName}
          fullWidth
          required
        />

        <Input
          type="text"
          label="Username"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleChange('username')}
          error={validationErrors.username}
          fullWidth
          required
          autoComplete="username"
        />

        <Input
          type="email"
          label="Email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={validationErrors.email}
          fullWidth
          required
          autoComplete="email"
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange('password')}
          error={validationErrors.password}
          fullWidth
          required
          autoComplete="new-password"
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={validationErrors.confirmPassword}
          fullWidth
          required
          autoComplete="new-password"
          rightIcon={
            <button
              type="button"
              className="auth-register-form__toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          }
        />
      </div>

      {error && (
        <div className="auth-register-form__error">
          {error}
        </div>
      )}

      <div className="auth-register-form__actions">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
        >
          Create Account
        </Button>
      </div>

      <div className="auth-register-form__footer">
        <span>Already have an account?</span>
        <a href="/login" className="auth-register-form__link">
          Sign in
        </a>
      </div>
    </form>
  );
};
