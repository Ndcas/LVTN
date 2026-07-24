import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, X, Eye } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { ChangeRequest } from '../types';
import { fetchChangeRequests, getChangeRequestById, approveChangeRequest, rejectChangeRequest } from '../lib/api';

// ── Constants ──

const STATUS_CONFIG: Record<string, { label: string; color: 'orange' | 'green' | 'red' }> = {
  PENDING: {
    label: 'Chờ duyệt',
    color: 'orange'
  },
  APPROVED: {
    label: 'Đã duyệt',
    color: 'green'
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'red'
  },
};

const DAY_OF_WEEK_MAP: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
};

const CLINIC_TYPE_MAP: Record<string, { label: string; color: 'green' | 'blue' }> = {
  ONLINE: {
    label: 'Online',
    color: 'green'
  },
  OFFLINE: {
    label: 'Offline',
    color: 'blue'
  },
};

// ── Helper: Format time HH:MM:00 -> HH:MM ──
function fmtTime(t: string) {
  return t ? t.substring(0, 5) : '';
}

// ── Component ──

export default function ChangeRequestsPage() {
  // ── List state ──
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const limit = 10;

  // ── Detail modal state ──
  const [viewRequest, setViewRequest] = useState<ChangeRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Approve state ──
  const [approveTarget, setApproveTarget] = useState<ChangeRequest | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);

  // ── Reject state ──
  const [rejectTarget, setRejectTarget] = useState<ChangeRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // ── Fetch list ──
  const loadRequests = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetchChangeRequests({
        page,
        limit,
        status: filterStatus || undefined,
      });

      setRequests(res.data || []);

      setTotal(res.total || 0);

      setTotalPages(Math.ceil((res.total || 0) / limit) || 1);
    } catch {
      toast.error('Không thể tải danh sách yêu cầu đổi lịch');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // ── Open detail ──
  const openDetail = async (req: ChangeRequest) => {
    setDetailLoading(true);

    setViewRequest({
      ...req,
      details: undefined
    }); // show modal immediately

    try {
      const detail = await getChangeRequestById(req.id);

      setViewRequest(detail);
    } catch {
      toast.error('Không thể tải chi tiết yêu cầu đổi lịch');
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Approve ──
  const handleApprove = async () => {
    if (!approveTarget) {
      return;
    }

    setApproveLoading(true);

    try {
      await approveChangeRequest(approveTarget.id);

      toast.success('Đã duyệt yêu cầu đổi lịch');

      setApproveTarget(null);

      loadRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Duyệt yêu cầu thất bại');
    } finally {
      setApproveLoading(false);
    }
  };

  // ── Reject ──
  const openReject = (req: ChangeRequest) => {
    setRejectTarget(req);

    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectTarget) {
      return;
    }

    setRejectLoading(true);

    try {
      await rejectChangeRequest(rejectTarget.id, rejectReason.trim() || undefined);

      toast.success('Đã từ chối yêu cầu đổi lịch');

      setRejectTarget(null);

      loadRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Từ chối yêu cầu thất bại');
    } finally {
      setRejectLoading(false);
    }
  };

  // ── Columns ──
  const columns: Column<ChangeRequest>[] = [
    {
      key: 'doctor',
      header: 'Bác sĩ',
      render: (r) => (
        <div className="table-user-cell">
          <div className="table-avatar">{r.doctorName?.charAt(0)?.toUpperCase() || 'B'}</div>
          <div className="cell-main">{r.doctorName || `BS #${r.doctorId}`}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (r) => {
        const cfg = STATUS_CONFIG[r.status] ?? { label: r.status, color: 'orange' as const };
        return <Badge color={cfg.color}>{cfg.label}</Badge>;
      },
      width: '130px',
    },
    {
      key: 'createdAt',
      header: 'Ngày gửi',
      render: (r) => (r.createdAt ? dayjs(r.createdAt).format('DD/MM/YYYY') : '—'),
      width: '120px',
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
      render: (r) => (r.updatedAt ? dayjs(r.updatedAt).format('DD/MM/YYYY') : '—'),
      width: '120px',
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="cell-actions">
          <button
            className="action-btn"
            title="Xem chi tiết"
            onClick={() => openDetail(r)}
            style={{ fontSize: '0.75rem', padding: '4px 8px', whiteSpace: 'nowrap' }}
          >
            <Eye size={14} />
          </button>
          {r.status === 'PENDING' && (
            <>
              <button className="action-btn success" title="Duyệt" onClick={() => setApproveTarget(r)}>
                <CheckCircle size={15} />
              </button>
              <button className="action-btn danger" title="Từ chối" onClick={() => openReject(r)}>
                <XCircle size={15} />
              </button>
            </>
          )}
        </div>
      ),
      width: '140px',
    },
  ];

  return (
    <>
      <Header
        title="Yêu cầu đổi lịch"
        subtitle="Duyệt và quản lý yêu cầu đổi lịch làm việc của bác sĩ"
      />
      <div className="page-content">
        <div className="card">
          <DataTable<ChangeRequest>
            columns={columns}
            data={requests}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
            rowKey={(r) => r.id}
            filters={
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            }
          />
        </div>
      </div>

      {/* ── Modal Chi tiết ── */}
      {viewRequest && (
        <div className="modal-overlay" onClick={() => !detailLoading && setViewRequest(null)}>
          <div className="modal-container md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Chi tiết yêu cầu đổi lịch</h2>
              <button className="modal-close-btn" onClick={() => setViewRequest(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Doctor info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="table-avatar" style={{ width: 44, height: 44, fontSize: '1rem', flexShrink: 0 }}>
                  {viewRequest.doctorName?.charAt(0)?.toUpperCase() || 'B'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.9375rem' }}>
                    {viewRequest.doctorName || `Bác sĩ #${viewRequest.doctorId}`}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--neutral-400)', marginTop: 2 }}>
                    Gửi lúc: {viewRequest.createdAt ? dayjs(viewRequest.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  {(() => {
                    const cfg = STATUS_CONFIG[viewRequest.status] ?? { label: viewRequest.status, color: 'orange' as const };
                    return <Badge color={cfg.color}>{cfg.label}</Badge>;
                  })()}
                </div>
              </div>

              {/* Lý do từ chối */}
              {viewRequest.status === 'REJECTED' && viewRequest.rejectedReason && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>
                  <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--danger)' }}>
                    Lý do từ chối
                  </span>
                  <p style={{ marginTop: 6, fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--neutral-700)', whiteSpace: 'pre-line' }}>
                    {viewRequest.rejectedReason}
                  </p>
                </div>
              )}

              {/* Details table */}
              <div>
                <span className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px', color: 'var(--neutral-400)', display: 'block', marginBottom: 10 }}>
                  Lịch làm việc đề xuất
                </span>
                {detailLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--neutral-400)', padding: '16px 0' }}>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    <span style={{ fontSize: '0.875rem' }}>Đang tải...</span>
                  </div>
                ) : viewRequest.details && viewRequest.details.length > 0 ? (
                  <div style={{ border: '1px solid var(--neutral-200)', borderRadius: 8, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)' }}>
                          <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Ngày</th>
                          <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Giờ bắt đầu</th>
                          <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Giờ kết thúc</th>
                          <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Loại</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewRequest.details.map((d, idx) => (
                          <tr key={d.id ?? idx} style={{ borderBottom: idx < (viewRequest.details?.length ?? 0) - 1 ? '1px solid var(--neutral-100)' : 'none' }}>
                            <td style={{ padding: '9px 14px', fontSize: '0.9rem', color: 'var(--neutral-900)', fontWeight: 500 }}>{DAY_OF_WEEK_MAP[d.dayOfWeek] ?? `Thứ ${d.dayOfWeek}`}</td>
                            <td style={{ padding: '9px 14px', fontSize: '0.9rem', color: 'var(--neutral-700)' }}>{fmtTime(d.startTime)}</td>
                            <td style={{ padding: '9px 14px', fontSize: '0.9rem', color: 'var(--neutral-700)' }}>{fmtTime(d.endTime)}</td>
                            <td style={{ padding: '9px 14px' }}>
                              {(() => {
                                const ct = CLINIC_TYPE_MAP[d.clinicType];
                                return ct ? <Badge color={ct.color}>{ct.label}</Badge> : d.clinicType;
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--neutral-400)', fontSize: '0.9rem' }}>Không có dữ liệu chi tiết.</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewRequest(null)}>Đóng</button>
              {viewRequest.status === 'PENDING' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => { setViewRequest(null); setApproveTarget(viewRequest); }}
                  >
                    <CheckCircle size={14} /> Duyệt
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => { setViewRequest(null); openReject(viewRequest); }}
                  >
                    <XCircle size={14} /> Từ chối
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Duyệt ── */}
      {approveTarget && (
        <ConfirmModal
          title="Duyệt yêu cầu đổi lịch"
          message={`Bạn có chắc muốn duyệt yêu cầu đổi lịch của ${approveTarget.doctorName || `BS #${approveTarget.doctorId}`}?`}
          subMessage="Lịch làm việc mới sẽ được áp dụng cho bác sĩ này."
          confirmLabel="Duyệt"
          variant="info"
          loading={approveLoading}
          onConfirm={handleApprove}
          onClose={() => setApproveTarget(null)}
        />
      )}

      {/* ── Modal Từ chối ── */}
      {rejectTarget && (
        <div className="modal-overlay" onClick={() => !rejectLoading && setRejectTarget(null)}>
          <div className="modal-container sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Từ chối yêu cầu đổi lịch</h2>
              <button className="modal-close-btn" onClick={() => setRejectTarget(null)} disabled={rejectLoading}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, marginBottom: 16 }}>
                <XCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--neutral-900)', fontSize: '0.9375rem' }}>
                    {rejectTarget.doctorName || `BS #${rejectTarget.doctorId}`}
                  </p>
                  <p style={{ margin: '3px 0 0', color: 'var(--neutral-700)', fontSize: '0.875rem' }}>
                    Yêu cầu đổi lịch #{rejectTarget.id}
                  </p>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cr-reject-reason">
                  Lý do từ chối{' '}
                  <span style={{ color: 'var(--neutral-400)', fontWeight: 400, textTransform: 'none' }}>(tùy chọn)</span>
                </label>
                <textarea
                  id="cr-reject-reason"
                  className="form-input"
                  rows={3}
                  placeholder="Nhập lý do từ chối để thông báo cho bác sĩ..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  disabled={rejectLoading}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setRejectTarget(null)} disabled={rejectLoading}>Hủy</button>
              <button className="btn btn-danger" onClick={handleReject} disabled={rejectLoading}>
                {rejectLoading && <span className="spinner" />}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
