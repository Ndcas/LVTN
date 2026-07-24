import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { DoctorLeave } from '../types';
import { fetchLeaves, approveLeave, rejectLeave } from '../lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: 'orange' | 'green' | 'red' }> = {
  PENDING: {
    label: 'Chưa duyệt',
    color: 'orange'
  },
  APPROVED: {
    label: 'Đã duyệt',
    color: 'green'
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'red'
  }
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<DoctorLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const limit = 10;
  const [approveTarget, setApproveTarget] = useState<DoctorLeave | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<DoctorLeave | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [viewLeave, setViewLeave] = useState<DoctorLeave | null>(null);

  const loadLeaves = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetchLeaves({
        page,
        limit,
        status: filterStatus || undefined
      });

      setLeaves(res.data || []);

      setTotal(res.total || 0);

      setTotalPages(Math.ceil((res.total || 0) / limit) || 1);
    } catch {
      toast.error('Không thể tải danh sách đơn nghỉ phép');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleApprove = async () => {
    if (!approveTarget) {
      return;
    }

    setApproveLoading(true);

    try {
      await approveLeave(approveTarget.id);

      toast.success('Đã duyệt đơn nghỉ phép');

      setApproveTarget(null);

      loadLeaves();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Duyệt đơn thất bại');
    } finally {
      setApproveLoading(false);
    }
  };

  const openReject = (leave: DoctorLeave) => {
    setRejectTarget(leave);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectTarget) {
      return;
    }

    setRejectLoading(true);

    try {
      await rejectLeave(rejectTarget.id, rejectReason.trim() || undefined);

      toast.success('Đã từ chối đơn nghỉ phép');

      setRejectTarget(null);

      loadLeaves();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Từ chối đơn thất bại');
    } finally {
      setRejectLoading(false);
    }
  };

  const columns: Column<DoctorLeave>[] = [
    {
      key: 'doctor',
      header: 'Bác sĩ',
      render: (l) => (
        <div className="table-user-cell">
          <div className="table-avatar">{l.doctorName?.charAt(0)?.toUpperCase() || 'B'}</div>
          <div className="cell-main">{l.doctorName || `BS #${l.doctorId}`}</div>
        </div>
      ),
    },
    {
      key: 'leaveDate',
      header: 'Ngày nghỉ',
      render: (l) => dayjs(l.leaveDate).format('DD/MM/YYYY'),
      width: '130px',
    },
    {
      key: 'reason',
      header: 'Lý do',
      render: (l) => (
        <div style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--neutral-700)' }} title={l.reason}>
          {l.reason}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (l) => {
        const cfg = STATUS_CONFIG[l.status] ?? { label: l.status, color: 'orange' as const };
        return <Badge color={cfg.color}>{cfg.label}</Badge>;
      },
      width: '130px',
    },
    {
      key: 'createdAt',
      header: 'Ngày gửi',
      render: (l) => (l.createdAt ? dayjs(l.createdAt).format('DD/MM/YYYY') : '—'),
      width: '120px',
    },
    {
      key: 'actions',
      header: '',
      render: (l) => (
        <div className="cell-actions">
          <button className="action-btn" title="Xem chi tiết" onClick={() => setViewLeave(l)} style={{ fontSize: '0.75rem', padding: '4px 8px', whiteSpace: 'nowrap' }}>Chi tiết</button>
          {l.status === 'PENDING' && (
            <>
              <button className="action-btn success" title="Duyệt đơn" onClick={() => setApproveTarget(l)}><CheckCircle size={15} /></button>
              <button className="action-btn danger" title="Từ chối đơn" onClick={() => openReject(l)}><XCircle size={15} /></button>
            </>
          )}
        </div>
      ),
      width: '160px',
    },
  ];

  return (
    <>
      <Header title="Đơn nghỉ phép" subtitle="Duyệt và quản lý đơn xin nghỉ phép của bác sĩ" />
      <div className="page-content">
        <div className="card">
          <DataTable<DoctorLeave>
            columns={columns}
            data={leaves}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
            rowKey={(l) => l.id}
            filters={
              <select className="filter-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            }
          />
        </div>
      </div>

      {viewLeave && (
        <div className="modal-overlay" onClick={() => setViewLeave(null)}>
          <div className="modal-container sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Chi tiết đơn nghỉ phép</h2>
              <button className="modal-close-btn" onClick={() => setViewLeave(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="table-avatar" style={{ width: 44, height: 44, fontSize: '1rem', flexShrink: 0 }}>
                  {viewLeave.doctorName?.charAt(0)?.toUpperCase() || 'B'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.9375rem' }}>{viewLeave.doctorName || `Bác sĩ #${viewLeave.doctorId}`}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--neutral-400)', marginTop: 2 }}>Gửi lúc: {viewLeave.createdAt ? dayjs(viewLeave.createdAt).format('DD/MM/YYYY') : '—'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <LeaveDetailRow label="Ngày nghỉ" value={dayjs(viewLeave.leaveDate).format('DD/MM/YYYY')} />
                <LeaveDetailRow label="Trạng thái" value={STATUS_CONFIG[viewLeave.status]?.label || viewLeave.status} />
              </div>
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--neutral-400)' }}>Lý do xin nghỉ</span>
                <p style={{ marginTop: 6, fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--neutral-700)', whiteSpace: 'pre-line', background: 'var(--neutral-50)', border: '1px solid var(--neutral-200)', borderRadius: 8, padding: '10px 14px' }}>{viewLeave.reason}</p>
              </div>
              {viewLeave.status === 'REJECTED' && viewLeave.rejectedReason && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>
                  <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--danger)' }}>Lý do từ chối</span>
                  <p style={{ marginTop: 6, fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--neutral-700)', whiteSpace: 'pre-line' }}>{viewLeave.rejectedReason}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewLeave(null)}>Đóng</button>
              {viewLeave.status === 'PENDING' && (
                <>
                  <button className="btn btn-primary" onClick={() => { setViewLeave(null); setApproveTarget(viewLeave); }}><CheckCircle size={14} />Duyệt</button>
                  <button className="btn btn-danger" onClick={() => { setViewLeave(null); openReject(viewLeave); }}><XCircle size={14} />Từ chối</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {approveTarget && (
        <ConfirmModal
          title="Duyệt đơn nghỉ phép"
          message={`Bạn có chắc muốn duyệt đơn nghỉ ngày ${dayjs(approveTarget.leaveDate).format('DD/MM/YYYY')} của ${approveTarget.doctorName || `BS #${approveTarget.doctorId}`}?`}
          subMessage="Bác sĩ sẽ được nghỉ vào ngày này."
          confirmLabel="Duyệt"
          variant="info"
          loading={approveLoading}
          onConfirm={handleApprove}
          onClose={() => setApproveTarget(null)}
        />
      )}

      {rejectTarget && (
        <div className="modal-overlay" onClick={() => !rejectLoading && setRejectTarget(null)}>
          <div className="modal-container sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Từ chối đơn nghỉ phép</h2>
              <button className="modal-close-btn" onClick={() => setRejectTarget(null)} disabled={rejectLoading}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: 16 }}>
                <XCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.9375rem' }}>{rejectTarget.doctorName || `BS #${rejectTarget.doctorId}`}</p>
                  <p style={{ margin: '3px 0 0', color: 'var(--neutral-700)', fontSize: '0.875rem' }}>Ngày nghỉ: <strong>{dayjs(rejectTarget.leaveDate).format('DD/MM/YYYY')}</strong></p>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reject-reason">Lý do từ chối <span style={{ color: 'var(--neutral-400)', fontWeight: 400, textTransform: 'none' }}>(tùy chọn)</span></label>
                <textarea id="reject-reason" className="form-input" rows={3} placeholder="Nhập lý do từ chối để thông báo cho bác sĩ..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} disabled={rejectLoading} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setRejectTarget(null)} disabled={rejectLoading}>Hủy</button>
              <button className="btn btn-danger" onClick={handleReject} disabled={rejectLoading}>{rejectLoading && <span className="spinner" />}Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LeaveDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--neutral-400)' }}>{label}</span>
      <span style={{ fontSize: '0.9375rem', color: 'var(--neutral-900)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
