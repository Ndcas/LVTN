import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Layout wrapper cho tất cả trang authenticated.
 * Sidebar cố định bên trái + content area bên phải.
 */
export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
