import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout().then(() => {
      navigate('/login', { replace: true });
    });
  }, [logout, navigate]);

  return (
    <div className="auth-page">
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: 'var(--neutral-200)', borderTopColor: 'var(--primary)' }} />
    </div>
  );
}
