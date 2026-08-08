import { useEffect, useState, useMemo } from 'react';
import { CalendarCheck, Receipt, MessageSquareText, Users, AlertTriangle, XCircle, RefreshCw, Activity, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Layout/Header';
import { fetchAdminDashboard, type DashboardData, type LogItem, triggerScheduleTimeSlots, deleteOldTimeSlots } from '../lib/api';
import dayjs from 'dayjs';

/* ─── Stat Card ─── */
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: 'blue' | 'green' | 'orange' | 'red';
  loading?: boolean;
}

function StatCard({ icon, value, label, color, loading }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-info">
        {loading ? (
          <div className="skeleton" style={{ width: '60px', height: '28px', marginBottom: '4px' }} />
        ) : (
          <div className="stat-value">{value}</div>
        )}
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ─── Log Row ─── */
function LogRow({ log }: { log: LogItem }) {
  const isError = log.level === 'error';
  const timeStr = dayjs(log.timestamp).format('HH:mm:ss');

  return (
    <div className={`log-row ${isError ? 'log-error' : 'log-warn'}`}>
      <div className="log-level-badge">
        {isError
          ? <XCircle size={14} />
          : <AlertTriangle size={14} />
        }
        <span>{log.level.toUpperCase()}</span>
      </div>
      <div className="log-message">{log.message}</div>
      <div className="log-meta">
        <span className="log-service">{log.service}</span>
        <span className="log-time">{timeStr}</span>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [deletingOldSlots, setDeletingOldSlots] = useState(false);

  const loadDashboard = async (force = false) => {
    try {
      if (force) {
        setRefreshing(true);
      }

      const result = await fetchAdminDashboard(force);

      setData(result);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể tải dữ liệu Dashboard');
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSchedule = async () => {
    if (confirm('Bạn có chắc chắn muốn tự động tạo lịch khám cho tuần tới? Quá trình này có thể mất một lúc.')) {
      setScheduling(true);

      try {
        await triggerScheduleTimeSlots();

        toast.success('Lên lịch khám thành công!');

        loadDashboard(true); // Làm mới dashboard để xem có log nào mới không
      } catch (e: any) {
        toast.error(e.response?.data?.message || 'Lên lịch thất bại');
      } finally {
        setScheduling(false);
      }
    }
  };

  const handleDeleteOldSlots = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa các ca khám cũ đã quá hạn không? Hành động này không thể hoàn tác.')) {
      setDeletingOldSlots(true);

      try {
        await deleteOldTimeSlots();

        toast.success('Xóa ca khám cũ thành công!');

        loadDashboard(true); // Làm mới dashboard để xem có log nào mới không
      } catch (e: any) {
        toast.error(e.response?.data?.message || 'Xóa ca khám cũ thất bại');
      } finally {
        setDeletingOldSlots(false);
      }
    }
  };

  const stats = [
    {
      icon: <CalendarCheck size={24} />,
      value: data?.todayAppointmentsCount ?? '—',
      label: 'Lịch hẹn hôm nay',
      color: 'blue' as const,
    },
    {
      icon: <Receipt size={24} />,
      value: data?.unpaidInvoicesCount ?? '—',
      label: 'Hóa đơn chờ thanh toán',
      color: 'orange' as const,
    },
    {
      icon: <MessageSquareText size={24} />,
      value: data?.unreadFeedbackCount ?? '—',
      label: 'Góp ý chưa đọc',
      color: 'red' as const,
    },
    {
      icon: <Users size={24} />,
      value: data?.patientsCount ?? '—',
      label: 'Tổng bệnh nhân',
      color: 'green' as const,
    },
  ];

  // FE tự sắp xếp theo thời gian mới nhất
  const sortedLogs = useMemo(() => {
    if (!data?.logs) {
      return [];
    }

    return [...data.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [data?.logs]);

  return (
    <>
      <Header title="Dashboard" subtitle="Tổng quan hệ thống" />
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px' }}>
          <button
            className="btn btn-danger"
            onClick={handleDeleteOldSlots}
            disabled={deletingOldSlots || scheduling}
          >
            <Trash2 size={18} style={{ marginRight: '8px' }} />
            {deletingOldSlots ? 'Đang xử lý...' : 'Xóa ca khám cũ'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSchedule}
            disabled={scheduling || deletingOldSlots}
          >
            <CalendarCheck size={18} style={{ marginRight: '8px' }} />
            {scheduling ? 'Đang xử lý...' : 'Tạo lịch khám tuần tới'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} loading={loading} />
          ))}
        </div>

        {/* Recent Activity - Logs */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
              Hoạt động gần đây
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              Làm mới
            </button>
          </div>

          {loading ? (
            <div className="log-list">
              {Array.from({ length: 5 }).map((_, i) => (
                <div className="log-row-skeleton" key={i}>
                  <div className="skeleton" style={{ width: '70px', height: '22px' }} />
                  <div className="skeleton" style={{ flex: 1, height: '16px' }} />
                  <div className="skeleton" style={{ width: '120px', height: '16px' }} />
                </div>
              ))}
            </div>
          ) : sortedLogs.length === 0 ? (
            <div className="empty-state">
              <CalendarCheck size={48} className="empty-state-icon" />
              <p className="empty-state-text">
                Không có cảnh báo hoặc lỗi nào trong ngày hôm nay. Hệ thống hoạt động bình thường!
              </p>
            </div>
          ) : (
            <div className="log-list">
              {sortedLogs.map((log, idx) => (
                <LogRow key={`${log.timestamp}-${idx}`} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
