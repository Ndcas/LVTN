import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';

// Layout
import DashboardLayout from '../components/Layout/DashboardLayout';

// Pages
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Doctors from '../pages/Doctors';
import Nurses from '../pages/Nurses';
import Holidays from '../pages/Holidays';
import Leaves from '../pages/Leaves';
import ChangeRequests from '../pages/ChangeRequests';
import Diseases from '../pages/Diseases';
import Medicines from '../pages/Medicines';
import Specialties from '../pages/Specialties';
import Degrees from '../pages/Degrees';
import Feedback from '../pages/Feedback';
import Invoices from '../pages/Invoices';
import Logout from '../pages/Logout';

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
    if (user.roleId == Role.Nurse) {
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
    if (user.roleId == Role.Nurse) {
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
          path="/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />
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
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Doctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurses"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Nurses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/holidays"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Holidays />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/leaves"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Leaves />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/change-requests"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <ChangeRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical/diseases"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Diseases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medical/medicines"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Medicines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalogs/specialties"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Specialties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalogs/degrees"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Degrees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Feedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/invoices"
            element={
              <ProtectedRoute roles={[Role.Admin, Role.Nurse]}>
                <Invoices />
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
