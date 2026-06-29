import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
// Layout
import DashboardLayout from '../components/Layout/DashboardLayout';
// Pages
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';

/**
 * Route guard cho trang yêu cầu auth.
 * Nếu chưa login → redirect về /login.
 * Nếu role không đủ quyền → redirect về trang mặc định của role đó.
 */
function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: 'var(--neutral-200)', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role nếu được chỉ định
  if (roles && user && !roles.includes(user.roleId as Role)) {
    // Nurse bị truy cập trang Admin → redirect về invoices
    if (user.roleId === Role.Nurse) {
      return <Navigate to="/payment/invoices" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * Route guard cho trang public (Login, ForgotPassword).
 * Nếu đã login → redirect về trang chính.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user) {
    if (user.roleId === Role.Nurse) {
      return <Navigate to="/payment/invoices" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/** Placeholder cho các trang chưa xây dựng */
function ComingSoon({ title }: { title: string }) {
  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1 className="header-title">{title}</h1>
        </div>
      </header>
      <div className="page-content">
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-text">
              Trang <strong>{title}</strong> đang được phát triển...
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ── */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* ── Protected Routes (Dashboard Layout) ── */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Admin only */}
          <Route
            index
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ComingSoon title="Quản lý bệnh nhân" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ComingSoon title="Quản lý bác sĩ" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/holidays"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ComingSoon title="Ngày lễ" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/leaves"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ComingSoon title="Đơn nghỉ phép" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/change-requests"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ComingSoon title="Yêu cầu đổi lịch" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/time-slots"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ComingSoon title="Lịch khám" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ComingSoon title="Quản lý lịch hẹn" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical/diseases"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ComingSoon title="Danh mục bệnh" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical/medicines"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ComingSoon title="Kho thuốc" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ComingSoon title="Hòm thư góp ý" />
              </ProtectedRoute>
            }
          />

          {/* Nurse only */}
          <Route
            path="/payment/invoices"
            element={
              <ProtectedRoute roles={[Role.Admin, Role.Nurse]}>
                <ComingSoon title="Quản lý hóa đơn" />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all → redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
