import { useState, useEffect, useCallback } from 'react';
import { FileText, DollarSign, X, CheckCircle } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable, { type Column } from '../components/DataTable';
import Badge from '../components/Badge';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import type { Invoice } from '../types';
import { fetchInvoices, getInvoiceById, markCashPaid } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function InvoicesPage() {
  const { user } = useAuth();

  // ── State ──
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const limit = 10;

  // Detail modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);

  // Pay modal
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  // ── Fetch Data ──
  const loadInvoices = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetchInvoices({
        page,
        limit,
        status: filterStatus || undefined,
      });

      setInvoices(res.data || []);

      setTotal(res.total || 0);

      setTotalPages(Math.ceil((res.total || 0) / limit) || 1);
    } catch {
      toast.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterStatus]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // ── Handlers ──
  const handleViewDetails = async (invoice: Invoice) => {
    setDetailLoadingId(invoice.id);

    try {
      const detail = await getInvoiceById(invoice.id);

      setSelectedInvoice(detail);
    } catch {
      toast.error('Không thể tải chi tiết hóa đơn');
    } finally {
      setDetailLoadingId(null);
    }
  };

  const closeDetails = () => {
    setSelectedInvoice(null);
  };

  const handlePayCash = async () => {
    if (!payTarget) {
      return;
    }

    setPayLoading(true);

    try {
      await markCashPaid(payTarget.id);

      toast.success('Đã xác nhận thanh toán tiền mặt');

      if (selectedInvoice && selectedInvoice.id === payTarget.id) {
        setSelectedInvoice({
          ...selectedInvoice,
          status: 'PAID'
        });
      }

      setPayTarget(null);

      loadInvoices();
    } catch {
      toast.error('Lỗi khi xác nhận thanh toán');
    } finally {
      setPayLoading(false);
    }
  };

  // ── Format Currency ──
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // ── Columns ──
  const columns: Column<Invoice>[] = [
    {
      key: 'id',
      header: 'Mã HĐ',
      width: '100px',
      render: (item) => <span style={{ fontWeight: 600, color: 'var(--neutral-700)' }}>#{item.id}</span>,
    },
    {
      key: 'patient',
      header: 'Mã bệnh nhân',
      render: (item) => (
        <div className="table-user-cell">
          <div>
            <div className="cell-main">{item.patientId}</div>
            <div className="cell-sub">Lịch hẹn #{item.bookingId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'examinationFee',
      header: 'Phí khám',
      width: '130px',
      render: (item) => formatCurrency(item.examinationFee),
    },
    {
      key: 'medicineFee',
      header: 'Phí thuốc',
      width: '130px',
      render: (item) => formatCurrency(item.medicineFee),
    },
    {
      key: 'totalAmount',
      header: 'Tổng tiền',
      width: '140px',
      render: (item) => <strong style={{ color: 'var(--danger)' }}>{formatCurrency(item.totalAmount)}</strong>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '130px',
      render: (item) =>
        item.status === 'PAID' ? (
          <Badge color="green" dot={false}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} /> Đã trả
            </span>
          </Badge>
        ) : (
          <Badge color="orange" dot={false}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign size={14} /> Chưa trả
            </span>
          </Badge>
        ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      width: '120px',
      render: (item) => (item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY') : '—'),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (item) => (
        <div className="cell-actions">
          <button
            className="action-btn"
            title="Xem chi tiết"
            onClick={() => handleViewDetails(item)}
            disabled={detailLoadingId === item.id}
            style={{ fontSize: '0.75rem', padding: '4px 8px', whiteSpace: 'nowrap' }}
          >
            {detailLoadingId === item.id ? 'Đang tải...' : 'Chi tiết'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header
        title="Hóa đơn thanh toán"
        subtitle="Quản lý và tra cứu các hóa đơn khám bệnh của bệnh nhân."
      />

      <div className="page-content">
        <div className="card">
          <DataTable
            columns={columns}
            data={invoices}
            loading={loading}
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
            filters={user?.roleId === 1 ?
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="0">Chưa trả</option>
                <option value="1">Đã trả</option>
              </select>
              : null}
            rowKey={item => item.id}
          />
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-container md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Chi tiết hóa đơn #{selectedInvoice.id}</h2>
              <button className="modal-close-btn" onClick={closeDetails}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px dashed var(--neutral-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="table-avatar" style={{ width: 48, height: 48, fontSize: '1.25rem', flexShrink: 0 }}>
                    {selectedInvoice.patientName?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: '1rem' }}>
                      {selectedInvoice.patientName || `Bệnh nhân #${selectedInvoice.patientId}`}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--neutral-400)', marginTop: 4 }}>
                      Lịch hẹn #{selectedInvoice.bookingId} • Tạo lúc: {selectedInvoice.createdAt ? dayjs(selectedInvoice.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
                    </div>
                  </div>
                </div>
                <div>
                  {selectedInvoice.status === 'PAID' ? (
                    <Badge color="green" dot={false}>Đã thanh toán</Badge>
                  ) : (
                    <Badge color="orange" dot={false}>Chưa thanh toán</Badge>
                  )}
                </div>
              </div>

              {/* Invoice Breakdown */}
              <div style={{ background: 'var(--neutral-50)', borderRadius: 8, padding: '16px' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-900)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} /> Chi tiết chi phí
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Phí khám bệnh</span>
                    <span style={{ fontWeight: 500, color: 'var(--neutral-900)' }}>{formatCurrency(selectedInvoice.examinationFee)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                    <span style={{ color: 'var(--neutral-500)' }}>Phí thuốc</span>
                    <span style={{ fontWeight: 500, color: 'var(--neutral-900)' }}>{formatCurrency(selectedInvoice.medicineFee)}</span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--neutral-200)', margin: '4px 0' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>Tổng thanh toán</span>
                    <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {/* Chỉ hiển thị nút thanh toán cho Nurse và khi hóa đơn chưa thanh toán */}
                {user?.roleId === 4 && selectedInvoice.status === 'UNPAID' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setPayTarget(selectedInvoice)}
                    style={{ background: 'var(--success)' }}
                  >
                    Xác nhận thanh toán tiền mặt
                  </button>
                )}
              </div>
              <button className="btn btn-outline" onClick={closeDetails}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Pay Confirm Modal ── */}
      {payTarget && (
        <ConfirmModal
          title="Xác nhận thanh toán"
          message={`Xác nhận đã nhận số tiền ${formatCurrency(payTarget.totalAmount)} từ bệnh nhân?`}
          subMessage="Hóa đơn sẽ được đánh dấu là Đã thanh toán và không thể hoàn tác thao tác này."
          confirmLabel="Xác nhận đã thu tiền"
          variant="info"
          loading={payLoading}
          onConfirm={handlePayCash}
          onClose={() => setPayTarget(null)}
        />
      )}
    </>
  );
}
