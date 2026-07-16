import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import '../styles/auth.css';

type Step = 'email' | 'reset';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Bước 1: Gửi OTP về email */
  const handleRequestOtp = async (e: SubmitEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/users/get-forgot-password-otp', { email });
      toast.success('Mã OTP đã được gửi đến email của bạn');
      setStep('reset');
      setErrors({});
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: string } })?.response?.data ||
        'Không thể gửi OTP. Vui lòng kiểm tra email.';
      toast.error(message as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Bước 2: Xác nhận OTP + Đặt mật khẩu mới */
  const handleResetPassword = async (e: SubmitEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!otp.trim()) {
      newErrors.otp = 'Vui lòng nhập mã OTP';
    } else if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      newErrors.otp = 'Mã OTP phải là 6 chữ số';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (password.length < 8) {
      newErrors.password = 'Mật khẩu tối thiểu 8 ký tự';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/users/forgot-password', { email, otp, password });
      setIsSuccess(true);
      toast.success('Đặt lại mật khẩu thành công!');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: string } })?.response?.data ||
        'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
      toast.error(message as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Màn hình thành công */
  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <CheckCircle size={56} color="var(--success)" />
          </div>
          <h2 style={{ marginBottom: 8 }}>Thành công!</h2>
          <p className="auth-subtitle" style={{ marginBottom: 24 }}>
            Mật khẩu đã được đặt lại. Bạn có thể đăng nhập với mật khẩu mới.
          </p>
          <button
            className="auth-submit-btn"
            onClick={() => navigate('/login', { replace: true })}
          >
            Về trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Heart size={22} />
          </div>
          <span className="auth-logo-text">ClinicPro</span>
        </div>
        <p className="auth-subtitle">Khôi phục mật khẩu</p>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step == 'email' ? 'active' : 'done'}`}>1</div>
          <div className={`step-line ${step == 'reset' ? 'active' : ''}`} />
          <div className={`step-dot ${step == 'reset' ? 'active' : ''}`}>2</div>
        </div>

        {step == 'email' ? (
          <form className="auth-form" onSubmit={handleRequestOtp} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">
                Email đã đăng ký
              </label>
              <input
                id="forgot-email"
                type="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                autoComplete="email"
                autoFocus
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="spinner" />}
              {isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-otp">
                Mã OTP (6 số)
              </label>
              <input
                id="forgot-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className={`form-input${errors.otp ? ' error' : ''}`}
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtp(val);
                  if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                }}
                autoFocus
              />
              {errors.otp && <span className="form-error">{errors.otp}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="forgot-password">
                Mật khẩu mới
              </label>
              <div className="password-wrapper">
                <input
                  id="forgot-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input w-full${errors.password ? ' error' : ''}`}
                  placeholder="Tối thiểu 8 ký tự"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="forgot-confirm-password">
                Xác nhận mật khẩu mới
              </label>
              <input
                id="forgot-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="form-error">{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="spinner" />}
              {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>

            <button
              type="button"
              className="auth-submit-btn"
              style={{
                background: 'transparent',
                color: 'var(--neutral-500)',
                border: '1px solid var(--neutral-200)',
                marginTop: 0,
              }}
              onClick={() => {
                setStep('email');
                setErrors({});
              }}
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">← Quay về đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
