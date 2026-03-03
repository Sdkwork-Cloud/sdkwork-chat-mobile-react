
import React, { useState } from 'react';
import { Navbar, Toast, Input, Button, Icon } from '@sdkwork/react-mobile-commons';
import { useAuthStore } from '../stores/authStore';

interface RegisterPageProps {
  onLoginClick?: () => void;
  onRegisterSuccess?: () => void;
  t?: (key: string) => string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onLoginClick,
  onRegisterSuccess,
  t,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const register = useAuthStore((state) => state.register);
  const clearError = useAuthStore((state) => state.clearError);
  const loading = useAuthStore((state) => state.isLoading);

  const tr = (key: string, fallback: string) => {
    const value = t?.(key);
    if (value && value !== key) return value;
    return fallback;
  };

  const handleRegister = async () => {
    clearError();

    if (!username || !password) {
      Toast.info(tr('auth_fill_all', 'Please fill in all fields'));
      return;
    }
    if (password.length < 6) {
      Toast.error(tr('auth_password_short', 'Password must be at least 6 characters'));
      return;
    }
    if (password !== confirm) {
      Toast.error(tr('auth_password_mismatch', 'Passwords do not match'));
      return;
    }

    const success = await register(username, password, confirm);
    if (success) {
      Toast.success(tr('auth_register_success', 'Registration successful'));
      onRegisterSuccess?.();
      return;
    }

    const latestError = useAuthStore.getState().error;
    Toast.error(latestError || tr('auth_register_failed', 'Registration failed'));
  };

  const inputStyle = {
    height: '52px',
    background: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: '14px',
    fontSize: '15px'
  };

  return (
    <div style={{ height: '100%', width: '100%', background: '#0a0a0a', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Navbar title="" onBack={onLoginClick} variant="transparent" />
      
      <div style={{ 
        position: 'absolute', top: '-10%', left: '50%', width: '120%', height: '40%', 
        background: 'radial-gradient(ellipse at center, rgba(41, 121, 255, 0.15) 0%, transparent 70%)', 
        transform: 'translateX(-50%)', zIndex: 0 
      }} />

      <div style={{ 
        flex: 1, padding: '0 32px', display: 'flex', flexDirection: 'column', zIndex: 1,
        overflowY: 'auto', WebkitOverflowScrolling: 'touch'
      }}>
        <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '32px' }}>
          
          <div style={{ flex: 0.8, minHeight: '10px' }} />

          <div style={{ marginBottom: '24px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '18px', 
              background: 'rgba(41, 121, 255, 0.1)', 
              border: '1px solid rgba(41, 121, 255, 0.2)',
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(41, 121, 255, 0.15)',
              animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <Icon name="plus-circle" size={30} color="var(--primary-color)" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              {tr('auth_register_title', 'Create Account')}
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              {tr('auth_create_subtitle', 'Sign up to get started')}
            </p>
          </div>

          <div style={{ flex: 0.2 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
            <Input 
              placeholder={tr('auth_username_placeholder', 'Username')} 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              variant="outline"
              style={inputStyle}
              prefix={<Icon name="user" size={18} color="rgba(255,255,255,0.3)" />}
            />
            <Input 
              placeholder={tr('auth_password_placeholder', 'Password')} 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              variant="outline"
              style={inputStyle}
              prefix={<Icon name="lock" size={18} color="rgba(255,255,255,0.3)" />}
            />
            <Input 
              placeholder={tr('auth_confirm_password', 'Confirm Password')} 
              type="password" 
              value={confirm} 
              onChange={e => setConfirm(e.target.value)} 
              variant="outline"
              style={inputStyle}
              prefix={<Icon name="check" size={18} color="rgba(255,255,255,0.3)" />}
            />
          </div>

          <div style={{ marginTop: '32px', flexShrink: 0 }}>
            <Button block size="lg" onClick={handleRegister} disabled={loading} style={{ height: '54px', borderRadius: '14px', fontSize: '16px' }}>
              {loading ? tr('auth_register_loading', 'Signing up...') : tr('auth_register_btn', 'Sign Up')}
            </Button>
          </div>

          <div style={{ flex: 1, minHeight: '20px' }} />

          <div style={{ marginTop: 'auto', textAlign: 'center', flexShrink: 0 }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              {tr('auth_terms_prefix', 'By submitting, you agree to our')}
              <span style={{ color: 'var(--primary-color)', fontWeight: 600, margin: '0 4px', cursor: 'pointer' }}>
                {tr('auth_terms_user_agreement', 'User Agreement')}
              </span>
              {tr('auth_terms_and', 'and')}
              <span style={{ color: 'var(--primary-color)', fontWeight: 600, margin: '0 4px', cursor: 'pointer' }}>
                {tr('auth_terms_privacy_policy', 'Privacy Policy')}
              </span>
            </p>
          </div>

          <div style={{ height: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
