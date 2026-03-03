import React, { useEffect, useState } from 'react';
import { Navbar, Toast, Input, Button, Icon } from '@sdkwork/react-mobile-commons';
import { useAuthStore } from '../stores/authStore';

interface ForgotPasswordPageProps {
  onBackToLogin?: () => void;
  t?: (key: string) => string;
}

type ResetStage = 'request' | 'verify' | 'reset' | 'done';

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onBackToLogin,
  t,
}) => {
  const [account, setAccount] = useState('');
  const [stage, setStage] = useState<ResetStage>('request');
  const [code, setCode] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const verifyPasswordResetCode = useAuthStore((state) => state.verifyPasswordResetCode);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);

  const tr = (key: string, fallback: string) => {
    const value = t?.(key);
    if (value && value !== key) return value;
    return fallback;
  };

  const format = (template: string, params: Record<string, string>) =>
    Object.entries(params).reduce((result, [param, value]) => result.replace(`{${param}}`, value), template);

  const inferChannel = (value: string): 'EMAIL' | 'SMS' =>
    value.includes('@') ? 'EMAIL' : 'SMS';

  const isValidAccount = (value: string): boolean => {
    const normalized = value.trim();
    if (!normalized) return false;
    if (normalized.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    }
    return normalized.length >= 3;
  };

  const accountChannel = inferChannel(account.trim());

  useEffect(() => {
    if (stage !== 'verify' || resendCountdown <= 0) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setResendCountdown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [stage, resendCountdown]);

  const handleSendCode = async () => {
    clearError();
    const normalized = account.trim();
    if (!isValidAccount(normalized)) {
      Toast.error(tr('auth_invalid_account', 'Please enter a valid username/email/phone'));
      return;
    }

    if (stage === 'verify' && resendCountdown > 0) {
      Toast.info(
        format(tr('auth_resend_wait', 'Please wait {seconds}s before resending'), {
          seconds: String(resendCountdown),
        })
      );
      return;
    }

    Toast.loading(tr('auth_sending', 'Sending...'));
    const success = await requestPasswordReset(normalized, accountChannel);
    if (success) {
      Toast.success(tr('auth_reset_code_sent', 'Verification code sent'));
      setStage('verify');
      setResendCountdown(60);
      return;
    }

    const latestError = useAuthStore.getState().error;
    Toast.error(latestError || tr('auth_reset_code_send_failed', 'Failed to send verification code'));
  };

  const handleVerifyCode = async () => {
    clearError();
    const normalized = account.trim();
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      Toast.error(tr('auth_code_required', 'Please enter the verification code'));
      return;
    }

    Toast.loading(tr('auth_verifying', 'Verifying...'));
    const success = await verifyPasswordResetCode(normalized, normalizedCode, accountChannel);
    if (success) {
      Toast.success(tr('auth_verify_success', 'Verification successful'));
      setVerifiedCode(normalizedCode);
      setStage('reset');
      return;
    }

    const latestError = useAuthStore.getState().error;
    Toast.error(latestError || tr('auth_verify_failed', 'Verification failed'));
  };

  const handleResetPassword = async () => {
    clearError();
    const normalized = account.trim();

    if (!verifiedCode) {
      Toast.error(tr('auth_verify_first', 'Please verify the code first'));
      setStage('verify');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      Toast.error(tr('auth_password_short', 'Password must be at least 6 characters'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.error(tr('auth_password_mismatch', 'Passwords do not match'));
      return;
    }

    Toast.loading(tr('auth_resetting', 'Resetting password...'));
    const success = await resetPassword(normalized, verifiedCode, newPassword, confirmPassword);
    if (success) {
      Toast.success(tr('auth_reset_success', 'Password has been reset'));
      setStage('done');
      return;
    }

    const latestError = useAuthStore.getState().error;
    Toast.error(latestError || tr('auth_reset_failed', 'Password reset failed'));
  };

  return (
    <div style={{
      height: '100%',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', width: '120%', height: '40%',
        background: 'radial-gradient(ellipse at center, rgba(255, 154, 68, 0.12) 0%, transparent 70%)',
        transform: 'translateX(-50%)', zIndex: 0,
      }} />

      <Navbar title="" onBack={onBackToLogin} variant="transparent" />

      <div style={{ flex: 1, overflowY: 'auto', zIndex: 1 }}>
        <div style={{ minHeight: '100%', padding: '0 32px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          {stage === 'request' && (
            <>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(255, 154, 68, 0.1)', color: '#ff9a44',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <Icon name="bell" size={28} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
                {tr('auth_recover_title', 'Recover Password')}
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '32px', padding: '0 10px' }}>
                {tr('auth_recover_desc', 'Enter your account and we will send you a password reset code')}
              </p>

              <Input
                placeholder={tr('auth_input_contact', 'Username / Email / Phone')}
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                variant="outline"
                style={{ height: '52px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '14px' }}
                prefix={<span style={{ fontSize: '16px' }}>@</span>}
              />

              <div style={{ marginTop: '28px' }}>
                <Button block size="lg" onClick={handleSendCode} disabled={isLoading} style={{ height: '52px', borderRadius: '14px' }}>
                  {isLoading ? tr('auth_sending', 'Sending...') : tr('auth_send_code', 'Send Code')}
                </Button>
              </div>
            </>
          )}

          {stage === 'verify' && (
            <>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(52, 199, 89, 0.12)', color: '#34c759',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <Icon name="shield" size={28} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
                {tr('auth_verify_title', 'Verify Code')}
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '24px', padding: '0 10px' }}>
                {format(
                  tr('auth_verify_desc', 'Enter the code sent to {account} to continue.'),
                  { account }
                )}
              </p>

              <Input
                placeholder={tr('auth_verify_code', 'Verification Code')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                variant="outline"
                style={{ height: '52px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '14px' }}
              />

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Button block size="lg" onClick={handleVerifyCode} disabled={isLoading} style={{ height: '52px', borderRadius: '14px' }}>
                  {isLoading ? tr('auth_verifying', 'Verifying...') : tr('auth_verify_code_btn', 'Verify Code')}
                </Button>
                <Button
                  block
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={isLoading || resendCountdown > 0}
                  style={{ height: '46px', borderRadius: '14px' }}
                >
                  {resendCountdown > 0
                    ? format(tr('auth_resend_countdown', 'Resend in {seconds}s'), {
                        seconds: String(resendCountdown),
                      })
                    : tr('auth_resend_code', 'Resend Code')}
                </Button>
              </div>
            </>
          )}

          {stage === 'reset' && (
            <>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(52, 199, 89, 0.12)', color: '#34c759',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <Icon name="lock" size={28} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
                {tr('auth_set_new_password_title', 'Set New Password')}
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '24px', padding: '0 10px' }}>
                {tr('auth_set_new_password_desc', 'Verification completed, now set your new password.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Input
                  type="password"
                  placeholder={tr('auth_new_password', 'New Password')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant="outline"
                  style={{ height: '52px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '14px' }}
                />
                <Input
                  type="password"
                  placeholder={tr('auth_confirm_password', 'Confirm Password')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outline"
                  style={{ height: '52px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '14px' }}
                />
              </div>

              <div style={{ marginTop: '24px' }}>
                <Button block size="lg" onClick={handleResetPassword} disabled={isLoading} style={{ height: '52px', borderRadius: '14px' }}>
                  {isLoading ? tr('auth_resetting', 'Resetting password...') : tr('auth_reset_password', 'Reset Password')}
                </Button>
              </div>
            </>
          )}

          {stage === 'done' && (
            <div style={{ animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: '#07c160', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', boxShadow: '0 8px 20px rgba(7, 193, 96, 0.2)',
              }}>
                <Icon name="check" size={36} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
                {tr('auth_reset_done_title', 'Password Updated')}
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: '32px' }}>
                {tr('auth_reset_done_desc', 'Your password has been updated successfully. Please sign in again.')}
              </p>
              <Button block variant="outline" onClick={onBackToLogin} style={{ borderRadius: '14px' }}>
                {tr('auth_back_to_login', 'Back to login')}
              </Button>
            </div>
          )}

          <div style={{ marginTop: '40px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            {tr('auth_need_help', 'Need help?')}
            <span style={{ color: 'var(--primary-color)', cursor: 'pointer' }}>
              {tr('auth_contact_support', 'Contact support')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
