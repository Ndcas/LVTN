import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarOff,
  CalendarClock,
  CalendarCheck,
  ClipboardList,
  Pill,
  ShieldAlert,
  MessageSquareText,
  Receipt,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import type { ComponentType } from 'react';

interface SidebarItem {
  label: string;
  path: string;
  icon: ComponentType<{ size?: number }>;
  roles: Role[];
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const navigation: SidebarSection[] = [
  {
    title: 'Tổng quan',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [Role.Admin] },
    ],
  },
  {
    title: 'Người dùng',
    items: [
      { label: 'Bệnh nhân', path: '/users', icon: Users, roles: [Role.Admin] },
      { label: 'Bác sĩ', path: '/doctors', icon: Stethoscope, roles: [Role.Admin] },
    ],
  },
  {
    title: 'Lịch khám',
    items: [
      { label: 'Ngày lễ', path: '/schedule/holidays', icon: CalendarOff, roles: [Role.Admin] },
      { label: 'Đơn nghỉ phép', path: '/schedule/leaves', icon: CalendarClock, roles: [Role.Admin] },
      { label: 'Yêu cầu đổi lịch', path: '/schedule/change-requests', icon: CalendarCheck, roles: [Role.Admin] },
      { label: 'Lịch khám', path: '/schedule/time-slots', icon: ClipboardList, roles: [Role.Admin] },
    ],
  },
  {
    title: 'Lịch hẹn',
    items: [
      { label: 'Quản lý lịch hẹn', path: '/bookings', icon: CalendarCheck, roles: [Role.Admin] },
    ],
  },
  {
    title: 'Y tế',
    items: [
      { label: 'Danh mục bệnh', path: '/medical/diseases', icon: ShieldAlert, roles: [Role.Admin] },
      { label: 'Kho thuốc', path: '/medical/medicines', icon: Pill, roles: [Role.Admin] },
    ],
  },
  {
    title: 'Thanh toán',
    items: [
      { label: 'Hóa đơn', path: '/payment/invoices', icon: Receipt, roles: [Role.Admin, Role.Nurse] },
    ],
  },
  {
    title: 'Khác',
    items: [
      { label: 'Góp ý', path: '/feedback', icon: MessageSquareText, roles: [Role.Admin] },
    ],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const userRole = user?.roleId ?? 0;

  /** Lọc sidebar item theo role */
  const filteredNav = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(userRole as Role)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Heart size={20} />
        </div>
        <span className="sidebar-logo-text">ClinicPro</span>
      </div>

      <nav className="sidebar-nav">
        {filteredNav.map((section) => (
          <div key={section.title}>
            <div className="nav-section-label">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-item${isActive || (item.path !== '/' && location.pathname.startsWith(item.path)) ? ' active' : ''}`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullName || 'Người dùng'}</div>
            <div className="sidebar-user-role">
              {userRole === Role.Admin ? 'Quản trị viên' : 'Điều dưỡng'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
