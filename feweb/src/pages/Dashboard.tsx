import {
  CalendarCheck,
  Receipt,
  MessageSquareText,
  Users,
} from 'lucide-react';
import Header from '../components/Layout/Header';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: 'blue' | 'green' | 'orange' | 'red';
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // Placeholder stats — sẽ fetch API khi backend ready
  const stats = [
    {
      icon: <CalendarCheck size={24} />,
      value: '—',
      label: 'Lịch hẹn hôm nay',
      color: 'blue' as const,
    },
    {
      icon: <Receipt size={24} />,
      value: '—',
      label: 'Hóa đơn chờ thanh toán',
      color: 'orange' as const,
    },
    {
      icon: <MessageSquareText size={24} />,
      value: '—',
      label: 'Góp ý chưa đọc',
      color: 'red' as const,
    },
    {
      icon: <Users size={24} />,
      value: '—',
      label: 'Tổng bệnh nhân',
      color: 'green' as const,
    },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Tổng quan hệ thống" />
      <div className="page-content">
        <div className="stats-grid">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Hoạt động gần đây</h3>
          </div>
          <div className="empty-state">
            <CalendarCheck size={48} className="empty-state-icon" />
            <p className="empty-state-text">
              Chưa có dữ liệu. Hệ thống sẽ hiển thị hoạt động khi các endpoint được kết nối.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
